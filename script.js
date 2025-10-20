// ===================================================
// 1. 메뉴 클릭 시 콘텐츠 변경 기능
// ===================================================

// 콘텐츠가 표시될 main 영역을 가져와서 변수에 저장
const mainContent = document.getElementById('main-content');

// 'Home' 콘텐츠에 비 내리는 ':' 효과를 적용하는 함수 (수정)
function showHome() {
    // 1. 다른 타이머 중지 (필요시)
    // if (homeIntervalId) { clearInterval(homeIntervalId); homeIntervalId = null; }

    // 2. 비 효과를 위한 설정
    const rainChar = '|'; // 떨어지는 문자
    const numberOfDrops = 30; // 떨어지는 문자 개수 (조절 가능)

    // 3. 떨어지는 문자들을 담을 HTML 생성
    let rainingHTML = "<div class='hometext raining-text-container'>"; // 전체 컨테이너
    for (let i = 0; i < numberOfDrops; i++) {
        const randomDelay = Math.random() * 5; // 0초 ~ 5초 사이의 지연 (더 길게)
        const randomDuration = 1 + Math.random() * 5; // 1초 ~ 6초 사이의 속도
        const randomLeft = Math.random() * 100; // 0% ~ 100% 사이의 가로 위치

        rainingHTML += `<span class="raining-char" style="left: ${randomLeft}%; animation-delay: ${randomDelay}s; animation-duration: ${randomDuration}s;">${rainChar}</span>`;
    }
    rainingHTML += "</div>";

    // 4. 생성된 HTML을 mainContent에 넣기
    mainContent.innerHTML = rainingHTML;
}

// ⭐ 중요: 다른 show... 함수들(showAbout, showDiary, showGuestbook) 맨 윗줄에
// 혹시 이전에 추가했던 타이머 중지 코드(if (homeIntervalId)...)가 있다면
// 이제 필요 없으니 삭제해주세요!

// 'About' 콘텐츠를 보여주는 함수
function showAbout() {
    mainContent.innerHTML = `
        <p>저에 대한 소개를 적는 공간입니다.</p>
    `;
}

// 'Blog' 콘텐츠를 보여주는 함수 (게시판 목록)
async function showBlog() {
    mainContent.innerHTML = `
        <h2>블로그</h2>
        <div id="post-list">
            <p>게시글 목록을 불러오는 중...</p>
        </div>
    `;

    // Supabase의 'posts' 테이블에서 id, title, created_at 열을 가져옵니다.
    const { data, error } = await supabase
        .from('posts')
        .select('id, title, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('블로그 목록 로딩 중 에러 발생:', error);
        return;
    }

    const postListDiv = document.getElementById('post-list');
    postListDiv.innerHTML = ''; // '로딩 중...' 메시지 제거

    if (data.length === 0) {
        postListDiv.innerHTML = "<p>아직 작성된 글이 없습니다.</p>";
        return;
    }
    
    // 게시글 목록을 담을 ul 태그 생성
    const ul = document.createElement('ul');
    ul.className = 'post-list-ul'; // CSS용 클래스

    data.forEach(post => {
        const li = document.createElement('li');
        // 각 li를 클릭하면 showBlogPost(게시글_id) 함수를 실행
        li.innerHTML = `<a href="#" onclick="showBlogPost(${post.id})">${post.title}</a>`;
        ul.appendChild(li);
    });

    postListDiv.appendChild(ul);
}

