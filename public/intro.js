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

// AOS 초기화
AOS.init();

/**
 * 스크롤 이벤트 리스너
 * - 페이지 스크롤 시 .observe 클래스가 적용된 요소의 위치 정보를 콘솔에 출력
 */
window.addEventListener('scroll', () => {
  const activeElements = document.querySelectorAll('.observe'); // 관찰할 요소들
  activeElements.forEach(element => {
    console.log(element.getBoundingClientRect()); // 요소의 뷰포트 내 위치 정보 출력
  });
});

/**
 * Intersection Observer를 이용하여 요소의 가시성을 관찰하는 함수
 * - 요소가 뷰포트 내에 나타날 때 'on' 클래스를 추가
 */
function observeVisibility() {
  const activeElements = document.querySelectorAll('.observe'); // 관찰할 대상 요소들

  /**
   * IntersectionObserver의 콜백 함수
   * @param {IntersectionObserverEntry[]} entries - 관찰 중인 요소들에 대한 정보
   * @param {IntersectionObserver} observer - 현재 IntersectionObserver 인스턴스
   */
  function handleIntersection(entries, observer) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('on'); // 요소가 화면에 나타나면 'on' 클래스 추가
        observer.unobserve(entry.target); // 한 번 관찰 후 해제
      }
    });
  }

  // Intersection Observer 생성
  const observer = new IntersectionObserver(handleIntersection, {
    root: null, // 기본 뷰포트를 기준으로 관찰
    rootMargin: '0px', // 추가 마진 없이 관찰
    threshold: 0.5, // 요소가 50% 이상 보일 때 트리거
  });

  // 모든 관찰 대상 요소를 Observer에 등록
  activeElements.forEach(element => {
    observer.observe(element);
  });
}

/**
 * 랜덤한 속성으로 funObject 요소를 이동, 크기 조정, 색상 변경
 */
document.addEventListener('DOMContentLoaded', () => {
  const funObject = document.querySelector('.funObject'); // 움직일 요소
  const funBackground = document.querySelector('.funBackground'); // 배경 요소

  /**
   * 랜덤 속성으로 funObject의 스타일 변경
   */
  function moveRandomly() {
    const maxX = funBackground.offsetWidth - funObject.offsetWidth; // X축 이동 가능 범위
    const maxY = funBackground.offsetHeight - funObject.offsetHeight; // Y축 이동 가능 범위

    const randomX = Math.random() * maxX; // X축 랜덤 위치
    const randomY = Math.random() * maxY; // Y축 랜덤 위치

    // 요소의 위치 변경
    funObject.style.transform = `translate(${randomX}px, ${randomY}px)`;

    // 랜덤 크기 변경
    const randomSize = Math.random() * 200 + 50; // 50px ~ 250px 범위
    funObject.style.width = `${randomSize}px`;
    funObject.style.height = `${randomSize}px`;

    // 랜덤 색상 변경
    const colors = ['#ff4500', '#1e90ff', '#32cd32', '#ff69b4', '#ffa500']; // 색상 배열
    const randomColor = colors[Math.floor(Math.random() * colors.length)]; // 랜덤 색상 선택
    funObject.style.background = `radial-gradient(circle, ${randomColor}, ${randomColor})`;

    // 랜덤 속도 변경
    const randomSpeed = Math.random() * 0.6 + 0.3; // 0.3초 ~ 0.9초 범위
    funObject.style.transitionDuration = `${randomSpeed}s`;
  }

  // 300ms마다 속성 변경
  setInterval(moveRandomly, 300);
});

/**
 * 페이지 로드 완료 시 Intersection Observer로 요소의 가시성 관찰 시작
 */
document.addEventListener('DOMContentLoaded', observeVisibility);
