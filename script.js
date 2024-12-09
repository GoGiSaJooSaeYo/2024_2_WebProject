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

/*
let currentPage = 1;
let totalPages = 1; // totalPages는 API 데이터를 기준으로 설정됩니다.
const playPerPage = 10; // 페이지당 연극 수를 전역으로 설정

// API를 통해 연극 데이터를 가져오는 함수
async function fetchPlayDetails(seq) {
  try {
    console.log(`상세 데이터 요청: seq=${seq}`); // 디버깅 로그
    // details.html로 이동하면서 seq를 쿼리 파라미터로 전달
    window.location.href = `details.html?seq=${seq}`;
  } catch (error) {
    console.error('연극 세부 데이터를 가져오는 중 오류 발생:', error);
  }
}

// API를 통해 연극 데이터를 가져오는 함수
async function fetchPlays(fromDate = '20240101', toDate = '20241231', page = 1, keyword = '') {
  try {
    const apiUrl = `http://localhost:3000/api/plays?from=${fromDate}&to=${toDate}&page=${page}&rows=${playPerPage}`;
    console.log(`API 요청: ${apiUrl}`); // 디버깅 로그

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP 오류 발생: ${response.status}`);
    }

    const data = await response.json();
    console.log('API 응답 데이터:', data); // 디버깅 로그

    // totalPages 업데이트 (API 데이터에서 총 연극 개수를 받아올 수 있을 경우)
    if (data.totalCount) {
      totalPages = data.totalPages;
      console.log(`총 데이터 개수: ${data.totalCount}, 총 페이지 수: ${totalPages}`); // 디버깅 로그
    } else {
      totalPages = 1;
    }

    // 현재 페이지를 요청한 page로 설정
    currentPage = data.currentPage;
    console.log(`현재 페이지 설정: ${currentPage}`); // 디버깅 로그

    const playList = document.getElementById('playList');
    if (!playList) {
      console.error('playList 요소를 찾을 수 없습니다.');
      return;
    }

    // 기존 항목 초기화
    playList.innerHTML = '';

    // 연극 데이터 렌더링
    const plays = data.perforList || []; // 데이터 확인 후 배열로 접근
    console.log('렌더링할 데이터:', plays); // 디버깅 로그

    if (plays.length > 0) {
      plays.forEach((play) => {
        const seq = play.seq || '번호 없음';
        const title = play.title || '제목 없음';
        const startDate = play.startDate || '시작일 없음';
        const endDate = play.endDate || '종료일 없음';
        const place = play.place || '장소 없음';
        const thumbnail = play.thumbnail || './images/default-image.jpg'; // 기본 이미지 설정

        const playDiv = document.createElement('div');
        playDiv.className = 'play';
        playDiv.innerHTML = `
          <div class="play-thumbnail">
            <img src="${thumbnail}" alt="${title}" class="play-image" />
          </div>
          <h3 class="play-title">${title}</h3>
          <p class="play-date">${startDate} ~ ${endDate}</p>
          <p class="play-place">${place}</p>
        `;

        playDiv.addEventListener('click', () => {
          fetchPlayDetails(seq);
        });

        playList.appendChild(playDiv);
      });
    } else {
      playList.innerHTML = '<p>검색된 연극이 없습니다.</p>';
    }

    // 페이지네이션 UI 업데이트
    updatePaginationUI();
  } catch (error) {
    console.error('연극 데이터를 가져오는 중 오류 발생:', error);
  }
}

// 검색 버튼을 클릭할 때 호출되는 함수
function searchPlays() {
  const fromDateElement = document.getElementById('fromDate');
  const toDateElement = document.getElementById('toDate');
  const searchInputElement = document.getElementById('searchInput');

  if (!fromDateElement || !toDateElement || !searchInputElement) {
    console.error('검색 필드를 찾을 수 없습니다.');
    return;
  }

  const fromDate = fromDateElement.value.replace(/-/g, '') || '20240101';
  const toDate = toDateElement.value.replace(/-/g, '') || '20241231';
  const keyword = searchInputElement.value;

  currentPage = 1; // 검색 시 항상 첫 페이지로 초기화
  console.log('검색 조건:', { fromDate, toDate, keyword }); // 디버깅 로그
  fetchPlays(fromDate, toDate, currentPage, keyword);
}

// 페이지 이동 함수 정의
function goToPage(pageNumber) {
  if (pageNumber < 1 || pageNumber > totalPages) {
    console.log('잘못된 페이지 번호:', pageNumber); // 디버깅 로그
    return;
  }
  currentPage = pageNumber;
  console.log(`페이지 이동: ${pageNumber}`); // 디버깅 로그

  const fromDateElement = document.getElementById('fromDate');
  const toDateElement = document.getElementById('toDate');
  const searchInputElement = document.getElementById('searchInput');

  const fromDate = fromDateElement ? fromDateElement.value.replace(/-/g, '') : '20240101';
  const toDate = toDateElement ? toDateElement.value.replace(/-/g, '') : '20241231';
  const keyword = searchInputElement ? searchInputElement.value : '';

  fetchPlays(fromDate, toDate, currentPage, keyword);
}

function previousPage() {
  if (currentPage > 1) {
    goToPage(currentPage - 1);
  }
}

function nextPage() {
  if (currentPage < totalPages) {
    goToPage(currentPage + 1);
  }
}

// 페이지네이션 UI 업데이트 함수
function updatePaginationUI() {
  const paginationContainer = document.querySelector('.pagination');
  if (!paginationContainer) {
    console.error('pagination 요소를 찾을 수 없습니다.');
    return;
  }
  paginationContainer.innerHTML = ''; // 기존 버튼 초기화

  console.log(`현재 페이지: ${currentPage}, 총 페이지: ${totalPages}`); // 디버깅 로그

  // 이전 버튼
  const prevButton = document.createElement('button');
  prevButton.textContent = '이전';
  prevButton.disabled = currentPage === 1; // 첫 페이지에서는 비활성화
  prevButton.onclick = previousPage;
  paginationContainer.appendChild(prevButton);

  // 페이지 번호 버튼 생성
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.className = i === currentPage ? 'active' : ''; // 현재 페이지 표시
    pageButton.onclick = () => {
      console.log(`페이지 버튼 클릭: ${i}`); // 디버깅 로그
      goToPage(i);
    };
    paginationContainer.appendChild(pageButton);
  }

  // 다음 버튼
  const nextButton = document.createElement('button');
  nextButton.textContent = '다음';
  nextButton.disabled = currentPage === totalPages; // 마지막 페이지에서는 비활성화
  nextButton.onclick = nextPage;
  paginationContainer.appendChild(nextButton);
}

// 페이지 로드 시 초기 데이터 호출
document.addEventListener('DOMContentLoaded', () => {
  fetchPlays();
});
*/
