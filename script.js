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


let plays;
const playList = document.getElementById('playList');
let playDiv = document.createElement('div');

async function fetchPlays(fromDate = '20240101', toDate = '20241231', page = 1) {
  try {
    const apiUrl = `http://localhost:3000/api/plays?from=${fromDate}&to=${toDate}&page=${page}&rows=${playPerPage}`;
    const response = await fetch(apiUrl);

    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const data = await response.json();
    totalPages = data.totalPages || 1;
    currentPage = data.currentPage;


    plays = data.perforList;
    playList.innerHTML = '';

    if (plays.length > 0) {
      plays.forEach((play) => {
        playDiv = document.createElement('div');

        playDiv.className = 'play';
        playDiv.innerHTML = `
          <div class="play-thumbnail">
            <img src="${play.thumbnail || './images/default-image.jpg'}" alt="${play.title || 'No title'}" class="play-image" />
          </div>
          <h3 class="play-title">${play.title || 'No title'}</h3>
          <p class="play-startDate">${play.startDate || 'No start date'}</p>
          <p class="play-endDate">${play.endDate || 'No end date'}</p>
          <p class="play-place">${play.place || 'No place'}</p>
          <p class="play-area">${play.area || 'No place'}</p>
        `;



        playDiv.addEventListener('click', () => fetchPlayDetails(play.seq));  // 화살표 함수 괄호 체크
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
  const areaElement = document.getElementById('area');

  const area = areaElement && areaElement.value.trim() ? areaElement.value.trim() : null;
  const fromDate = fromDateElement && fromDateElement.value.trim() ? fromDateElement.value.replace(/-/g, '') : null;
  const toDate = toDateElement && toDateElement.value.trim() ? toDateElement.value.replace(/-/g, '') : null;
  const keyword = searchInputElement && searchInputElement.value.trim() ? searchInputElement.value.trim() : null;

  filterPlays(area, fromDate, toDate, keyword)
  currentPage = 1;  // 검색 시 첫 페이지로 초기화
}

function filterPlays(area, fromDate, toDate, keyword) {
  let noPlayElement = document.getElementById('noPlay');
  noPlayElement.style.display = 'none';

  const filteredPlays = document.querySelectorAll('.play');
  let checkPlay = 0;
  // 필터링된 결과만 추가


  filteredPlays.forEach((play) => {
    play.style.display = 'flex';
    const title = play.querySelector('.play-title').textContent.trim();
    const playArea = play.querySelector('.play-area').textContent.trim();
    const playStartDate = Number(play.querySelector('.play-startDate').textContent.trim());
    const playEndDate = Number(play.querySelector('.play-endDate').textContent.trim());


    const matchesKeyword = keyword ? title.includes(keyword) : true;
    const matchesArea = area ? playArea && area.includes(playArea) : true;
    const matchesFromDate = fromDate ? playStartDate && playStartDate >= fromDate : true;
    const matchesToDate = toDate ? playEndDate && playEndDate <= toDate : true;
    console.log(playArea);


    if (matchesKeyword && matchesArea && matchesFromDate && matchesToDate) {
      checkPlay++;
    } else {
      play.style.display = 'none';
    }

  })

  if (checkPlay == 0) noPlayElement.style.display = 'flex';
}


function toggleFilterOptions() {
  const filterOptions = document.getElementById('filterOptions');
  if (filterOptions.style.display === 'none' || filterOptions.style.display === '') {
    filterOptions.style.display = 'block'; // 필터 옵션을 보이게 설정
  } else {
    filterOptions.style.display = 'none'; // 필터 옵션을 숨기기
  }
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
