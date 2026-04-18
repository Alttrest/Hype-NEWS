# 🌊 Hype News: AI-Powered News Aggregator

```text
  _    _                      _   _                      
 | |  | |                    | \ | |                     
 | |__| |_   _ _ __   ___    |  \| | _____      _____  
 |  __  | | | | '_ \ / _ \   | . ` |/ _ \ \ /\ / / __| 
 | |  | | |_| | |_) |  __/   | |\  |  __/\ V  V /\__ \ 
 |_|  |_|\__, | .__/ \___|   |_| \_|\___| \_/\_/ |___/ 
          __/ | |                                      
         |___/|_|                                      
```

Hype News, geleneksel haber okuma deneyimini modern, interaktif ve yapay zeka destekli bir dijital sanat eserine dönüştüren yeni nesil bir haber istasyonudur.

## ✨ Öne Çıkan Özellikler

- **🤖 AI Master Briefing**: Günün on binlerce haberini analiz eder ve size her kategori için kristal netliğinde, madde madde özetler sunar.
- **🎙️ Instant Podcasts**: Yapay zekanın oluşturduğu özetleri beklemek zorunda kalmadan, arka planda önceden hazırlanmış yüksek kaliteli seslendirmeleri (TTS) anında dinleyin.
- **💎 Premium UI/UX**:
  - **Liquid Glass Loading**: Three.js tabanlı metaball animasyonlu açılış ekranı.
  - **Apple-Style Glassmorphism**: Safari uyumlu, bulanık ve şeffaf arayüz detayları.
  - **Dark Mode**: Göz yormayan, derin mavilerle tasarlanmış karanlık tema.
- **🌐 Otonom Tarayıcı**: 30'dan fazla RSS kaynağını ve senin eklediğin özel kaynakları her 30 dakikada bir otonom olarak tarar.
- **☁️ Vercel Ready**: Serverless mimari ve Vercel Cron entegrasyonu ile yayına hazır yapı.

## 🛠️ Teknoloji Yığını

- **Backend**: FastAPI (Python), SQLAlchemy, SQLite, Groq Cloud (Llama 3.1 8B), Edge-TTS.
- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons.
- **Animasyon**: Three.js, Anime.js, Framer Motion.

## 🚀 Hızlı Başlangıç (Yerel Kurum)

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/alitoran/hype-news.git
cd hype-news
```

### 2. Backend Kurulumu
```bash
# Sanal ortam oluşturun
python -m venv venv
source venv/bin/activate  # Windows için: .\venv\Scripts\activate

# Bağımlılıkları yükleyin
pip install -r api/requirements.txt

# .env dosyasını oluşturun ve anahtarlarınızı ekleyin
echo "GROQ_API_KEY=your_key_here" > .env
echo "CRON_SECRET=your_secure_secret" >> .env
```

### 3. Frontend Kurulumu
```bash
cd react-app
npm install
npm run dev
```

## ☁️ Vercel Deployment

1. Projeyi GitHub'a yükleyin.
2. Vercel üzerinden projeyi bağlayın.
3. **Environment Variables** kısmına şunları ekleyin:
   - `GROQ_API_KEY`: Groq Cloud API anahtarınız.
   - `CRON_SECRET`: /api/cron endpoint'ini korumak için seçeceğiniz gizli şifre.
4. **Vercel Settings > Cron Jobs**: `/api/cron?secret=YOUR_SECRET` adresini saatlik çalışacak şekilde kurun.

## 🛡️ Güvenlik Önemleri

- **Endpoint Protection**: `/api/cron` endpoint'is `CRON_SECRET` ile korunmaktadır, yetkisiz tarama tetiklenemez.
- **CORS Configuration**: Güvenli kökler arası kaynak paylaşımı yapılandırılmıştır.
- **Environment Parity**: Hassas veriler asla kodun içinde barındırılmaz, `.env` üzerinden yönetilir.

---

Özel bir tutku projesi olarak **Ali TURAN** ([@alttre.sh](https://www.instagram.com/alttre.sh/)) tarafından geliştirilmiştir. 💎📈
