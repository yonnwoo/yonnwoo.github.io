// ===================================================
// 1. 메뉴 클릭 시 콘텐츠 변경 기능
// ===================================================

// 콘텐츠가 표시될 main 영역을 가져와서 변수에 저장
const mainContent = document.getElementById('main-content');

// 'Home' 콘텐츠를 보여주는 함수
function showHome() {
    mainContent.innerHTML = `
    <div class='hometext'>
        <p>안녕하세요.</p>
        </div>
    `;
}

// 'About' 콘텐츠를 보여주는 함수
function showAbout() {
    mainContent.innerHTML = `
        <p>저에 대한 소개를 적는 공간입니다.</p>
    `;
}

// 'Blog' 콘텐츠를 보여주는 함수
function showBlog() {
    mainContent.innerHTML = `
        <h2>블로그</h2>
        <article>
            <p>첫 번째 글</p>
            <p>블로그 글 내용입니다...</p>
        </article>
        <article>
            <p>두 번째 글</p>
            <p>두 번째 블로그 글 내용입니다...</p>
        </article>
    `;
}

// Contact 메뉴가 추가되었을 경우를 대비한 함수
function showContact() {
    mainContent.innerHTML = `
        <p>연락처 정보를 남겨주세요.</p>
    `;
}


// ===================================================
// 2. 서울 날씨 고정 표시 기능
// ===================================================

// OpenWeatherMap에서 발급받은 본인의 API 키를 여기에 붙여넣으세요!
const API_KEY = "3f742a0f9a73ebf221c0609ed74b2928";

// 서울의 위도와 경도 (미리 정해진 값)
const SEOUL_LAT = 37.5665;
const SEOUL_LON = 126.9780;

// 서울 날씨 API를 호출하기 위한 주소
const url = `https://api.openweathermap.org/data/2.5/weather?lat=${SEOUL_LAT}&lon=${SEOUL_LON}&appid=${API_KEY}&units=metric`;

// fetch를 사용해 url에 있는 날씨 정보를 요청합니다.
fetch(url)
    .then(response => response.json()) // 받아온 정보를 json 형태로 변환
    .then(data => {
        const weatherIcon = document.getElementById('weather-icon');
        const weatherId = data.weather[0].id; // 날씨 상태 코드

        if (weatherId >= 200 && weatherId < 300) {
            weatherIcon.innerText = '☈'; // 뇌우
        } else if (weatherId >= 300 && weatherId < 600) {
            weatherIcon.innerText = '☂ ☂ ☂'; // 비
        } else if (weatherId >= 600 && weatherId < 700) {
            weatherIcon.innerText = '☃'; // 눈
        } else if (weatherId >= 700 && weatherId < 800) {
            weatherIcon.innerText = '~'; // 안개
        } else if (weatherId === 800) {
            weatherIcon.innerText = '☼'; // 맑음
        } else if (weatherId > 800) {
            weatherIcon.innerText = '☁'; // 흐림
        }
    })
    .catch(error => {
        // 에러가 발생하면 콘솔에 표시
        console.error('날씨 정보를 가져오는 데 실패했습니다:', error);
        const weatherIcon = document.getElementById('weather-icon');
        weatherIcon.innerText = '☉'; // 에러 발생 시 아이콘
    });
    // ===================================================

// ===================================================
// 3. 방명록 기능 (Cusdis 사용)
// ===================================================

function showGuestbook() {
    // 1. 방명록 기본 HTML 구조를 main-content에 넣기
    mainContent.innerHTML = `
        <h2>방명록</h2>
        <p>자유롭게 글을 남겨주세요!</p>
        
        <div id="cusdis_thread"
          data-host="https://cusdis.com"
          data-app-id="812bc256-e058-4abb-874c-65b8e0ee7854"
          data-page-id="guestbook"
          data-page-url="/guestbook"
          data-page-title="방명록"
        ></div>
    `;

    // 2. Cusdis 스크립트를 동적으로 불러오기
    // 이전에 불러온 스크립트가 있다면 제거
    const oldScript = document.getElementById('cusdis-script');
    if (oldScript) {
        oldScript.remove();
    }

    // 새로운 스크립트 추가
    const script = document.createElement('script');
    script.id = 'cusdis-script';
    script.async = true;
    script.src = 'https://cusdis.com/js/cusdis.es.js';
    document.head.appendChild(script);
}

// saveEntry, loadEntries 함수는 이제 필요 없으니 지워도 됩니다.


