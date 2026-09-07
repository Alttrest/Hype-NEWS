<p align="center">\n  <img src="https://raw.githubusercontent.com/Alttrest/Hype-NEWS/main/banner.jpeg" width="100%" alt="Project Banner" />\n</p>\n\n<div align="center">
  
# ✨ Hype-NEWS ✨

![GitHub Repo stars](https://img.shields.io/github/stars/Alttrest/Hype-NEWS?style=for-the-badge&color=yellow)
![GitHub forks](https://img.shields.io/github/forks/Alttrest/Hype-NEWS?style=for-the-badge&color=blue)
![GitHub last commit](https://img.shields.io/github/last-commit/Alttrest/Hype-NEWS?style=for-the-badge&color=green)
![GitHub top language](https://img.shields.io/github/languages/top/Alttrest/Hype-NEWS?style=for-the-badge&color=red)

<br/>

  <!-- GitHub Repo Pin Card SVG -->
  <img src="https://github-readme-svg-ten.vercel.app/api?username=Alttrest&repo=Hype-NEWS&theme=dark" alt="Repo Stats" />

</div>

<br/>

## 📸 Screenshots

<div align="center">
  <table>
    <tr>
      <td><img src="https://placehold.co/600x400/1e1e2e/cdd6f4?text=Screenshot+1" alt="Screenshot 1" width="400"/></td>
      <td><img src="https://placehold.co/600x400/1e1e2e/cdd6f4?text=Screenshot+2" alt="Screenshot 2" width="400"/></td>
    </tr>
    <tr>
      <td><img src="https://placehold.co/600x400/1e1e2e/cdd6f4?text=Screenshot+3" alt="Screenshot 3" width="400"/></td>
      <td><img src="https://placehold.co/600x400/1e1e2e/cdd6f4?text=Screenshot+4" alt="Screenshot 4" width="400"/></td>
    </tr>
  </table>
  <p><i>Screenshots of the project in action.</i></p>
</div>

---

<div align="center">
  <h1>✨ Hype-NEWS ✨</h1>
  <p><i>Hype News, geleneksel haber okuma deneyimini modern, interaktif ve yapay zeka destekli bir dijital sanat eserine dönüştüren yeni nesil bir haber istasyonudur.</i></p>

  <!-- Badges -->
  <img src="https://img.shields.io/github/languages/top/Alttrest/Hype-NEWS?style=for-the-badge&color=blue" alt="Top Language" />
  <img src="https://img.shields.io/github/repo-size/Alttrest/Hype-NEWS?style=for-the-badge" alt="Repo Size" />
  <img src="https://img.shields.io/github/last-commit/Alttrest/Hype-NEWS?style=for-the-badge" alt="Last Commit" />
</div>

<br />

# 🌊 Hype News: AI-Powered News Aggregator

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
