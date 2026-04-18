export default function Footer() {
  return (
    <footer className="mt-auto py-10 border-t border-slate-200 dark:border-slate-800 bg-surface/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-accent to-accent-dark tracking-tighter">
              HypeNews
            </span>
            <p className="text-slate-500 text-sm">© {new Date().getFullYear()} - Ali TURAN tarafından geliştirildi.</p>
          </div>

          <div className="flex items-center gap-6">
            {/* Instagram */}
            <a 
              href="https://www.instagram.com/alttre.sh/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-slate-500 hover:text-pink-600 transition-all duration-300"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 group-hover:scale-110 transition-transform">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              <span className="text-sm font-semibold">Instagram</span>
            </a>
            
            {/* GitHub */}
            <a 
              href="https://github.com/alitoran" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-slate-500 hover:text-anthracite dark:hover:text-white transition-all duration-300"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 group-hover:scale-110 transition-transform">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7a3.37 3.37 0 0 0-.94 2.58V22"></path>
              </svg>
              <span className="text-sm font-semibold">GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
