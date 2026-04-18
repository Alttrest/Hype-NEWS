from fastapi import FastAPI, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os
import threading
import time

from .database import engine, Base, get_db
from .models import Article, RSSSource
from .scraper import scan_news, scan_single_feed

# Veritabanı tablolarını oluştur
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Vibe News API")

# CORS yapılandırması
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def scheduled_job():
    while True:
        try:
            scan_news()
            # Her başarılı taramadan sonra özet cache'ini temizle
            briefing_cache.clear()
        except Exception as e:
            print("Job error:", e)
        time.sleep(1800)  # Her 30 dakikada bir tarama yap

# Arka plan tarama işlemini başlat
threading.Thread(target=scheduled_job, daemon=True).start()

@app.get("/api/articles")
def read_articles(skip: int = 0, limit: int = 50, category: str = None, db: Session = Depends(get_db)):
    query = db.query(Article)
    if category and category != "Tümü" and category != "Kaydedilenler":
        query = query.filter(Article.category == category)
    articles = query.order_by(Article.published_at.desc()).offset(skip).limit(limit).all()
    return articles

# Basit bir briefing önbelleği (Cache)
briefing_cache = {}

@app.get("/api/briefing")
def get_daily_briefing(category: str = "Tümü", db: Session = Depends(get_db)):
    from .ai_agent import generate_master_briefing
    
    # Cache kontrolü
    if category in briefing_cache:
        # Önbellekteki verinin son 10 dakika içinde olup olmadığına dair basit bir kontrol eklenebilir
        # Şimdilik her taramada temizlenecek şekilde kuralım
        return {"briefing": briefing_cache[category]}

    query = db.query(Article)
    if category and category != "Tümü" and category != "Kaydedilenler":
        query = query.filter(Article.category == category)
        
    latest_articles = query.order_by(Article.published_at.desc()).limit(10).all()
    if not latest_articles:
        return {"briefing": f"{category} kategorisinde şu anda gündemi özetleyecek yeterli haber verisi bulunmuyor."}
    
    briefing_text = generate_master_briefing(latest_articles, category)
    
    # Başarılı ise cache'e yaz
    if "hata oluştu" not in briefing_text:
        briefing_cache[category] = briefing_text
        
    return {"briefing": briefing_text}

@app.get("/api/tts")
async def get_tts(text: str):
    import edge_tts
    import io
    from fastapi.responses import StreamingResponse
    
    try:
        # Kız sesi: tr-TR-EmelNeural
        communicate = edge_tts.Communicate(text, "tr-TR-EmelNeural", rate="+10%")
        audio_stream = io.BytesIO()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_stream.write(chunk["data"])
        audio_stream.seek(0)
        return StreamingResponse(audio_stream, media_type="audio/mpeg")
    except Exception as e:
        return {"error": str(e)}

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
    # Duplicate kontrolü
    existing = db.query(RSSSource).filter(RSSSource.url == req.url).first()
    if existing:
        return {"message": "Bu kaynak zaten ekli.", "source": existing}
    
    new_source = RSSSource(name=req.name, url=req.url, category=req.category)
    db.add(new_source)
    db.commit()
    db.refresh(new_source)
    
    # Hemen bu kaynağı tara
    from .database import SessionLocal
    def scan_new():
        sdb = SessionLocal()
        scan_single_feed(sdb, req.name, req.url, forced_category=req.category)
        sdb.close()
        # Yeni haberler geldiği için cache'i temizle
        briefing_cache.clear()
    background_tasks.add_task(scan_new)
    
    return {"message": f"'{req.name}' kaynağı '{req.category}' kategorisine eklendi ve taranıyor!", "source": new_source}

@app.delete("/api/sources/{source_id}")
def delete_source(source_id: int, db: Session = Depends(get_db)):
    source = db.query(RSSSource).filter(RSSSource.id == source_id).first()
    if not source:
        return {"message": "Kaynak bulunamadı."}
    db.delete(source)
    db.commit()
    return {"message": "Kaynak silindi."}

@app.post("/api/scan")
def trigger_scan(background_tasks: BackgroundTasks):
    background_tasks.add_task(scan_news)
    return {"message": "Haber taraması arka planda başlatıldı."}

# Frontend dosyalarını sunma
frontend_path = os.path.join(os.path.dirname(__file__), "..", "react-app", "dist")
if os.path.exists(frontend_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_path, "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        target_path = os.path.join(frontend_path, full_path)
        if os.path.exists(target_path) and os.path.isfile(target_path):
            return FileResponse(target_path)
        return FileResponse(os.path.join(frontend_path, "index.html"))
