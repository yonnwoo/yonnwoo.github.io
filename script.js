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
