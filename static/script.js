let currentPage = 1;
let currentGenre = '';
let currentActor = '';
let currentYear = '';

async function search() {
    currentPage = 1;
    currentGenre = document.getElementById('genre').value.trim();
    currentActor = document.getElementById('actor').value.trim();
    currentYear = document.getElementById('year').value.trim();

    try {
        // Логируем запрос (POST)
        if (currentGenre || currentActor || currentYear) {
            await fetch('/log_query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    genre: currentGenre || null,
                    actor: currentActor || null,
                    year: currentYear || null
                })
            });
        }

        // Загружаем фильмы (GET)
        await loadMovies();

        // Обновляем популярные запросы (GET)
        await loadQueries();
    } catch (error) {
        console.error("Search error:", error);
        alert("An error occurred while searching");
    }
}

async function loadMovies() {
    try {
        const params = new URLSearchParams();
        if (currentGenre) params.append('genre', currentGenre);
        if (currentActor) params.append('actor', currentActor);
        if (currentYear) params.append('year', currentYear);
        params.append('page', currentPage);

        const response = await fetch(`/movies?${params.toString()}`);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const movies = await response.json();
        renderMovies(movies);
        updatePagination(movies.length);
    } catch (error) {
        console.error("Load movies error:", error);
        document.getElementById('movies').innerHTML = `
            <div class="error-message">Error loading movies</div>
        `;
    }
}

async function loadQueries() {
    try {
        const response = await fetch('/popular_queries?limit=10');
        const queries = await response.json();
        renderQueries(queries);
    } catch (error) {
        console.error("Load queries error:", error);
    }
}

function renderMovies(movies) {
    const grid = document.getElementById('movies');
    grid.innerHTML = '';

    movies.forEach(movie => {
        grid.innerHTML += `
            <div class="movie-card">
                <h3>${movie.title}</h3>
                <p>Year: ${movie.release_year}</p>
                <p>${movie.description || 'Description is missing'}</p>
            </div>
        `;
    });
}

function renderQueries(queries) {
    const container = document.getElementById('queries');
    container.innerHTML = '';

    queries.forEach(query => {
        let text = [];
        if (query.genre) text.push(`Genre: ${query.genre}`);
        if (query.actor) text.push(`Actor: ${query.actor}`);
        if (query.year) text.push(`Year: ${query.year}`);

        container.innerHTML += `
            <div class="query-item" onclick="applyQuery('${query.genre || ''}', '${query.actor || ''}', '${query.year || ''}')">
                ${text.join(' · ')}
            </div>
        `;
    });
}

function applyQuery(genre, actor, year) {
    document.getElementById('genre').value = genre;
    document.getElementById('actor').value = actor;
    document.getElementById('year').value = year;
    search();
}

function updatePagination(resultsCount) {
    document.getElementById('page').textContent = currentPage;
    document.getElementById('next').disabled = resultsCount < 10;
    document.getElementById('prev').disabled = currentPage === 1;
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('prev').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadMovies();
        }
    });

    document.getElementById('next').addEventListener('click', () => {
        currentPage++;
        loadMovies();
    });

    // Обработка Enter
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') search();
        });
    });

    // Первая загрузка
    loadMovies();
    loadQueries();
});