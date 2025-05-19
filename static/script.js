let currentPage = 1;
let currentTitle = '';
let currentGenre = '';
let currentActor = '';
let currentYear = '';

function setupAutocomplete() {
    const titleInput = document.getElementById('title');
    const genreInput = document.getElementById('genre');
    const actorInput = document.getElementById('actor');

    setupInputAutocomplete(titleInput, 'title', 'title-dropdown');
    setupInputAutocomplete(genreInput, 'genre', 'genre-dropdown', true);
    setupInputAutocomplete(actorInput, 'actor', 'actor-dropdown');

    // Закрываем выпадающие списки при клике вне их
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.autocomplete-wrapper') && !e.target.closest('.autocomplete-dropdown')) {
        closeAllDropdowns();
        }
    });
}

function setupInputAutocomplete(input, field, dropdownId, showOnEmpty = false) {
    const dropdown = document.getElementById(dropdownId);
    let timeoutId;

    input.addEventListener('input', () => {
        clearTimeout(timeoutId);
        const query = input.value.trim();

        if (query.length > 0 || (showOnEmpty && field === 'genre')) {
            timeoutId = setTimeout(() => {
                fetchAutocomplete(field, query, dropdown);
            }, 300);
        } else {
            dropdown.style.display = 'none';
        }
    });

    input.addEventListener('focus', () => {
        closeAllDropdowns(dropdown); // Закрываем все, кроме текущего
        const query = input.value.trim();
        if ((query.length > 0 || (showOnEmpty && field === 'genre')) && !dropdown.innerHTML) {
            fetchAutocomplete(field, query, dropdown);
        } else if (dropdown.innerHTML) {
            dropdown.style.display = 'block';
        }
    });

    input.addEventListener('click', (e) => {
        e.stopPropagation(); // Предотвращаем всплытие, чтобы не сработал document.click
        closeAllDropdowns(dropdown); // Закрываем все, кроме текущего
        if (dropdown.innerHTML) {
            dropdown.style.display = 'block';
        }
    });
}

async function fetchAutocomplete(field, query, dropdown) {
    try {
        const response = await fetch(`/autocomplete?field=${field}&query=${encodeURIComponent(query)}`);
        const items = await response.json();

        if (items.length > 0) {
            dropdown.innerHTML = items.map(item =>
                `<div onclick="selectAutocompleteItem(this, '${field}')">${item}</div>`
            ).join('');
            dropdown.style.display = 'block';
        } else {
            dropdown.style.display = 'none';
        }
    } catch (error) {
        console.error('Autocomplete error:', error);
        dropdown.style.display = 'none';
    }
}

function selectAutocompleteItem(element, field) {
    const input = document.getElementById(field);
    input.value = element.textContent;
    closeAllDropdowns();
    search();
}

function closeAllDropdowns(except = null) {
    document.querySelectorAll('.autocomplete-dropdown').forEach(dropdown => {
        if (except && dropdown === except) return;
        dropdown.style.display = 'none';
    });
}

async function search() {
    currentPage = 1;
    currentTitle = document.getElementById('title').value.trim();
    currentGenre = document.getElementById('genre').value.trim();
    currentActor = document.getElementById('actor').value.trim();
    currentYear = document.getElementById('year').value.trim();

    try {
        if (currentTitle || currentGenre || currentActor || currentYear) {
            await fetch('/log_query', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    title: currentTitle || null,
                    genre: currentGenre || null,
                    actor: currentActor || null,
                    year: currentYear || null
                })
            });
        }

        await loadMovies();
        await loadQueries();
    } catch (error) {
        console.error("Search error:", error);
        alert("An error occurred while searching");
    }
}

async function loadMovies() {
    try {
        const params = new URLSearchParams();
        if (currentTitle) params.append('title', currentTitle);
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
        if (query.title) text.push(`Title: ${query.title}`);
        if (query.genre) text.push(`Genre: ${query.genre}`);
        if (query.actor) text.push(`Actor: ${query.actor}`);
        if (query.year) text.push(`Year: ${query.year}`);

        container.innerHTML += `
            <div class="query-item" onclick="applyQuery(
                '${query.title || ''}',
                '${query.genre || ''}',
                '${query.actor || ''}',
                '${query.year || ''}'
                )">
                ${text.join(' · ')}
            </div>
        `;
    });
}

function applyQuery(title, genre, actor, year) {
    document.getElementById('title').value = title;
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
    setupAutocomplete();

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

    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') search();
        });
    });

    loadMovies();
    loadQueries();
});