// 특정 게시글 하나를 보여주는 함수
async function showBlogPost(postId) {
    mainContent.innerHTML = `<p>게시글을 불러오는 중...</p>`;
    
    // 'posts' 테이블에서 특정 id를 가진 글 하나만 선택해서 모든 열(*)을 가져옵니다.
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId) // 'id'가 postId와 equal(같은) 것을 찾음
        .single(); // 결과가 하나만 있다고 알려줌

    if (error) {
        console.error('게시글 로딩 중 에러 발생:', error);
        mainContent.innerHTML = `<p>게시글을 불러오는 데 실패했습니다.</p>`;
        return;
    }

    if (data) {
        mainContent.innerHTML = `
            <div class="post-view">
                <h2>${data.title}</h2>
                <p class="post-meta">작성일: ${new Date(data.created_at).toLocaleString()}</p>
                <div class="post-content">
                    ${data.content.replace(/\n/g, '<br>')}
                </div>
                <button onclick="showBlog()">목록으로 돌아가기</button>
            </div>
        `;
    }
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
        weatherIcon.className = ''; // 클래스 초기화

        if (weatherId >= 200 && weatherId < 300) {
            weatherIcon.innerText = '☈\uFE0E ☈\uFE0E ☈\uFE0E'; // 뇌우
            weatherIcon.classList.add('weather-thunderstorm');
        } else if (weatherId >= 300 && weatherId < 600) {
            weatherIcon.innerText = '☂\uFE0E ☂\uFE0E ☂\uFE0E'; // 비
            weatherIcon.classList.add('weather-rain');
        } else if (weatherId >= 600 && weatherId < 700) {
            weatherIcon.innerText = '☃\uFE0E ☃\uFE0E ☃\uFE0E'; // 눈
            weatherIcon.classList.add('weather-snow');
        } else if (weatherId >= 700 && weatherId < 800) {
            weatherIcon.innerText = '~ ~ ~'; // 안개
            weatherIcon.classList.add('weather-mist');
        } else if (weatherId === 800) {
            weatherIcon.innerText = '☼\uFE0E ☼\uFE0E ☼\uFE0E'; // 맑음
            weatherIcon.classList.add('weather-sunny');
        } else if (weatherId > 800) {
            weatherIcon.innerText = '☁\uFE0E ☁\uFE0E ☁\uFE0E'; // 흐림
            weatherIcon.classList.add('weather-cloudy');
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
// 3. 방명록 기능 (Supabase 사용 - 2단 레이아웃)
// ===================================================

// 방명록 화면을 보여주는 메인 함수
function showGuestbook() {
    // 1. 2단 레이아웃 HTML 구조를 만듭니다.
    mainContent.innerHTML = `
        <div class="guestbook-layout"> 
            <div id="guestbook-entries-area"> 
                <h3>방명록</h3>
                <div id="guestbook-entries">
                    <p>로딩 중...</p> 
                </div>
            </div>
            <div id="guestbook-form-area"> 
                <h3>글 남기기</h3>
                <p>욕은 삼가해주세요</p> 
                <form id="guestbook-form">
                    <input type="text" id="guest-name" placeholder="이름 (선택)">
                    <textarea id="guest-message" placeholder="메시지를 입력하세요..." required></textarea>
                    <button type="submit">글 남기기</button>
                </form>
            </div>
        </div>
    `;

    // 2. 폼 제출 이벤트 연결 및 목록 로딩 (기존과 동일)
    document.getElementById('guestbook-form').addEventListener('submit', saveEntry);
    loadEntries();
}

// saveEntry 함수와 loadEntries 함수는 수정할 필요 없이 그대로 둡니다.
// (loadEntries 함수는 이제 #guestbook-entries 영역에 목록을 채워넣을 것입니다.)

// 폼에 작성된 글을 Supabase에 저장하는 함수 (익명 기능 추가)
async function saveEntry(event) {
    event.preventDefault();

    const nameInput = document.getElementById('guest-name');
    const messageInput = document.getElementById('guest-message');

    // 이름 입력값 가져오기 (앞뒤 공백 제거)
    let nameToSave = nameInput.value.trim(); 

    // 이름이 비어있으면 '익명'으로 설정
    if (nameToSave === '') {
        nameToSave = '비밀';
    }

    // supabase.from("entries")는 "entries"라는 이름의 표를 의미
    const { data, error } = await supabase
        .from('entries')
        .insert([
            // nameToSave 변수를 사용하여 저장
            { name: nameToSave, message: messageInput.value.trim() } 
        ]);

    if (error) {
        console.error('저장 중 에러 발생:', error);
    } else {
        console.log('글이 성공적으로 저장되었습니다:', data);
        nameInput.value = ''; // 이름 입력창 비우기
        messageInput.value = ''; // 메시지 입력창 비우기
        loadEntries(); // 저장 후 목록 새로고침
    }
}

// Supabase에서 글 목록을 불러와 화면에 표시하는 함수
async function loadEntries() {
    const entriesDiv = document.getElementById('guestbook-entries');
    entriesDiv.innerHTML = '';

    // "entries" 표에서 모든 데이터(*)를 'created_at' 기준으로 내림차순 정렬해서 선택
    const { data, error } = await supabase
        .from('entries')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('데이터 로딩 중 에러 발생:', error);
        return;
    }
    
    if (data.length === 0) {
        entriesDiv.innerHTML = "<p>아직 등록된 글이 없습니다.</p>";
        return;
    }

    data.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'entry';
        const date = new Date(entry.created_at).toLocaleString();

        entryDiv.innerHTML = `
            <p><sup> ${entry.name}  &nbsp&nbsp${date}</sup></p>
            <p>${entry.message.replace(/\n/g, '<br>')}</p> 
        `; // <-- 바로 이 부분 수정!
        entriesDiv.appendChild(entryDiv);
    });
}

