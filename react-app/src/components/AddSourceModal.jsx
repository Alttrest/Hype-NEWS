import { X, Plus, Rss, Trash2, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AddSourceModal({ isOpen, onClose, categories, onSourceAdded }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('Teknoloji');
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState('');
  const [existingSources, setExistingSources] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchSources();
    }
  }, [isOpen]);

  const fetchSources = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/sources');
      if (res.ok) {
        const data = await res.json();
        setExistingSources(data);
      }
    } catch (e) { /* ignore */ }
  };

  const handleAdd = async () => {
    if (!name.trim() || !url.trim()) {
      setMessage('Lütfen kaynak adı ve URL girin.');
      return;
    }
    setIsAdding(true);
    setMessage('');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), url: url.trim(), category }),
      });
      const data = await res.json();
      setMessage(data.message);
      setName('');
      setUrl('');
      fetchSources();
      if (onSourceAdded) onSourceAdded();
    } catch (e) {
      setMessage('Kaynak eklenirken hata oluştu.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/sources/${id}`, { method: 'DELETE' });
      fetchSources();
    } catch (e) { /* ignore */ }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg max-h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Rss className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Kaynak Ekle</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-grow space-y-5">
          {/* Form */}
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Kaynak Adı (ör: BBC Türkçe)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50 text-slate-800 placeholder-slate-400 font-medium"
            />
            <input
              type="url"
              placeholder="RSS Feed URL (ör: https://site.com/rss.xml)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50 text-slate-800 placeholder-slate-400 font-medium"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50 text-slate-800 font-medium"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            <button
              onClick={handleAdd}
              disabled={isAdding}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl transition-colors"
            >
              {isAdding ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Ekleniyor...</>
              ) : (
                <><Plus className="w-4 h-4" /> Kaynak Ekle ve Tara</>
              )}
            </button>
          </div>

          {message && (
            <div className="px-4 py-3 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium">
              {message}
            </div>
          )}

          {/* Mevcut Kaynaklar */}
          {existingSources.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Eklediğin Kaynaklar</h3>
              <div className="space-y-2">
                {existingSources.map(source => (
                  <div key={source.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group">
                    <div className="flex-grow min-w-0">
                      <p className="font-semibold text-slate-700 text-sm truncate">{source.name}</p>
                      <p className="text-xs text-slate-400 truncate">{source.url}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full font-medium">{source.category}</span>
                      <button 
                        onClick={() => handleDelete(source.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
