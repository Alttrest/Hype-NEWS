import os
import logging
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

API_KEY = os.getenv("GROQ_API_KEY")

if API_KEY and API_KEY != "your_groq_api_key_here":
    client = Groq(api_key=API_KEY)
else:
    client = None

def summarize_article(title: str, content: str) -> str:
    if not client:
        logger.warning("Groq API Key is not set or valid. Skipping summarization.")
        return None
        
    prompt = f"""Lütfen aşağıdaki teknoloji haberini / makaleyi Türkçe olarak en fazla 2-3 cümlede özetle. Etkileyici bir dil kullan.
Haber Başlığı: {title}
Haber İçeriği: {content[:2000]}
"""

    try:
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "Sen usta bir teknoloji editörüsün. Kısa, öz ve dikkat çekici özetler çıkarırsın."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.4,
            max_tokens=256,
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Groq summarize error: {e}")
        return None

def generate_master_briefing(articles: list, category: str = "Tümü") -> str:
    """Takes a list of Article objects and creates a daily briefing."""
    if not client:
        return "Günün Büyük Özeti: Güçlü bir yapay zeka entegrasyonu kurmak için Lütfen .env dosyasındaki GROQ_API_KEY bilginizi doldurun."
        
    if not articles:
        return f"{category} kategorisinde şu anda gündemi özetleyecek yeterli haber verisi bulunmuyor."
        
    combo_text = ""
    for a in articles[:10]:
        combo_text += f"- {a.title}: {a.summary}\n"
        
    extra_instruction = ""
    if category == "Vibe Coding":
        extra_instruction = "Özetin içinde son dönem popülerleşen Vibe Coding araçlarını (Cursor, Windsurf, Claude Code, Devin, GitHub Copilot, Bolt, v0 gibi) ve güncel AI agent'larını ayrıca vurgula."
        
    prompt = f"""Aşağıdaki '{category}' haber listesini incele. 
GÖREVİN: Sadece ve sadece haberleri '•' işaretiyle başlayan maddeler halinde özetlemek.

KRİTİK KURALLAR:
1. HİÇBİR GİRİŞ CÜMLESİ YAZMA (Örn: 'İşte haberler:', 'Aşağıda listelenmiştir' gibi laflar YASAK).
2. HİÇBİR NUMARALANDIRMA VEYA ETİKET KULLANMA (Örn: '1.', 'Madde 1:', 'Haber 1:' gibi ifadeler YASAK).
3. HER HABERİ '•' İŞARETİYLE BAŞLAT.
4. HER MADDE EN FAZLA BİR CÜMLE OLSUN.
5. Sadece doğrudan özetleri ver.

{extra_instruction}

Haber Listesi:
{combo_text}
"""
    try:
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": f"Sen kelimesi kelimesine talimatlara uyan, asla gereksiz kelime kullanmayan, sadece '•' ile başlayan maddeler üreten bir robotsun. Giriş, sonuç veya madde başlığı kesinlikle yasaktır."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.3,
            max_tokens=600,
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Groq briefing error: {e}")
        return "Büyük özet hazırlanırken bir hata oluştu."

