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
//// ===================================================
// (Firebase 초기화 코드는 HTML에 추가)

// ===================================================
// 3. 방명록 기능 (Firebase 사용) - 완전한 자유!
// ===================================================

// 이 함수는 이제 우리가 직접 만듭니다.
async function showGuestbook() {
    // 1. 레이아웃과 입력창은 우리 마음대로 HTML/CSS로 디자인합니다.
    mainContent.innerHTML = `
        <h2>방명록 (직접 만든 버전)</h2>
        <form id="firebase-form">
            <input type="text" id="guest-name" placeholder="이름" required>
            <textarea id="guest-message" placeholder="메시지" required></textarea>
            <button type="submit">글 남기기</button>
        </form>
        <div id="firebase-entries"></div> `;
    
    // 2. 폼 제출 이벤트를 직접 처리
    document.getElementById('firebase-form').addEventListener('submit', saveEntryToFirebase);
    
    // 3. Firebase에서 글 목록을 불러와서 화면에 표시
    await loadEntriesFromFirebase();
}

// Firebase에 데이터를 저장하는 함수
async function saveEntryToFirebase(event) {
    event.preventDefault();
    const name = document.getElementById('guest-name').value;
    const message = document.getElementById('guest-message').value;

    // Firebase의 "entries"라는 컬렉션에 데이터 추가
    // await db.collection("entries").add({ name: name, message: message, date: new Date() });
    
    // 저장 후 목록 새로고침
    await loadEntriesFromFirebase();
}

// Firebase에서 데이터를 불러오는 함수
async function loadEntriesFromFirebase() {
    const entriesDiv = document.getElementById('firebase-entries');
    entriesDiv.innerHTML = ''; // 기존 목록 비우기
    
    // Firebase의 "entries" 컬렉션에서 모든 문서 가져오기
    // const querySnapshot = await db.collection("entries").orderBy("date", "desc").get();
    
    // querySnapshot.forEach(doc => {
    //     // 받아온 데이터로 HTML 요소를 직접 만들어서 추가
    //     // const entry = doc.data();
    //     // const newDiv = document.createElement('div');
    //     // newDiv.innerHTML = `<p><strong>${entry.name}</strong>: ${entry.message}</p>`;
    //     // entriesDiv.appendChild(newDiv);
    // });
}