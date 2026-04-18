import { Search, Plus, Moon, Sun, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar({ onAddSource, onSearch, darkMode, onToggleDark }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleClear = () => {
    setSearchQuery('');
    onSearch('');
    setIsSearchOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-accent to-accent-dark tracking-tighter">
                HypeNews
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            {isSearchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    onSearch(e.target.value);
                  }}
                  placeholder="Haber ara..."
                  autoFocus
                  className="w-40 sm:w-60 px-3 py-1.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-surface text-anthracite placeholder-slate-400"
                />
                <button type="button" onClick={handleClear} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <button onClick={() => setIsSearchOpen(true)} className="p-2 text-slate-500 hover:text-accent transition-colors">
                <Search className="h-5 w-5" />
              </button>
            )}

            {/* Kaynak Ekle */}
            <button 
              onClick={onAddSource}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Kaynak Ekle</span>
            </button>

            {/* Dark Mode Toggle */}
            <button 
              onClick={onToggleDark}
              className="p-2 text-slate-500 hover:text-accent transition-colors"
              title={darkMode ? 'Aydınlık Mod' : 'Karanlık Mod'}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
