export default function CategoryMenu({ categories, activeCategory, onCategorySelect }) {
  return (
    <div className="w-full bg-surface shadow-sm mb-6 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto py-4 gap-3 hide-scrollbar">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategorySelect(category)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 transform active:scale-95 ${
                activeCategory === category
                  ? 'bg-gradient-to-r from-accent to-accent-dark text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-surface text-slate-500 hover:bg-slate-50 border border-slate-100 hover:border-slate-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
