// HTML 엔티티를 디코딩하는 함수
function decodeHtmlEntities(str) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  return textarea.value;
}

// 연극 상세 정보를 가져오는 함수
async function fetchPlayDetails(seq) {
  try {
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
    if (data.url) document.getElementById('ticketLink').setAttribute('href', data.url);
    else document.getElementById('ticketLink').onclick = () => alert('에매 정보 없음');

  } catch (error) {
    console.error('상세 정보를 가져오는 중 오류 발생:', error);

    const detailsContainer = document.getElementById('detailsContainer');
    if (detailsContainer) {
      detailsContainer.innerHTML = `<p>상세 정보를 가져오는 중 오류가 발생했습니다. (${error.message})</p>`;
    }
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
