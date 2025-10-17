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
// 3. 방명록 기능
// ===================================================

function showGuestbook() {
    // 1. 방명록 기본 HTML 구조를 main-content에 넣기
    mainContent.innerHTML = `
        <form id="guestbook-form">
            <input type="text" id="guest-name" placeholder="이름" required>
            <textarea id="guest-message" placeholder="메시지를 입력하세요..." required></textarea>
            <button type="submit">글 남기기</button>
        </form>
        
        <div id="guestbook-entries"></div>
    `;

    // 2. 저장된 글들을 화면에 표시하기
    loadEntries();

    // 3. 폼(Form)에 'submit' 이벤트가 발생하면, saveEntry 함수를 실행하도록 연결
    const guestbookForm = document.getElementById('guestbook-form');
    guestbookForm.addEventListener('submit', saveEntry);
}

// Local Storage에서 글을 불러와 화면에 보여주는 함수
function loadEntries() {
    // 'entries' 라는 이름으로 저장된 데이터가 없으면 빈 배열 '[]'을 사용
    const entries = JSON.parse(localStorage.getItem('entries')) || [];
    const entriesDiv = document.getElementById('guestbook-entries');
    entriesDiv.innerHTML = ''; // 기존 목록을 깨끗하게 비움

    // 각각의 글(entry)을 HTML로 만들어서 추가
    entries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'entry'; // CSS 꾸미기를 위해 클래스 이름 추가
        entryDiv.innerHTML = `
            <p><strong>${entry.name}</strong> (${new Date(entry.date).toLocaleString()})</p>
            <p>${entry.message}</p>
        `;
        entriesDiv.appendChild(entryDiv);
    });
}

// 새로운 글을 Local Storage에 저장하는 함수
function saveEntry(event) {
    // 폼(Form)을 제출할 때 페이지가 새로고침되는 기본 동작을 막음
    event.preventDefault();

    const nameInput = document.getElementById('guest-name');
    const messageInput = document.getElementById('guest-message');
    
    // 새로운 글 객체(Object) 만들기
    const newEntry = {
        name: nameInput.value,
        message: messageInput.value,
        date: new Date()
    };

    const entries = JSON.parse(localStorage.getItem('entries')) || [];
    entries.push(newEntry); // 기존 목록에 새로운 글 추가

    // Local Storage에 다시 저장 (객체를 문자열로 변환해서 저장)
    localStorage.setItem('entries', JSON.stringify(entries));

    // 입력창 비우기
    nameInput.value = '';
    messageInput.value = '';

    // 목록 새로고침
    loadEntries();

}
