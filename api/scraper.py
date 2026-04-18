import logging
import feedparser
import time
from datetime import datetime
from time import mktime
from bs4 import BeautifulSoup

from .database import SessionLocal
from .models import Article, RSSSource
from .ai_agent import summarize_article

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Varsayılan devasa RSS kaynakları - her kategori için
DEFAULT_FEEDS = {
    # === GÜNDEM ===
    "Gündem": [
        ("NTV", "https://www.ntv.com.tr/gundem.rss"),
        ("Sözcü", "https://www.sozcu.com.tr/rss/gundem.xml"),
        ("Hürriyet", "https://www.hurriyet.com.tr/rss/gundem"),
        ("CNN Türk", "https://www.cnnturk.com/feed/rss/turkiye/news"),
    ],
    # === TEKNOLOJİ ===
    "Teknoloji": [
        ("TechCrunch", "https://techcrunch.com/feed/"),
        ("The Verge", "https://www.theverge.com/rss/index.xml"),
        ("Wired", "https://www.wired.com/feed/rss"),
        ("Ars Technica", "https://feeds.arstechnica.com/arstechnica/index"),
        ("Webtekno", "https://www.webtekno.com/rss.xml"),
        ("Shiftdelete", "https://shiftdelete.net/feed"),
        ("Donanım Haber", "https://www.donanimhaber.com/rss/tum/"),
    ],
    # === EKONOMİ ===
    "Ekonomi": [
        ("Bloomberg HT", "https://www.bloomberght.com/rss"),
        ("NTV Ekonomi", "https://www.ntv.com.tr/ekonomi.rss"),
        ("Hürriyet Ekonomi", "https://www.hurriyet.com.tr/rss/ekonomi"),
    ],
    # === SPOR ===
    "Spor": [
        ("NTV Spor", "https://www.ntvspor.net/rss"),
        ("Fanatik", "https://www.fanatik.com.tr/rss"),
        ("Hürriyet Spor", "https://www.hurriyet.com.tr/rss/spor"),
    ],
    # === BİLİM ===
    "Bilim": [
        ("Science Daily", "https://www.sciencedaily.com/rss/all.xml"),
        ("New Scientist", "https://www.newscientist.com/feed/home/"),
        ("Phys.org", "https://phys.org/rss-feed/"),
    ],
    # === ROBOTİK ===
    "Robotik": [
        ("IEEE Spectrum Robotics", "https://spectrum.ieee.org/feeds/topic/robotics.rss"),
        ("The Robot Report", "https://www.therobotreport.com/feed/"),
        ("Robotics Business Review", "https://www.roboticsbusinessreview.com/feed/"),
    ],
    # === VIBE CODING / YAZILIM ===
    "Vibe Coding": [
        ("HackerNews", "https://hnrss.org/frontpage"),
        ("Dev.to", "https://dev.to/feed"),
        ("GitHub Blog", "https://github.blog/feed/"),
        ("CSS Tricks", "https://css-tricks.com/feed/"),
    ],
    # === YAPAY ZEKA ===
    "Yapay Zeka": [
        ("MIT Tech Review AI", "https://www.technologyreview.com/feed/"),
        ("VentureBeat AI", "https://venturebeat.com/category/ai/feed/"),
        ("OpenAI Blog", "https://openai.com/blog/rss.xml"),
    ],
}

def clean_html(raw_html):
    if not raw_html: return ""
    soup = BeautifulSoup(raw_html, "html.parser")
    return soup.get_text(separator=' ', strip=True)

def parse_date(entry):
    """RSS entry'sinden doğru tarihi çıkart."""
    if hasattr(entry, 'published_parsed') and entry.published_parsed:
        try:
            return datetime.fromtimestamp(mktime(entry.published_parsed))
        except:
            pass
    if hasattr(entry, 'updated_parsed') and entry.updated_parsed:
        try:
            return datetime.fromtimestamp(mktime(entry.updated_parsed))
        except:
            pass
    return datetime.now()

def scan_single_feed(db, source_name: str, feed_url: str, forced_category: str = None):
    """Tek bir RSS kaynağını tarar ve veritabanına kaydeder."""
    try:
        logger.info(f"Parsing feed: {source_name} ({feed_url})")
        feed = feedparser.parse(
            feed_url, 
            agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            request_headers={'Accept': 'application/rss+xml, application/xml, text/xml, */*'}
        )
        
        if not feed.entries:
            logger.warning(f"No entries found in feed: {source_name}")
            return 0
        
        count = 0
        for entry in feed.entries[:20]:
            link = entry.get('link', '')
            title = entry.get('title', '')
            
            if not link or not title: continue
            
            # DB'de var mı kontrol et
            existing = db.query(Article).filter(Article.url == link).first()
            if existing:
                continue
            
            description = entry.get('description', '') or entry.get('summary', '')
            content_html = ''
            if 'content' in entry and len(entry.content) > 0:
                content_html = entry.content[0].value
            
            raw_text = content_html if len(content_html) > len(description) else description
            clean_text = clean_html(raw_text)
            
            if len(clean_text) < 30:
                continue  # Boş veya çok kısa içerikleri atla
            
            # Kategori: forced_category varsa onu kullan, yoksa heuristic
            text_lower = (title + " " + clean_text).lower()
            is_vibe = "hype" in text_lower or "coding" in text_lower or "developer" in text_lower or "ai agent" in text_lower or "cursor" in text_lower or "copilot" in text_lower
            is_robotics = "robot" in text_lower or "automation" in text_lower

            if forced_category:
                category = forced_category
            elif is_robotics:
                category = "Robotik"
            elif is_vibe:
                category = "Hype Tech"
            elif "ai" in text_lower or "artificial intelligence" in text_lower or "yapay zeka" in text_lower:
                category = "Yapay Zeka"
            else:
                category = "Teknoloji"
            
            # Tarih
            pub_date = parse_date(entry)
            
            # Groq AI ile özetle
            summary = summarize_article(title, clean_text[:3000])
            if not summary:
                summary = clean_text[:250] + "..."
                
            article = Article(
                title=title,
                url=link,
                source=source_name,
                category=category,
                content=clean_text[:5000],
                summary=summary,
                published_at=pub_date,
                is_vibe_coding=is_vibe,
                is_robotics=is_robotics
            )
            db.add(article)
            db.commit()
            count += 1
            
            time.sleep(0.8)  # Groq rate limit koruması
            
    except Exception as e:
        logger.error(f"Error scanning feed '{source_name}': {e}")
        return 0
    
    return count

def scan_news():
    """Tüm varsayılan ve kullanıcı eklediği kaynakları tarar."""
    logger.info("=== BÜYÜK TARAMA BAŞLADI ===")
    db = SessionLocal()
    total = 0
    
    # 1) Varsayılan kaynakları tara
    for category, feeds in DEFAULT_FEEDS.items():
        for source_name, feed_url in feeds:
            count = scan_single_feed(db, source_name, feed_url, forced_category=category)
            total += count
    
    # 2) Kullanıcının eklediği custom RSS kaynakları
    custom_sources = db.query(RSSSource).all()
    for src in custom_sources:
        count = scan_single_feed(db, src.name, src.url, forced_category=src.category)
        total += count
    
    db.close()
    logger.info(f"=== TARAMA TAMAMLANDI: {total} yeni haber eklendi ===")
