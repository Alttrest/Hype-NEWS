import NewsCard from './NewsCard';

export default function NewsGrid({ articles, savedItems, onSaveToggle, onArticleClick }) {
  if (!articles || articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <p className="text-xl font-medium mb-2">Bu kategoride henüz haber bulunmuyor.</p>
        <p>Lütfen daha sonra tekrar kontrol et.</p>
      </div>
    );
  }

  // The first article is the hero
  const [heroArticle, ...gridArticles] = articles;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      {/* Hero Section */}
      {heroArticle && (
        <NewsCard 
          article={heroArticle} 
          isHero={true} 
          isSaved={savedItems.has(heroArticle.id)}
          onSaveToggle={onSaveToggle}
          onClick={onArticleClick}
        />
      )}

      {/* Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gridArticles.map((article) => (
          <NewsCard 
            key={article.id} 
            article={article} 
            isSaved={savedItems.has(article.id)}
            onSaveToggle={onSaveToggle}
            onClick={onArticleClick}
          />
        ))}
      </div>
    </div>
  );
}
  