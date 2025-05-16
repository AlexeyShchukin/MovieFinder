let currentPage = 1;

document.addEventListener('DOMContentLoaded', function() {
    loadMovies();

    document.getElementById('search-btn').addEventListener('click', function() {
        currentPage = 1;
        loadMovies();
    });
});

async function loadMovies() {
    const genre = document.getElementById('genre').value;
    const actor = document.getElementById('actor').value;
    const year = document.getElementById('year').value;

    showLoading(true);
    hideError();

    try {
        const params = new URLSearchParams();
        if (genre) params.append('genre', genre);
        if (actor) params.append('actor', actor);
        if (year) params.append('year', year);
        params.append('page', currentPage);

        const response = await fetch(`/movies?${params.toString()}`);
        if (!response.ok) throw new Error('Ошибка загрузки данных');

        const movies = await response.json();
        displayMovies(movies);
    } catch (error) {
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

function displayMovies(movies) {
    const container = document.getElementById('movies-container');
    container.innerHTML = '';

    if (movies.length === 0) {
        container.innerHTML = '<p class="no-results">Фильмы не найдены. Попробуйте изменить критерии поиска.</p>';
        return;
    }

    movies.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.innerHTML = `
            <h3>${movie.title}</h3>
            <p><strong>Год выпуска:</strong> ${movie.release_year}</p>
            <p>${movie.description || 'Описание отсутствует'}</p>
        `;
        container.appendChild(card);
    });

    updatePagination();
}

function changePage(delta) {
    currentPage += delta;
    if (currentPage < 1) currentPage = 1;
    loadMovies();
}

function updatePagination() {
    document.getElementById('current-page').textContent = currentPage;
    document.getElementById('prev-page').disabled = currentPage === 1;
}

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
}

function showError(message) {
    const errorEl = document.getElementById('error');
    errorEl.textContent = message;
    errorEl.style.display = 'block';
}

function hideError() {
    document.getElementById('error').style.display = 'none';
}