from fastapi import FastAPI, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
import os
import base64
import io
import edge_tts

from .database import engine, Base, get_db, SessionLocal
from .models import Article, RSSSource, BriefingCache
from .scraper import scan_news, scan_single_feed
from .ai_agent import generate_master_briefing

# Veritabanı tablolarını oluştur
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Hype News API")

# CORS yapılandırması
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def generate_tts_base64(text: str):
    """Generates TTS audio and returns it as a base64 string."""
    try:
        communicate = edge_tts.Communicate(text, "tr-TR-EmelNeural", rate="+10%")
        audio_stream = io.BytesIO()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_stream.write(chunk["data"])
        return base64.b64encode(audio_stream.getvalue()).decode('utf-8')
    except Exception as e:
        print(f"TTS generation error: {e}")
        return None

@app.get("/api/articles")
def read_articles(skip: int = 0, limit: int = 50, category: str = None, db: Session = Depends(get_db)):
    query = db.query(Article)
    if category and category != "Tümü" and category != "Kaydedilenler":
        query = query.filter(Article.category == category)
    articles = query.order_by(Article.published_at.desc()).offset(skip).limit(limit).all()
    return articles

@app.get("/api/briefing")
async def get_daily_briefing(category: str = "Tümü", db: Session = Depends(get_db)):
    #DB Cache kontrolü
    cached = db.query(BriefingCache).filter(BriefingCache.category == category).first()
    if cached:
        return {
            "briefing": cached.text,
            "has_audio": cached.audio_base64 is not None
        }

    # Eğer cache yoksa (Failsafe)
    query = db.query(Article)
    if category and category != "Tümü" and category != "Kaydedilenler":
        query = query.filter(Article.category == category)
        
    latest_articles = query.order_by(Article.published_at.desc()).limit(10).all()
    if not latest_articles:
        return {"briefing": f"{category} kategorisinde henüz özetlenecek haber yok."}
    
    briefing_text = generate_master_briefing(latest_articles, category)
    return {"briefing": briefing_text, "has_audio": False}

@app.get("/api/tts")
async def get_tts(category: str = "Tümü", db: Session = Depends(get_db)):
    """Streaming TTS from cache or on-demand."""
    cached = db.query(BriefingCache).filter(BriefingCache.category == category).first()
    
    if cached and cached.audio_base64:
        audio_data = base64.b64decode(cached.audio_base64)
        return StreamingResponse(io.BytesIO(audio_data), media_type="audio/mpeg")
    
    # Fallback: On-demand generation (if not in cache)
    if not cached:
        return {"error": "Özet henüz hazır değil."}
    
    audio_b64 = await generate_tts_base64(cached.text)
    if audio_b64:
        # Cache'e kaydet
        cached.audio_base64 = audio_b64
        db.commit()
        return StreamingResponse(io.BytesIO(base64.b64decode(audio_b64)), media_type="audio/mpeg")
    
    return {"error": "TTS üretilemedi."}

@app.get("/api/cron")
async def cron_job(secret: str = None, db: Session = Depends(get_db)):
    """Vercel Cron endpoint. Protected by CRON_SECRET."""
    actual_secret = os.getenv("CRON_SECRET", "default_secret_change_me")
    
    if secret != actual_secret:
        return {"status": "error", "message": "Unauthorized: Invalid secret."}

    print("Cron job started...")
    try:
        # 1. Haberleri tara
        scan_news()
        
        # 2. Kategoriler için özet ve podcast oluştur
        categories = ["Tümü", "Gündem", "Teknoloji", "Ekonomi", "Spor", "Bilim", "Robotik", "Hype Tech", "Yapay Zeka"]
        
        for cat in categories:
            query = db.query(Article)
            if cat != "Tümü":
                query = query.filter(Article.category == cat)
            
            latest = query.order_by(Article.published_at.desc()).limit(10).all()
            if latest:
                text = generate_master_briefing(latest, cat)
                if text and "hata oluştu" not in text:
                    audio_b64 = await generate_tts_base64(text)
                    
                    # Update cache
                    cached = db.query(BriefingCache).filter(BriefingCache.category == cat).first()
                    if cached:
                        cached.text = text
                        cached.audio_base64 = audio_b64
                    else:
                        new_cache = BriefingCache(category=cat, text=text, audio_base64=audio_b64)
                        db.add(new_cache)
                    db.commit()
        
        return {"status": "success", "message": "News scanned and podcasts pre-generated."}
    except Exception as e:
        return {"status": "error", "message": f"Global cron error: {str(e)}"}

# === CUSTOM RSS SOURCE MANAGEMENT ===
class AddSourceRequest(BaseModel):
    name: str
    url: str
    category: str

@app.get("/api/sources")
def get_sources(db: Session = Depends(get_db)):
    sources = db.query(RSSSource).order_by(RSSSource.added_at.desc()).all()
    return sources

@app.post("/api/sources")
def add_source(req: AddSourceRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    existing = db.query(RSSSource).filter(RSSSource.url == req.url).first()
    if existing:
        return {"message": "Bu kaynak zaten ekli.", "source": existing}
    
    new_source = RSSSource(name=req.name, url=req.url, category=req.category)
    db.add(new_source)
    db.commit()
    db.refresh(new_source)
    
    # Hemen bu kaynağı tara
    def scan_new():
        sdb = SessionLocal()
        scan_single_feed(sdb, req.name, req.url, forced_category=req.category)
        sdb.close()
    background_tasks.add_task(scan_new)
    
    return {"message": f"'{req.name}' kaynağı eklendi!", "source": new_source}

@app.delete("/api/sources/{source_id}")
def delete_source(source_id: int, db: Session = Depends(get_db)):
    source = db.query(RSSSource).filter(RSSSource.id == source_id).first()
    if not source:
        return {"message": "Kaynak bulunamadı."}
    db.delete(source)
    db.commit()
    return {"message": "Kaynak silindi."}
