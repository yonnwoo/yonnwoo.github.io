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
// ===================================================
// 3. 방명록 기능 (Supabase 사용 - 완전한 자유!)
// ===================================================

// 방명록 화면을 보여주는 메인 함수
function showGuestbook() {
    // HTML 레이아웃은 Firebase 버전과 동일하게 사용합니다.
    mainContent.innerHTML = `
        <h3>방명록</h3>
        <p>욕은 삼가해주세요</p>
        
        <form id="guestbook-form">
            <input type="text" id="guest-name" placeholder="이름" required>
            <textarea id="guest-message" placeholder="메시지를 입력하세요..." required></textarea>
            <button type="submit">글 남기기</button>
        </form>
        
        <div id="guestbook-entries">
            <p>로딩 중...</p>
        </div>
    `;

    document.getElementById('guestbook-form').addEventListener('submit', saveEntry);
    loadEntries();
}

// 폼에 작성된 글을 Supabase에 저장하는 함수
async function saveEntry(event) {
    event.preventDefault();

    const nameInput = document.getElementById('guest-name');
    const messageInput = document.getElementById('guest-message');

    // supabase.from("entries")는 "entries"라는 이름의 표를 의미
    const { data, error } = await supabase
        .from('entries')
        .insert([
            { name: nameInput.value, message: messageInput.value }
        ]);

    if (error) {
        console.error('저장 중 에러 발생:', error);
    } else {
        console.log('글이 성공적으로 저장되었습니다:', data);
        nameInput.value = '';
        messageInput.value = '';
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
            <p><strong>${entry.name}</strong> (${date})</p>
            <p>${entry.message.replace(/\n/g, '<br>')}</p> 
        `; // <-- 바로 이 부분 수정!
        entriesDiv.appendChild(entryDiv);
    });
}

// ===================================================
// 4. 유튜브 배경 음악 제어 기능 (볼륨 수정 완료)
// ===================================================

const YOUTUBE_VIDEO_ID = 'ta4WEBJFX6k'; // 님의 영상 ID 유지

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
            musicButton.textContent = '▶'; // 님의 아이콘 유지
        } else {
            player.playVideo();
            musicButton.textContent = '⏸'; // 님의 아이콘 유지
        }
    }
}

// ===================================================
// 5. 커스텀 일기장 달력 기능 (새로운 코드)
// ===================================================

// 현재 달력이 보고 있는 날짜를 저장할 변수 (초기값은 오늘)
let navDate = new Date();

// "Calendar" 메뉴 클릭 시 실행되는 메인 함수
function showCalendar() {
    // 1. 달력의 기본 뼈대를 HTML로 만듭니다.
    mainContent.innerHTML = `
        <div id="calendar-container">
            <div id="calendar-header">
                <button id="prev-month">◀</button>
                <h2 id="month-year"></h2>
                <button id="next-month">▶</button>
            </div>
            <div id="calendar-weekdays">
                <div>일</div><div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div>토</div>
            </div>
            <div id="calendar-grid"></div>
        </div>
    `;

    // 2. 이전/다음 달 버튼에 클릭 이벤트를 연결합니다.
    document.getElementById('prev-month').addEventListener('click', () => {
        navDate.setMonth(navDate.getMonth() - 1); // 날짜를 한 달 전으로
        drawCalendar(navDate.getFullYear(), navDate.getMonth()); // 달력을 다시 그림
    });

    document.getElementById('next-month').addEventListener('click', () => {
        navDate.setMonth(navDate.getMonth() + 1); // 날짜를 한 달 후로
        drawCalendar(navDate.getFullYear(), navDate.getMonth()); // 달력을 다시 그림
    });

    // 3. 처음 달력을 그립니다.
    drawCalendar(navDate.getFullYear(), navDate.getMonth());
}

// 달력을 실제로 그리고 Supabase 데이터를 가져오는 핵심 함수
async function drawCalendar(year, month) {
    // 헤더에 'YYYY년 M월' 표시
    const monthYearString = `${year}년 ${month + 1}월`;
    document.getElementById('month-year').textContent = monthYearString;
    
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '로딩 중...'; // 데이터를 불러오는 동안 표시

    // --- Supabase에서 현재 월의 게시글 데이터 가져오기 ---
    
    // 1. 이번 달의 시작일과 마지막일 계산
    const startDate = new Date(year, month, 1).toISOString();
    const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString(); // 0일 = 이전 달의 마지막 날

    // 2. Supabase의 'posts' 테이블에서 현재 월에 해당하는 글만 가져오기
    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, created_at, title')
        .gte('created_at', startDate) // "Greater Than or Equal" (이상)
        .lte('created_at', endDate);  // "Less Than or Equal" (이하)

    if (error) {
        console.error('게시글 로딩 중 에러:', error);
        grid.innerHTML = '게시글을 불러오는 데 실패했습니다.';
        return;
    }

    // 3. 불러온 데이터를 '날짜'를 키로, 'id'를 값으로 하는 Map으로 변환
    const postMap = new Map();
    posts.forEach(post => {
        const postDate = new Date(post.created_at).getDate();
        postMap.set(postDate, post.id);
    });

    // --- 달력 UI 그리기 ---
    grid.innerHTML = ''; // '로딩 중...' 메시지 제거
    
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0(일) ~ 6(토)
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // 이 달의 총 날짜 수

    // 1. 첫째 날 시작 전의 빈 칸 채우기
    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day empty';
        grid.appendChild(emptyCell);
    }

    // 2. 날짜 채우기 (1일부터 ~ 마지막 날까지)
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        dayCell.textContent = day;

        // 오늘 쓴 글이 있는지 확인
        const postId = postMap.get(day);
        
        if (postId) {
            // 글이 있는 날 (활성화)
            dayCell.classList.add('active-date');
            dayCell.title = '클릭해서 일기 보기';
            // 클릭하면 기존에 만들어둔 showBlogPost 함수를 호출
            dayCell.onclick = () => showBlogPost(postId);
        } else {
            // 글이 없는 날 (비활성화)
            dayCell.classList.add('inactive-date');
        }
        
        grid.appendChild(dayCell);
    }
}