// ===================================================
// 4. 유튜브 배경 음악 제어 기능 (볼륨 수정 완료)
// ===================================================

const YOUTUBE_VIDEO_ID = '5DtO0QpEfnU'; // 님의 영상 ID 유지

const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

let player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('youtube-player', {
    height: '0',
    width: '0',
    videoId: YOUTUBE_VIDEO_ID,
    playerVars: {
      'playsinline': 1,
      'loop': 1,
      'playlist': YOUTUBE_VIDEO_ID,
      'controls': 0
    },
    events: {
      'onReady': onPlayerReady
    }
  });
}

function onPlayerReady(event) {
    event.target.setVolume(30); // 볼륨 30
}

document.addEventListener('DOMContentLoaded', () => {
    const musicButton = document.getElementById('music-button');
    if (musicButton) {
        musicButton.addEventListener('click', toggleMusic);
    }
});

function toggleMusic() {
    if (player && typeof player.getPlayerState === 'function') {
        const musicButton = document.getElementById('music-button');
        const playerState = player.getPlayerState();

        if (playerState === YT.PlayerState.PLAYING) {
            player.pauseVideo();
            musicButton.textContent = '♪\uFE0E'; // 님의 아이콘 유지
        } else {
            player.playVideo();
            musicButton.textContent = '♬\uFE0E'; // 님의 아이콘 유지
        }
    }
}

// ===================================================
// 5. 통합 일기장 (Blog + Calendar) 기능 (최종 수정본)
// ===================================================

// 현재 달력이 보고 있는 날짜를 저장할 변수
let diaryNavDate = new Date();

// "Blog" 메뉴 클릭 시 실행되는 메인 함수
function showDiary() {
    // 1. 2단 레이아웃(일기+달력) HTML을 mainContent에 그립니다.
    mainContent.innerHTML = `
        <div class="diary-layout">
            <div id="diary-post-content">
                <h2>일기</h2>
                <p>오른쪽 달력에서 글을 쓴 날짜를 선택하세요.</p>
            </div>
            <div id="diary-calendar-area">
                </div>
        </div>
    `;

    // 2. 우측 영역에 달력을 그립니다.
    drawDiaryCalendar(diaryNavDate.getFullYear(), diaryNavDate.getMonth());
}

