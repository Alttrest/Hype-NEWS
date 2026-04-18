import { X, ExternalLink, Bookmark, Clock, Play, Square, Volume2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ArticleModal({ article, isOpen, onClose, isSaved, onSaveToggle }) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      window.speechSynthesis.cancel(); // durdurulursa kapansin
      setIsPlaying(false);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.speechSynthesis.cancel();
    };
  }, [isOpen]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState(null);

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [audio]);

  const toggleSpeech = () => {
    if (isPlaying) {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      setIsPlaying(false);
    } else {
      const textToRead = article?.summary || article?.content || 'Okunacak metin bulunamadı.';
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }

      const audioUrl = `http://127.0.0.1:8000/api/tts?text=${encodeURIComponent(textToRead)}`;
      const newAudio = new Audio(audioUrl);
      newAudio.onended = () => setIsPlaying(false);
      newAudio.onerror = () => setIsPlaying(false);
      newAudio.play();
      setAudio(newAudio);
      setIsPlaying(true);
    }
  };

  if (!isOpen || !article) return null;

  const imgUrl = article.image_url || `https://picsum.photos/seed/${article.id}/800/400`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-surface rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header/Image Area */}
        <div className="relative h-48 sm:h-64 flex-shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 backdrop-blur text-white rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <img 
            src={imgUrl} 
            alt={article.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <span className="inline-block px-3 py-1 bg-accent text-white text-xs font-semibold rounded-full mb-3">
              {article.category || 'Gündem'}
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">
              {article.title}
            </h2>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-grow bg-background">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {article.read_time || '3 dk okuma'}
              </span>
              <span>•</span>
              <span>{new Date(article.published_at || Date.now()).toLocaleDateString('tr-TR')}</span>
            </div>
            
            <button 
              onClick={() => onSaveToggle(article.id)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-medium transition-all ${
                isSaved 
                  ? 'border-accent text-accent bg-accent/5' 
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-accent' : ''}`} />
              {isSaved ? 'Kaydedildi' : 'Kaydet'}
            </button>
          </div>

          <div className="prose prose-slate max-w-none">
            <h3 className="text-lg font-semibold text-anthracite mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">✨</span> AI Detaylı Özet
              </div>
              <button 
                onClick={toggleSpeech}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full transition-colors font-semibold text-xs uppercase"
              >
                {isPlaying ? (
                  <><Square className="w-3.5 h-3.5 fill-indigo-600" /> Durdur</>
                ) : (
                  <><Play className="w-3.5 h-3.5 fill-indigo-600" /> Dinle</>
                )}
              </button>
            </h3>
            <div className={`bg-white p-5 rounded-xl border border-slate-100 shadow-sm text-slate-700 leading-relaxed mb-6 font-medium text-lg transition-all ${isPlaying ? 'ring-2 ring-indigo-400 ring-offset-2' : ''}`}>
              {article.summary || article.content || 'Özet bulunamadı.'}
            </div>
            
            <p className="text-slate-600 leading-relaxed">
              Bu makalenin detayları tamamen yapay zeka tarafından özetlenmek üzere çekilmiştir. Eğer orijinal makaleye gidip tüm detayları okumak istersen, kaynak bağlantısına aşağıdaki butondan ulaşabilirsin.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface border-t border-slate-100 mt-auto flex justify-end">
          <a 
            href={article.url || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-anthracite hover:bg-slate-800 text-white font-medium rounded-xl transition-colors"
          >
            Kaynağa Git <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
