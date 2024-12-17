async function loadComponent(selector, filePath) {
  const element = document.querySelector(selector);
  if (!element) return;

  try {
    const response = await fetch(filePath);
    if (response.ok) {
      const content = await response.text();
      element.innerHTML = content;
    } else {
      console.error(`Failed to load ${filePath}: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadComponent('header', './header.html');
  loadComponent('footer', './footer.html');
});

// HTML 엔티티를 디코딩하는 함수
function decodeHtmlEntities(str) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  return textarea.value;
}

function fetchMap(data) {
  const gpsX = parseFloat(data.gpsX).toFixed(6);
  const gpsY = parseFloat(data.gpsY).toFixed(6);

  var mapContainer = document.getElementById('map'), // 지도를 표시할 div 
    mapOption = {
      center: new kakao.maps.LatLng(gpsY, gpsX), // 지도의 중심좌표
      level: 3 // 지도의 확대 레벨
    };

  var map = new kakao.maps.Map(mapContainer, mapOption); // 지도를 생성합니다

  // 마커를 표시할 위치입니다 
  var position = new kakao.maps.LatLng(gpsY, gpsX);

  // 마커를 생성합니다
  var marker = new kakao.maps.Marker({
    position: position,
    clickable: true // 마커를 클릭했을 때 지도의 클릭 이벤트가 발생하지 않도록 설정합니다
  });

  // 마커를 지도에 표시합니다.
  marker.setMap(map);

  // 마커에 클릭이벤트를 등록합니다
  kakao.maps.event.addListener(marker, 'click', function () {
    window.open(`https://map.kakao.com/link/map/${gpsY},${gpsX}`, '_blank');
  });
}

// 연극 상세 정보를 가져오는 함수
async function fetchPlayDetails(seq) {
  const kakaoMapKey = 'f66afe2b94ea56df5261de1bec424e9d';
  const loadingElement = document.querySelector('#loadingDetails');

  try {
    // 로딩 화면 보이기
    loadingElement.style.display = 'flex';
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const apiUrl = `http://localhost:3000/api/plays/details/${seq}`;
    console.log('API 호출 URL:', apiUrl);

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`상태 코드: ${response.status}, 메시지: 해당 연극 정보를 찾을 수 없습니다.`);
    }

    const data = await response.json();
    console.log('API 응답 데이터:', data);

    const convertToDate = (dateStr) => {
      if (!dateStr) return null;
      const formattedDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
      return formattedDate;
    };

    // DOM 요소에 데이터 삽입 (HTML 엔티티 디코딩 적용)
    document.getElementById('title').textContent = decodeHtmlEntities(data.title || '제목 없음');
    document.getElementById('place').textContent = data.place || '장소 없음';
    document.getElementById('period').textContent = convertToDate(data.startDate) + ' ~ ' + convertToDate(data.endDate) || '기간 정보 없음';
    document.getElementById('price').textContent = data.price || '가격 정보 없음';
    document.getElementById('poster').src = data.imgUrl || './images/default-image.jpg';
    document.getElementById('phone').textContent = data.phone || '문의 정보 없음';
    document.getElementById('poster').alt = decodeHtmlEntities(data.title || '이미지 없음');
    if (data.url) document.getElementById('ticketLink').onclick = () => window.open(data.url, '_blank');
    else document.getElementById('ticketLink').onclick = () => alert('에매 정보 없음');


    // 카카오 맵
    const mapDiv = document.getElementById('map');
    if (data.gpsX) fetchMap(data);
    else mapDiv.innerHTML = '<h3>지도 정보 없음</h3>';

  } catch (error) {
    console.error('상세 정보를 가져오는 중 오류 발생:', error);

    const detailsContainer = document.getElementById('detailsContainer');
    if (detailsContainer) {
      detailsContainer.innerHTML = `<p>상세 정보를 가져오는 중 오류가 발생했습니다. (${error.message})</p>`;
    }
  } finally {
    // 로딩 화면 숨기기
    loadingElement.style.display = 'none';
  }
}

// 페이지 로드 시 seq 쿼리 파라미터를 사용하여 연극 상세 정보를 가져옴
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const seq = urlParams.get('seq');
  console.log('URL에서 가져온 seq 값:', seq);

  if (seq) {
    fetchPlayDetails(seq);
  } else {
    console.error('seq 파라미터가 제공되지 않았습니다.');
    const detailsContainer = document.getElementById('detailsContainer');
    if (detailsContainer) {
      detailsContainer.innerHTML = '<p>연극 정보를 불러올 수 없습니다. 잘못된 접근입니다.</p>';
    }
  }
});
