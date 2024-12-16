/**
 * 비동기 함수로 HTML 컴포넌트를 로드하고 지정된 요소에 삽입
 * @param {string} selector - HTML 요소를 선택하는 CSS 선택자
 * @param {string} filePath - 로드할 HTML 파일의 경로
 */

async function loadComponent(selector, filePath) {
  const element = document.querySelector(selector); // 선택한 요소를 DOM에서 찾음
  if (!element) return; // 요소가 없으면 함수 종료

  try {
    const response = await fetch(filePath); // HTML 파일을 가져오기 위해 HTTP 요청을 보냄
    if (response.ok) { // 요청 성공 시
      const content = await response.text(); // 응답 본문을 텍스트로 변환
      element.innerHTML = content; // 선택한 요소의 내부 HTML로 삽입
    } else {
      console.error(`Failed to load ${filePath}: ${response.status}`); // HTTP 상태 코드와 함께 오류 로그 출력
    }
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error); // 요청 중 발생한 네트워크 오류 출력
  }
}

/**
 * DOM이 완전히 로드된 후 컴포넌트를 로드
 * - 페이지에 header.html과 footer.html 파일을 비동기로 로드하여 각각 header와 footer 요소에 삽입
 */
document.addEventListener('DOMContentLoaded', () => {
  loadComponent('header', './header.html'); // header 요소에 header.html 로드
  loadComponent('footer', './footer.html'); // footer 요소에 footer.html 로드
});



/**
 * 페이지 로드 시 애니메이션 초기화 및 주기적으로 애니메이션 변경
 */
document.addEventListener('DOMContentLoaded', () => {
  const element = document.querySelectorAll('.ad-ment'); // 애니메이션 대상 요소

  let aniNum = 1; // 애니메이션 상태를 나타내는 변수

  /**
   * 애니메이션 토글 함수
   * - 요소에 적용된 애니메이션 클래스를 주기적으로 변경
   */
  const toggleAnimation = () => {
    element.forEach((element) => {
      switch (aniNum) {
        case 1: // slide-in 애니메이션 추가
          element.classList.remove('slide-out');
          element.classList.add('slide-in');
          break;
        case 2: // jello 애니메이션 추가
          element.classList.remove('slide-in');
          element.classList.add('jello');
          break;
        case 3: // slide-out 애니메이션 추가
          element.classList.remove('jello');
          element.classList.add('slide-out');
          break;
      }
    });
    aniNum++; // 다음 애니메이션 상태로 이동
    if (aniNum == 4) aniNum = 1; // 애니메이션 순환
  };
  toggleAnimation(); // 초기 애니메이션 설정

  // 2초 간격으로 애니메이션 변경
  setInterval(toggleAnimation, 2000);
});

/**
 * 연극 상세 정보를 가져와 페이지로 이동
 * @param {number} seq - 연극 고유 번호
 */
async function fetchPlayDetails(seq) {
  try {
    window.location.href = `details.html?seq=${seq}`; // 상세 정보 페이지로 이동
  } catch (error) {
    console.error('Error fetching play details:', error); // 오류 로그 출력
  }
}

let plays; // 연극 목록 데이터를 저장
const playList = document.getElementById('playList'); // 연극 목록 표시 영역
const playList2 = document.getElementById('playList2'); // 추가 연극 목록 표시 영역
let firstLoad = 1; // 첫 번째 로드 여부를 나타내는 변수

/**
 * 연극 데이터를 API에서 가져옴
 * @param {string} fromDate - 시작 날짜
 * @param {string} toDate - 종료 날짜
 */