// 오른쪽 영역에 드롭다운이 포함된 달력을 그리는 함수
async function drawDiaryCalendar(year, month) {
    const calendarArea = document.getElementById('diary-calendar-area');

// --- 1. 년/월 드롭다운 HTML 생성 ---
    let yearOptions = '';
    const currentYear = new Date().getFullYear();
    // 시작 년도를 1990으로 변경 (원하는 년도로 조절 가능)
    for (let i = 1990; i <= currentYear + 10; i++) { 
        yearOptions += `<option value="${i}" ${i === year ? 'selected' : ''}>${i}년</option>`;
    }

    let monthOptions = '';
    for (let i = 0; i <= 11; i++) { // 월은 0부터 11까지
        monthOptions += `<option value="${i}" ${i === month ? 'selected' : ''}>${i + 1}월</option>`;
    }

    // --- 2. 달력 뼈대 HTML 설정 ---
    calendarArea.innerHTML = `
        <div id="calendar-header">
            <button id="prev-month">←</button>
            <div id="date-select-wrapper">
                <select id="year-select">${yearOptions}</select>
                <select id="month-select">${monthOptions}</select>
            </div>
            <button id="next-month">→</button>
        </div>
        <div id="calendar-weekdays">
            <div id='sunday'>日</div><div>月</div><div>火</div><div>水</div><div>木</div><div>金</div><div id='saturday'>土</div>
        </div>
        <div id="calendar-grid"></div>
    `;

    // --- 3. 드롭다운 및 버튼에 이벤트 리스너 추가 ---
    const yearSelect = document.getElementById('year-select');
    const monthSelect = document.getElementById('month-select');

    // 년/월 드롭다운이 변경될 때 실행될 함수
    const handleDateChange = () => {
        const newYear = parseInt(yearSelect.value, 10);
        const newMonth = parseInt(monthSelect.value, 10);
        diaryNavDate = new Date(newYear, newMonth, 1); // 날짜 객체 업데이트
        drawDiaryCalendar(newYear, newMonth); // 달력 다시 그리기
    };

    yearSelect.addEventListener('change', handleDateChange);
    monthSelect.addEventListener('change', handleDateChange);

    // 이전/다음 달 버튼 이벤트
    document.getElementById('prev-month').addEventListener('click', () => {
        diaryNavDate.setMonth(diaryNavDate.getMonth() - 1);
        drawDiaryCalendar(diaryNavDate.getFullYear(), diaryNavDate.getMonth());
    });
    document.getElementById('next-month').addEventListener('click', () => {
        diaryNavDate.setMonth(diaryNavDate.getMonth() + 1);
        drawDiaryCalendar(diaryNavDate.getFullYear(), diaryNavDate.getMonth());
    });

    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '로딩 중...'; // 로딩 표시

    // --- 4. Supabase에서 게시글 데이터 가져오기 ---
    const startDate = new Date(year, month, 1).toISOString();
    const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, created_at, title')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

    if (error) {
        console.error('게시글 로딩 중 에러:', error);
        grid.innerHTML = '달력 로딩 실패';
        return;
    }

    const postMap = new Map();
    posts.forEach(post => {
        const postDate = new Date(post.created_at).getDate();
        postMap.set(postDate, post.id);
    });

    // --- 5. 달력 UI 그리기 ---
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    grid.innerHTML = ''; // 그리드 비우기

    for (let i = 0; i < firstDayOfMonth; i++) {
        grid.appendChild(document.createElement('div')).className = 'calendar-day empty';
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        dayCell.textContent = day;

        const postId = postMap.get(day);
        
        // ⭐ 비밀 날짜 확인 (1997년 8월 4일) ⭐
        if (year === 1997 && month === 7 && day === 4) { // month는 0부터 시작하므로 8월은 7
            dayCell.classList.add('secret-date'); // 특별한 스타일을 위한 클래스 (선택 사항)
            dayCell.title = '🤫'; // 마우스 올리면 보이는 힌트 (선택 사항)
            // 클릭하면 비밀 버튼 보여주는 함수 호출
            dayCell.onclick = () => showSecretWriteButton(postId); 
        } else if (postId) {
            // 일반 글 있는 날
            dayCell.classList.add('active-date');
            dayCell.onclick = () => loadDiaryPost(postId);
        } else {
            // 글 없는 날
            dayCell.classList.add('inactive-date');
        }
        grid.appendChild(dayCell);
    }
}

