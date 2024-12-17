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

AOS.init();

// 스크롤 이벤트 리스너
window.addEventListener('scroll', () => {
  const activeElements = document.querySelectorAll('.observe');
  activeElements.forEach(element => {
    element.getBoundingClientRect()
  });
});

function observeVisibility() {
  const activeElements = document.querySelectorAll('.observe');
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
    root: null,
    rootMargin: '0px',
    threshold: 0.8, // 요소가 80% 이상 보일 때 트리거
  });

  // 모든 관찰 대상 요소를 Observer에 등록
  activeElements.forEach(element => {
    observer.observe(element);
  });
}


//랜덤한 속성으로 funObject 요소를 이동, 크기 조정, 색상 변경
document.addEventListener('DOMContentLoaded', () => {
  const funObject = document.querySelector('.funObject');
  const funBackground = document.querySelector('.funBackground');

  function moveRandomly() {
    const maxX = funBackground.offsetWidth - funObject.offsetWidth;
    const maxY = funBackground.offsetHeight - funObject.offsetHeight;

    const randomX = Math.random() * maxX;
    const randomY = Math.random() * maxY;

    // 요소의 위치 변경
    funObject.style.transform = `translate(${randomX}px, ${randomY}px)`;

    // 랜덤 크기 변경
    const randomSize = Math.random() * 200 + 50;
    funObject.style.width = `${randomSize}px`;
    funObject.style.height = `${randomSize}px`;

    // 랜덤 색상 변경
    const colors = ['#ff4500', '#1e90ff', '#32cd32', '#ff69b4', '#ffa500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    funObject.style.background = `radial-gradient(circle, ${randomColor}, ${randomColor})`;

    // 랜덤 속도 변경
    const randomSpeed = Math.random() * 0.6 + 0.3;
    funObject.style.transitionDuration = `${randomSpeed}s`;
  }

  // 300ms마다 속성 변경
  setInterval(moveRandomly, 300);
});

document.addEventListener('DOMContentLoaded', observeVisibility);
