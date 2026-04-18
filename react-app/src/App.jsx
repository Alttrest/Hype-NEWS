import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CategoryMenu from './components/CategoryMenu';
import NewsGrid from './components/NewsGrid';
import ArticleModal from './components/ArticleModal';
import DailyBriefing from './components/DailyBriefing';
import AddSourceModal from './components/AddSourceModal';
import LoadingScreen from './components/LoadingScreen';
import Footer from './components/Footer';

const CATEGORIES = ["Tümü", "Kaydedilenler", "Gündem", "Teknoloji", "Ekonomi", "Spor", "Bilim", "Robotik", "Hype Tech", "Yapay Zeka"];

function App() {
  const [activeCategory, setActiveCategory] = useState("Tümü");
  const [articles, setArticles] = useState([]);
  const [briefing, setBriefing] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isBriefingLoading, setIsBriefingLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('hypeDarkMode') === 'true';
  });
  const [savedItems, setSavedItems] = useState(() => {
    const localData = localStorage.getItem('hypeSavedItems');
    return localData ? new Set(JSON.parse(localData)) : new Set();
  });
  
  // Modal States
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);

  // Dark mode body class
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('hypeDarkMode', darkMode);
  }, [darkMode]);

  // Sahte Veri (Fallback)
  const mockArticles = [
    {
      id: 1,
      title: "Yapay Zeka Destekli Hype Tech, Bağımsız Geliştiriciler İçin Devrim Niteliğinde",
      summary: "Kod yazmanın tamamen yapay zeka asistanları ile gerçekleştirildiği 'Hype News' dünyasındaki yeni konseptler hızla yayılıyor.",
      category: "Hype Tech",
      read_time: "4 dk okuma",
      published_at: new Date().toISOString(),
      url: "https://example.com"
    },
    {
      id: 2,
      title: "Yeni Nesil İnsansı Robotlar Fabrika Zeminlerine İniyor",
      summary: "Endüstriyel otomasyonda yeni bir çağ açan insansı robotlar fabrikalarında test edilmeye başlandı.",
      category: "Robotik",
      read_time: "6 dk okuma",
      published_at: new Date(Date.now() - 86400000).toISOString(),
      url: "https://example.com"
    },
  ];

  // Haberleri çek
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/articles?limit=100');
        if (response.ok) {
          const data = await response.json();
          const mappedData = data.map(item => ({
            ...item,
            read_time: "3 dk okuma",
            image_url: `https://picsum.photos/seed/${item.id}/800/400`
          }));
          mappedData.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
          setArticles(mappedData.length > 0 ? mappedData : mockArticles);
        } else {
          setArticles(mockArticles);
        }
      } catch (error) {
        console.warn("Backend kapalı veya hata oluştu", error);
        setArticles(mockArticles);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNews();
  }, []);

  // Kategori değişince briefing'i güncelle
  useEffect(() => {
    if (activeCategory === "Kaydedilenler") {
      setBriefing("Kaydettiğin haberlerin listesi aşağıda gösteriliyor.");
      setIsBriefingLoading(false);
      return;
    }
    
    const fetchBriefing = async () => {
      setIsBriefingLoading(true);
      try {
        const response = await fetch(`/api/briefing?category=${encodeURIComponent(activeCategory)}`);
        if (response.ok) {
          const data = await response.json();
          setBriefing(data.briefing);
        } else {
          setBriefing(`${activeCategory} kategorisi için gündem özetlenemedi.`);
        }
      } catch (error) {
        setBriefing("Bağlantı hatası: Gündem özeti sunucuya ulaşılamadığı için çekilemedi.");
      } finally {
        setIsBriefingLoading(false);
      }
    };

    fetchBriefing();
  }, [activeCategory]);

  // Kaydedilenleri kalıcı depola
  useEffect(() => {
    localStorage.setItem('hypeSavedItems', JSON.stringify([...savedItems]));
  }, [savedItems]);

  // Arama + Kategori Filtreleme
  let filteredArticles = activeCategory === "Tümü" 
    ? articles 
    : activeCategory === "Kaydedilenler"
      ? articles.filter(a => savedItems.has(a.id))
      : articles.filter(a => a.category === activeCategory);

  // Arama filtresi
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredArticles = filteredArticles.filter(a => 
      (a.title && a.title.toLowerCase().includes(q)) || 
      (a.summary && a.summary.toLowerCase().includes(q)) ||
      (a.source && a.source.toLowerCase().includes(q))
    );
  }

  // Bookmark Toggle
  const toggleSave = (id) => {
    setSavedItems(prev => {
      const newMap = new Set(prev);
      if (newMap.has(id)) {
        newMap.delete(id);
      } else {
        newMap.add(id);
      }
      return newMap;
    });
  };

  // Article Modal
  const handleArticleClick = (article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  // Kaynak eklendiğinde haberleri yenile
  const handleSourceAdded = () => {
    setTimeout(async () => {
      try {
        const response = await fetch('/api/articles?limit=100');
        if (response.ok) {
          const data = await response.json();
          const mappedData = data.map(item => ({
            ...item,
            read_time: "3 dk okuma",
            image_url: `https://picsum.photos/seed/${item.id}/800/400`
          }));
          mappedData.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
          if (mappedData.length > 0) setArticles(mappedData);
        }
      } catch (e) { /* ignore */ }
    }, 5000);
  };

  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      // Premium loading duration: min 2500ms
      const timer = setTimeout(() => setShowLoading(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <div className="min-h-screen-ios">
      {showLoading && <LoadingScreen isFinished={!isLoading} />}
      
      <div className={`transition-opacity duration-1000 ${showLoading && isLoading ? 'opacity-0' : 'opacity-100'}`}>
        <Navbar 
          onAddSource={() => setIsSourceModalOpen(true)} 
          onSearch={setSearchQuery}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode(prev => !prev)}
        />
        
        <CategoryMenu 
          categories={CATEGORIES} 
          activeCategory={activeCategory} 
          onCategorySelect={setActiveCategory} 
        />

        <main>
          {filteredArticles.length === 0 ? (
            <div className="text-center py-20 px-4">
              <p className="text-2xl font-semibold text-slate-400 mb-2">
                {searchQuery ? `"${searchQuery}" için sonuç bulunamadı` : 'Bu kategoride henüz haber yok'}
              </p>
              <p className="text-slate-500">
                {searchQuery ? 'Farklı bir arama terimi dene.' : 'Kaynak ekle butonunu kullanarak bu kategoriye RSS kaynağı ekleyebilirsin.'}
              </p>
            </div>
          ) : (
            <div className="animate-in fade-in duration-500">
              <DailyBriefing 
                briefing={briefing} 
                isLoading={isBriefingLoading} 
                activeCategory={activeCategory}
              />
              <NewsGrid 
                articles={filteredArticles} 
                savedItems={savedItems}
                onSaveToggle={toggleSave}
                onArticleClick={handleArticleClick}
              />
            </div>
          )}
          <Footer />
        </main>
      </div>

      <ArticleModal 
        article={selectedArticle}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isSaved={selectedArticle ? savedItems.has(selectedArticle.id) : false}
        onSaveToggle={toggleSave}
      />

      <AddSourceModal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        categories={CATEGORIES.filter(c => c !== "Tümü" && c !== "Kaydedilenler")}
        onSourceAdded={handleSourceAdded}
      />
    </div>
  );
}

export default App;