// 날짜 클릭 시, 왼쪽 영역에 일기를 불러오는 함수
async function loadDiaryPost(postId) {
    const postContentDiv = document.getElementById('diary-post-content');
    postContentDiv.innerHTML = `<p>일기를 불러오는 중...</p>`;
    
    // 'posts' 테이블에서 특정 id의 글을 가져옴
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single();

    if (error) {
        postContentDiv.innerHTML = `<p>일기를 불러오는 데 실패했습니다.</p>`;
        return;
    }

    if (data) {
        // 왼쪽 영역의 HTML만 교체
        postContentDiv.innerHTML = `
            <h2>${data.title}</h2>
            <p class="post-meta">작성일: ${new Date(data.created_at).toLocaleString()}</p>
            <div class="post-content">
                ${data.content} 
            </div>
        `;
    }
}
// ===================================================
// 6. 글쓰기 페이지 이동 기능 (인증 사용)
// ===================================================

async function goToWritePage() {
    // 현재 로그인 상태 확인
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
        console.error("로그인 상태 확인 중 에러:", error);
        alert("오류가 발생했습니다. 다시 시도해주세요.");
        return;
    }

    if (session) {
        // 이미 로그인되어 있다면 바로 write.html 로 이동
        window.location.href = 'write.html';
    } else {
        // 로그인되어 있지 않다면 login.html 로 이동
        window.location.href = 'login.html';
    }
}

// ===================================================
// 7. 비밀 글쓰기 버튼 보여주기 기능 (수정 완료)
// ===================================================

async function showSecretWriteButton(postId) {
    // ⭐ postContentDiv 변수를 여기서 정의합니다! ⭐
    const postContentDiv = document.getElementById('diary-post-content');
    
    // 요소가 존재하는지 확인 후 진행
    if (!postContentDiv) {
        console.error("ID 'diary-post-content'를 찾을 수 없습니다.");
        return; 
    }

    postContentDiv.innerHTML = `<p>데이터 확인 중...</p>`; 

    // postId가 있다면 해당 글을 불러옵니다 (없을 수도 있음)
    if (postId) {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('id', postId)
            .single();

        if (error && error.code !== 'PGRST116') { // "PGRST116" = 해당 ID의 글이 없는 경우의 에러 코드
            console.error('비밀 날짜 글 로딩 중 에러:', error);
            postContentDiv.innerHTML = '<p>비밀의 날...</p>'; 
        } else if (data) {
            // 글 내용 표시
            postContentDiv.innerHTML = `
                <h2>${data.title}</h2>
                <p class="post-meta">작성일: ${new Date(data.created_at).toLocaleString()}</p>
                <div class="post-content">
                    ${data.content.replace(/\n/g, '<br>')}
                </div>
            `;
        } else {
            // 해당 날짜에 글은 없지만 비밀 날짜인 경우
             postContentDiv.innerHTML = '<p>특별한 날입니다...</p>';
        }
    } else {
        // 해당 날짜에 글 자체가 없는 경우
        postContentDiv.innerHTML = '<p>1997년 8월 4일</p>';
    }

    // --- 여기에만 글쓰기 버튼 추가 ---
    const writeButton = document.createElement('button');
    writeButton.textContent = '글쓰러 가기';
    writeButton.className = 'admin-button diary-write-button'; 
    writeButton.onclick = goToWritePage; // goToWritePage 함수 호출

    postContentDiv.appendChild(writeButton); // 버튼 추가
}