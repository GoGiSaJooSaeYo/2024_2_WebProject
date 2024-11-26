let currentPage = 1;
let totalPages = 1;
const playPerPage = 10;

async function fetchPlayDetails(seq) {
  try {
    window.location.href = `details.html?seq=${seq}`;
  } catch (error) {
    console.error('Error fetching play details:', error);
  }
}

async function fetchPlays(fromDate = '20240101', toDate = '20241231', page = 1, keyword = '') {
  try {
    const apiUrl = `http://localhost:3000/api/plays?from=${fromDate}&to=${toDate}&page=${page}&rows=${playPerPage}`;
    const response = await fetch(apiUrl);

    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const data = await response.json();
    totalPages = data.totalPages || 1;
    currentPage = data.currentPage;

    const playList = document.getElementById('playList');
    if (!playList) return;

    playList.innerHTML = '';

    const plays = data.perforList || [];
    if (plays.length > 0) {
      plays.forEach((play) => {
        const playDiv = document.createElement('div');
        playDiv.className = 'play';
        playDiv.innerHTML = `
          <div class="play-thumbnail">
            <img src="${play.thumbnail || './images/default-image.jpg'}" alt="${play.title || 'No title'}" class="play-image" />
          </div>
          <h3 class="play-title">${play.title || 'No title'}</h3>
          <p class="play-date">${play.startDate || 'No start date'} ~ ${play.endDate || 'No end date'}</p>
          <p class="play-place">${play.place || 'No place'}</p>
        `;

        playDiv.addEventListener('click', () => fetchPlayDetails(play.seq));
        playList.appendChild(playDiv);
      });
    } else {
      playList.innerHTML = '<p>No plays found.</p>';
    }

    updatePaginationUI();
  } catch (error) {
    console.error('Error fetching play data:', error);
  }
}

function searchPlays() {
  const fromDateElement = document.getElementById('fromDate');
  const toDateElement = document.getElementById('toDate');
  const searchInputElement = document.getElementById('searchInput');

  const fromDate = fromDateElement ? fromDateElement.value.replace(/-/g, '') : '20240101';
  const toDate = toDateElement ? toDateElement.value.replace(/-/g, '') : '20241231';
  const keyword = searchInputElement ? searchInputElement.value : '';

  currentPage = 1;
  fetchPlays(fromDate, toDate, currentPage, keyword);
}

function goToPage(pageNumber) {
  if (pageNumber < 1 || pageNumber > totalPages) return;

  currentPage = pageNumber;

  const fromDateElement = document.getElementById('fromDate');
  const toDateElement = document.getElementById('toDate');
  const searchInputElement = document.getElementById('searchInput');

  const fromDate = fromDateElement ? fromDateElement.value.replace(/-/g, '') : '20240101';
  const toDate = toDateElement ? toDateElement.value.replace(/-/g, '') : '20241231';
  const keyword = searchInputElement ? searchInputElement.value : '';

  fetchPlays(fromDate, toDate, currentPage, keyword);
}

function previousPage() {
  if (currentPage > 1) goToPage(currentPage - 1);
}

function nextPage() {
  if (currentPage < totalPages) goToPage(currentPage + 1);
}

function updatePaginationUI() {
  const paginationContainer = document.querySelector('.pagination');
  if (!paginationContainer) return;

  paginationContainer.innerHTML = '';

  const prevButton = document.createElement('button');
  prevButton.textContent = 'Previous';
  prevButton.disabled = currentPage === 1;
  prevButton.onclick = previousPage;
  paginationContainer.appendChild(prevButton);

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.className = i === currentPage ? 'active' : '';
    pageButton.onclick = () => goToPage(i);
    paginationContainer.appendChild(pageButton);
  }

  const nextButton = document.createElement('button');
  nextButton.textContent = 'Next';
  nextButton.disabled = currentPage === totalPages;
  nextButton.onclick = nextPage;
  paginationContainer.appendChild(nextButton);
}

document.addEventListener('DOMContentLoaded', () => {
  fetchPlays();
});
