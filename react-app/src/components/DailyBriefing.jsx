import { Sparkles, Play, Square, Volume2 } from 'lucide-react';
import { useState, useEffect } from 'react';
export default function DailyBriefing({ briefing, isLoading, activeCategory = "Tümü" }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState(null);

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [audio]);

  // Parse briefing into lines
  const briefingLines = briefing 
    ? briefing.split('•').map(line => line.trim()).filter(line => line.length > 0)
    : [];

  const toggleSpeech = () => {
    if (isPlaying) {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      setIsPlaying(false);
    } else {
      if (!briefing) return;
      
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      
      // Use category-based endpoint for pre-generated audio
      const audioUrl = `/api/tts?category=${encodeURIComponent(activeCategory)}`;
      const newAudio = new Audio(audioUrl);
      newAudio.onended = () => setIsPlaying(false);
      newAudio.onerror = () => setIsPlaying(false);
      newAudio.play();
      setAudio(newAudio);
      setIsPlaying(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
      <div className="relative overflow-hidden rounded-3xl bg-surface border border-slate-200/50 shadow-xl shadow-slate-200/40 p-8 sm:p-10 group">
        
        {/* Animated Gradient Background Aura */}
        <div className="absolute -inset-20 opacity-30 blur-3xl pointer-events-none transition-transform duration-[10s] ease-in-out group-hover:scale-110">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-indigo-400 via-purple-300 to-transparent rounded-full opacity-60 mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-sky-300 via-blue-200 to-transparent rounded-full opacity-60 mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-shrink-0 mt-1">
            <div className={`p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30 ${isPlaying ? 'animate-pulse' : ''}`}>
              {isPlaying ? <Volume2 className="w-8 h-8 text-white" /> : <Sparkles className="w-8 h-8 text-white" />}
            </div>
          </div>
          
          <div className="flex-grow">
            <div className="flex items-center justify-between xl:justify-start gap-4 mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-widest text-indigo-500 uppercase">Günün Büyük Özeti</h2>
                {!isLoading && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-600 text-[10px] font-bold rounded-md flex items-center gap-1 animate-pulse">
                    <div className="w-1 h-1 bg-green-500 rounded-full" />
                    PODCAST HAZIR
                  </span>
                )}
              </div>
              
              {!isLoading && (
                 <button 
                  onClick={toggleSpeech}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full transition-colors font-semibold text-xs uppercase"
                 >
                   {isPlaying ? (
                     <><Square className="w-3.5 h-3.5 fill-indigo-600" /> Durdur</>
                   ) : (
                     <><Play className="w-3.5 h-3.5 fill-indigo-600" /> Podcast Dinle</>
                   )}
                 </button>
              )}
            </div>
            
            {isLoading ? (
               <div className="space-y-3 animate-pulse">
                 <div className="h-6 bg-slate-200/60 rounded-lg w-full"></div>
                 <div className="h-6 bg-slate-200/60 rounded-lg w-11/12"></div>
                 <div className="h-6 bg-slate-200/60 rounded-lg w-4/5"></div>
               </div>
            ) : (
              <div className="space-y-4">
                {briefingLines.map((line, idx) => (
                  <div key={idx} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-500">
                    <div className="mt-2 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                    <p className="text-lg sm:text-xl font-medium text-anthracite leading-relaxed">
                      {line}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
