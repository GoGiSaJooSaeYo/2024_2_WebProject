//페이지에 header.html과 footer.html 파일을 비동기로 로드하여 각각 header와 footer 요소에 삽입
async function loadComponent(selector, filePath) {
  const element = document.querySelector(selector);
  if (!element) return; // 요소가 없으면 함수 종료

  try {
    const response = await fetch(filePath);// HTML 파일을 가져오기 위해 HTTP 요청을 보냄
    if (response.ok) {
      const content = await response.text();
      element.innerHTML = content;
    } else {
      console.error(`Failed to load ${filePath}: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error); // 요청 중 발생한 네트워크 오류 출력
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadComponent('header', './header.html');
  loadComponent('footer', './footer.html');
});


//페이지 로드 시 애니메이션 초기화 및 주기적으로 애니메이션 변경
document.addEventListener('DOMContentLoaded', () => {
  const element = document.querySelectorAll('.ad-ment');

  let aniNum = 1;

  // 요소에 적용된 애니메이션 클래스를 주기적으로 변경
  const toggleAnimation = () => {
    element.forEach((element) => {
      switch (aniNum) {
        case 1:// slide-in 애니메이션 추가
          element.classList.remove('slide-out');
          element.classList.add('slide-in');
          break;
        case 2: // jello 애니메이션 추가
          element.classList.remove('slide-in');
          element.classList.add('jello');
          break;
        case 3: // slide-out 애니메이션 추가
          element.classList.remove('jello');
          element.classList.add('slide-out')
            ;
          break;
      }
    })
    aniNum++; // 다음 애니메이션 상태로 이동
    if (aniNum == 4) aniNum = 1; // 애니메이션 순환
  };
  toggleAnimation();

  // 일정 간격으로 애니메이션 전환
  setInterval(toggleAnimation, 2000);
});

//연극 상세 정보를 가져와 페이지로 이동
async function fetchPlayDetails(seq) {
  try {
    window.location.href = `details.html?seq=${encodeURIComponent(seq)}`;
  } catch (error) {
    console.error('Error fetching play details:', error);
  }
}

let plays;
const playList = document.getElementById('playList');
const playList2 = document.getElementById('playList2');
let playDiv = document.createElement('div');
let firstLoad = 1;

//연극 데이터를 API에서 가져옴
async function fetchPlays(fromDate = '20240101', toDate = '20251231') {
  const loadingElement = document.getElementById('loading');

  try {
    // 로딩 화면 보이기
    loadingElement.style.display = 'flex';

    await new Promise((resolve) => setTimeout(resolve, 1000));
    const apiUrl = `http://localhost:3000/api/plays?from=${fromDate}&to=${toDate}&rows=1000`;
    const response = await fetch(apiUrl);

    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const data = await response.json();

    plays = data.perforList; // API 데이터 저장
    playList.innerHTML = ''; // 기존 목록 초기화
    playList2.innerHTML = '';

    if (plays.length > 0) {
      plays.forEach((play) => {
        const playDiv = document.createElement('div'); // 루프 내에서 playDiv 생성

        playDiv.className = 'play';
        playDiv.innerHTML = `
          <div class="play-thumbnail">
            <img src="${play.thumbnail || './images/default-image.jpg'}" alt="${play.title || 'No title'}" class="play-image" />
          </div>
          <h3 class="play-title">${play.title || 'No title'}</h3>
          <p style="visibility: hidden;" class="play-startDate">${play.startDate || 'No start date'}</p>
          <p style="visibility: hidden;" class="play-endDate">${play.endDate || 'No end date'}</p>
          <p style="visibility: hidden;"class="play-place">${play.place || 'No place'}</p>
          <p style="visibility: hidden;"class="play-area">${play.area || 'No place'}</p>
          `; // 연극 정보 저장

        const backgroundOverlay = document.getElementById('background-overlay'); // 배경 오버레이 요소
        const backgroundImage = backgroundOverlay.querySelector('img');

        // 마우스 오버 시 배경 이미지 변경
        playDiv.addEventListener('mouseover', () => {
          const thumbnail = playDiv.querySelector('.play-thumbnail img').src;

          // 이미지와 투명도 설정
          backgroundImage.src = thumbnail;
          backgroundOverlay.style.opacity = '0.6'; // 70% 투명도
        });

        // 마우스 아웃 시 배경 이미지 숨김
        playDiv.addEventListener('mouseout', () => {
          backgroundOverlay.style.opacity = '0'; // 다시 투명하게
        });

        // 클릭 시 상세 정보 페이지로 이동
        playDiv.addEventListener('click', () => fetchPlayDetails(play.seq));

        // playList에 자식으로 추가
        playList.appendChild(playDiv);

        // 페이지 처음 로드 시에만 반복 애니메이션 적용을 위한 처리
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
      playList.innerHTML = '<p>No plays found.</p>';
    }
  } catch (error) {
    console.error('Error fetching play data:', error);
  } finally {
    // 로딩 화면 숨기기
    loadingElement.style.display = 'none';
  }
}

//검색 필터를 기반으로 연극 데이터를 필터링
function searchPlays() {
  const fromDateElement = document.getElementById('fromDate');
  const toDateElement = document.getElementById('toDate');
  const searchInputElement = document.getElementById('searchInput');
  const areaElement = document.getElementById('area');

  const area = areaElement && areaElement.value.trim() ? areaElement.value.trim() : null;
  const fromDate = fromDateElement && fromDateElement.value.trim() ? fromDateElement.value.replace(/-/g, '') : null;
  const toDate = toDateElement && toDateElement.value.trim() ? toDateElement.value.replace(/-/g, '') : null;
  const keyword = searchInputElement && searchInputElement.value.trim() ? searchInputElement.value.trim() : null;
  firstLoad = 0;// 첫 로드 플래그 해제
  filterPlays(area, fromDate, toDate, keyword);
}

//필터 조건에 따라 연극 데이터를 화면에 표시
function filterPlays(area, fromDate, toDate, keyword) {
  document.getElementsByClassName('carousel')[0].style.overflowX = 'auto';
  const carousel = document.querySelector('.carousel');

  carousel.addEventListener('wheel', (event) => {
    event.preventDefault(); // 기본 스크롤 동작 방지
    carousel.scrollLeft += event.deltaY * 7; // 세로 스크롤을 가로 스크롤로 변경
  });

  playList2.innerHTML = '';

  let noPlayElement = document.getElementById('noPlay');
  noPlayElement.style.display = 'none';

  const playListContainer = document.querySelector('.play-list');
  playListContainer.classList.add('paused');

  const filteredPlays = document.querySelectorAll('.play');
  let checkPlay = 1;

  filteredPlays.forEach((play) => {
    play.style.display = 'flex';// 기본적으로 표시
    const title = play.querySelector('.play-title').textContent.trim();
    const playArea = play.querySelector('.play-area').textContent.trim();
    const playStartDate = Number(play.querySelector('.play-startDate').textContent.trim());
    const playEndDate = Number(play.querySelector('.play-endDate').textContent.trim());

    const matchesKeyword = keyword ? title.includes(keyword) : true;
    const matchesArea = area ? playArea && area.includes(playArea) : true;
    const matchesFromDate = fromDate ? playStartDate && playStartDate >= fromDate : true;
    const matchesToDate = toDate ? playEndDate && playEndDate <= toDate : true;

    if (matchesKeyword && matchesArea && matchesFromDate && matchesToDate) {
      checkPlay++;
    } else {
      play.style.display = 'none'; // 조건에 맞지 않으면 none으로 필터링
    }
  });

  if (checkPlay == 1) noPlayElement.style.display = 'flex';
}

function toggleFilterOptions() {
  const filterOptions = document.getElementById('filterOptions');
  if (filterOptions.style.display === 'none' || filterOptions.style.display === '') {
    filterOptions.style.display = 'block';
  } else {
    filterOptions.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchPlays();
});