async function fetchPlays(fromDate = '20240101', toDate = '20251231') {
  const loadingElement = document.getElementById('loading'); // 로딩 화면 요소

  try {
    loadingElement.style.display = 'flex'; // 로딩 화면 표시

    await new Promise((resolve) => setTimeout(resolve, 1000)); // 1초 지연

    const apiUrl = `http://localhost:3000/api/plays?from=${fromDate}&to=${toDate}&rows=1000`; // API URL
    const response = await fetch(apiUrl);

    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`); // HTTP 오류 처리

    const data = await response.json();
    plays = data.perforList; // API 데이터 저장
    playList.innerHTML = ''; // 기존 목록 초기화
    playList2.innerHTML = '';

    if (plays.length > 0) {
      plays.forEach((play) => {
        const playDiv = document.createElement('div'); // 연극 정보를 담을 div 생성
        playDiv.className = 'play';
        playDiv.innerHTML = `
          <div class="play-thumbnail">
            <img src="${play.thumbnail || './images/default-image.jpg'}" alt="${play.title || 'No title'}" class="play-image" />
          </div>
          <h3 class="play-title">${play.title || 'No title'}</h3>
          <p style="visibility: hidden;" class="play-startDate">${play.startDate || 'No start date'}</p>
          <p style="visibility: hidden;" class="play-endDate">${play.endDate || 'No end date'}</p>
          <p style="visibility: hidden;" class="play-place">${play.place || 'No place'}</p>
          <p style="visibility: hidden;" class="play-area">${play.area || 'No place'}</p>
        `;

        const backgroundOverlay = document.getElementById('background-overlay'); // 배경 오버레이 요소
        const backgroundImage = backgroundOverlay.querySelector('img');

        // 마우스 오버 시 배경 이미지 변경
        playDiv.addEventListener('mouseover', () => {
          const thumbnail = playDiv.querySelector('.play-thumbnail img').src;
          backgroundImage.src = thumbnail;
          backgroundOverlay.style.opacity = '0.6'; // 배경 투명도 설정
        });

        // 마우스 아웃 시 배경 이미지 숨김
        playDiv.addEventListener('mouseout', () => {
          backgroundOverlay.style.opacity = '0';
        });

        // 클릭 시 상세 정보 페이지로 이동
        playDiv.addEventListener('click', () => fetchPlayDetails(play.seq));

        playList.appendChild(playDiv);

        // 첫 로드 시 추가 목록에도 연극 정보 추가
        if (firstLoad) {
          const playDiv2 = playDiv.cloneNode(true);
          playDiv2.addEventListener('mouseover', () => {
            const thumbnail = playDiv.querySelector('.play-thumbnail img').src;
            backgroundImage.src = thumbnail;
            backgroundOverlay.style.opacity = '0.6';
          });

          playDiv2.addEventListener('mouseout', () => {
            backgroundOverlay.style.opacity = '0';
          });

          playDiv2.addEventListener('click', () => fetchPlayDetails(play.seq));

          playList2.appendChild(playDiv2);
        }
      });
    } else {
      playList.innerHTML = '<p>No plays found.</p>'; // 연극 정보가 없을 경우 메시지 표시
    }
  } catch (error) {
    console.error('Error fetching play data:', error); // 오류 로그 출력
  } finally {
    loadingElement.style.display = 'none'; // 로딩 화면 숨기기
  }
}

/**
 * 검색 필터를 기반으로 연극 데이터를 필터링
 */
function searchPlays() {
  const fromDateElement = document.getElementById('fromDate');
  const toDateElement = document.getElementById('toDate');
  const searchInputElement = document.getElementById('searchInput');
  const areaElement = document.getElementById('area');

  const area = areaElement?.value.trim() || null;
  const fromDate = fromDateElement?.value.replace(/-/g, '') || null;
  const toDate = toDateElement?.value.replace(/-/g, '') || null;
  const keyword = searchInputElement?.value.trim() || null;

  firstLoad = 0; // 첫 로드 플래그 해제
  filterPlays(area, fromDate, toDate, keyword); // 필터링 수행
}

/**
 * 필터 조건에 따라 연극 데이터를 화면에 표시
 */
function filterPlays(area, fromDate, toDate, keyword) {
  const carousel = document.querySelector('.carousel');
  carousel.addEventListener('wheel', (event) => {
    event.preventDefault(); // 기본 스크롤 동작 방지
    carousel.scrollLeft += event.deltaY * 7; // 세로 스크롤을 가로로 변환
  });

  playList2.innerHTML = ''; // 추가 목록 초기화
  const noPlayElement = document.getElementById('noPlay'); // "결과 없음" 표시
  noPlayElement.style.display = 'none';

  const filteredPlays = document.querySelectorAll('.play');
  let checkPlay = 1;

  filteredPlays.forEach((play) => {
    play.style.display = 'flex'; // 기본적으로 표시
    const title = play.querySelector('.play-title').textContent.trim();
    const playArea = play.querySelector('.play-area').textContent.trim();
    const playStartDate = Number(play.querySelector('.play-startDate').textContent.trim());
    const playEndDate = Number(play.querySelector('.play-endDate').textContent.trim());

    const matchesKeyword = keyword ? title.includes(keyword) : true;
    const matchesArea = area ? playArea && area.includes(playArea) : true;
    const matchesFromDate = fromDate ? playStartDate >= fromDate : true;
    const matchesToDate = toDate ? playEndDate <= toDate : true;

    if (matchesKeyword && matchesArea && matchesFromDate && matchesToDate) {
      checkPlay++;
    } else {
      play.style.display = 'none';
    }
  });

  if (checkPlay === 1) noPlayElement.style.display = 'flex'; // 결과 없음 표시
}

/**
 * 필터 옵션을 토글
 */
function toggleFilterOptions() {
  const filterOptions = document.getElementById('filterOptions');
  filterOptions.style.display = filterOptions.style.display === 'none' || filterOptions.style.display === '' ? 'block' : 'none';
}

/**
 * DOMContentLoaded 이벤트로 연극 데이터 가져오기
 */
document.addEventListener('DOMContentLoaded', () => {
  fetchPlays(); // 기본 연극 데이터 가져오기
});



/*
let currentPage = 1;
let totalPages = 1;
const playPerPage = 1000;

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
*/