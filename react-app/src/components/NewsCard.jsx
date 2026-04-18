import { Bookmark } from 'lucide-react';

export default function NewsCard({ article, isHero, isSaved, onSaveToggle, onClick }) {
  // Use a reliable placeholder or actual image URL
  const imgUrl = article.image_url || `https://picsum.photos/seed/${article.id}/800/400`;

  return (
    <div 
      className={`glass-card overflow-hidden group cursor-pointer flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 border-slate-200/60 rounded-3xl ${isHero ? 'md:col-span-3 md:flex-row mb-12' : 'h-full'}`}
      onClick={() => onClick(article)}
    >
      <div className={`relative overflow-hidden ${isHero ? 'md:w-[60%] h-72 md:h-auto' : 'h-52'}`}>
        <img 
          src={imgUrl} 
          alt={article.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-accent/90 text-white text-xs font-semibold rounded-full backdrop-blur">
            {article.category || 'Gündem'}
          </span>
        </div>
      </div>
      
      <div className={`p-6 sm:p-8 flex flex-col flex-grow bg-white/40 ${isHero ? 'md:w-[40%] justify-center' : ''}`}>
        <h3 className={`font-bold text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors tracking-tight ${isHero ? 'text-3xl lg:text-4xl leading-tight' : 'text-xl leading-snug line-clamp-2'}`}>
          {article.title}
        </h3>
        
        <p className={`text-slate-500 mb-4 ${isHero ? 'line-clamp-4 text-lg' : 'line-clamp-2 text-sm'}`}>
          {article.summary}
        </p>
        
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center text-xs text-slate-400 font-medium">
            <span>{article.read_time || '3 dk okuma'}</span>
            <span className="mx-2">•</span>
            <span>{new Date(article.published_at || Date.now()).toLocaleDateString('tr-TR')}</span>
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onSaveToggle(article.id);
            }}
            className="p-2 -mr-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-accent"
          >
            <Bookmark 
              className={`h-5 w-5 transition-all ${isSaved ? 'fill-accent text-accent' : ''}`} 
            />
          </button>
        </div>
      </div>
    </div>
  );
}
