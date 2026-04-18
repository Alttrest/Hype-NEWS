document.addEventListener('DOMContentLoaded', () => {
    const newsContainer = document.getElementById('newsContainer');
    const loadingState = document.getElementById('loading');
    const refreshBtn = document.getElementById('refreshBtn');

    // Fetch articles on load
    fetchArticles();

    // Refresh action
    refreshBtn.addEventListener('click', async () => {
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = '<span class="icon">⏳</span> Taranıyor...';
        
        try {
            const resp = await fetch('/api/scan', { method: 'POST' });
            if (resp.ok) {
                // Show toast or alert
                console.log("Arka plan taraması başlatıldı.");
                setTimeout(() => {
                    fetchArticles();
                    refreshBtn.disabled = false;
                    refreshBtn.innerHTML = '<span class="icon">🚀</span> Taramayı Tetikle';
                }, 5000); // Wait a bit then refresh DOM
            }
        } catch (error) {
            console.error("Error triggering scan:", error);
            refreshBtn.disabled = false;
            refreshBtn.innerHTML = '<span class="icon">🚀</span> Taramayı Tetikle';
        }
    });

    async function fetchArticles() {
        showLoading(true);
        try {
            const response = await fetch('/api/articles?limit=50');
            const data = await response.json();
            
            renderArticles(data);
        } catch (error) {
            console.error('Error fetching articles:', error);
            newsContainer.innerHTML = '<p class="subtitle">Haberler yüklenirken bir hata oluştu.</p>';
        } finally {
            showLoading(false);
        }
    }

    function renderArticles(articles) {
        newsContainer.innerHTML = '';
        
        if (!articles || articles.length === 0) {
            newsContainer.innerHTML = `
                <div class="glass-panel" style="grid-column: 1 / -1; padding: 40px; text-align: center;">
                    <h3>Henüz haber yok</h3>
                    <p class="subtitle">Yukarıdaki butona tıklayarak taramayı başlatabilirsin.</p>
                </div>
            `;
            return;
        }

        articles.forEach((article, index) => {
            const dateObj = new Date(article.published_at);
            const dateStr = dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
            
            const card = document.createElement('article');
            card.className = 'news-card glass-panel';
            // Staggered entrance animation
            card.style.animation = `float 0.5s ease backwards ${index * 0.1}s`;
            
            let tagsHtml = '';
            if (article.is_vibe_coding) tagsHtml += '<span class="tag">Vibe Coding</span>';
            if (article.is_robotics) tagsHtml += '<span class="tag">Robotik</span>';

            card.innerHTML = `
                <div class="card-header">
                    <span class="source-tag">${article.source || 'Web Source'}</span>
                    <span class="date">${dateStr}</span>
                </div>
                <div class="card-body">
                    <h2 class="card-title">${article.title}</h2>
                    <p class="card-summary">${article.summary}</p>
                </div>
                <div class="card-footer">
                    <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="read-more">Makaleyi Oku</a>
                    ${tagsHtml ? `<div class="tags">${tagsHtml}</div>` : ''}
                </div>
            `;
            
            newsContainer.appendChild(card);
        });
    }

    function showLoading(show) {
        if (show) {
            loadingState.classList.remove('hidden');
            newsContainer.classList.add('hidden');
        } else {
            loadingState.classList.add('hidden');
            newsContainer.classList.remove('hidden');
        }
    }
});
