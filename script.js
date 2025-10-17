// ===================================================
// 1. 메뉴 클릭 시 콘텐츠 변경 기능
// ===================================================

const mainContent = document.getElementById('main-content');

function showHome() {
    mainContent.innerHTML = `
    <div class='hometext'>
        <p>안녕하세요.</p>
        </div>
    `;
}

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

    const { data, error } = await supabase
        .from('posts')
        .select('id, title, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('블로그 목록 로딩 중 에러 발생:', error);
        return;
    }

    const postListDiv = document.getElementById('post-list');
    postListDiv.innerHTML = '';

    if (data.length === 0) {
        postListDiv.innerHTML = "<p>아직 작성된 글이 없습니다.</p>";
        return;
    }
    
    const ul = document.createElement('ul');
    ul.className = 'post-list-ul';

    data.forEach(post => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="#" onclick="showBlogPost(${post.id})">${post.title}</a>`;
        ul.appendChild(li);
    });

    postListDiv.appendChild(ul);
}

// 특정 게시글 하나를 보여주는 함수
async function showBlogPost(postId) {
    mainContent.innerHTML = `<p>게시글을 불러오는 중...</p>`;
    
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single();

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


// ===================================================
// 2. 서울 날씨 고정 표시 기능
// ===================================================
const API_KEY = "3f742a0f9a73ebf221c0609ed74b2928";
const SEOUL_LAT = 37.5665;
const SEOUL_LON = 126.9780;
const url = `https://api.openweathermap.org/data/2.5/weather?lat=${SEOUL_LAT}&lon=${SEOUL_LON}&appid=${API_KEY}&units=metric`;

fetch(url)
    .then(response => response.json())
    .then(data => {
        const weatherIcon = document.getElementById('weather-icon');
        const weatherId = data.weather[0].id;
        weatherIcon.className = '';

        if (weatherId >= 200 && weatherId < 300) {
            weatherIcon.innerText = '☈\uFE0E';
            weatherIcon.classList.add('weather-thunderstorm');
        } else if (weatherId >= 300 && weatherId < 600) {
            weatherIcon.innerText = '☂\uFE0E ☂\uFE0E ☂\uFE0E';
            weatherIcon.classList.add('weather-rain');
        } else if (weatherId >= 600 && weatherId < 700) {
            weatherIcon.innerText = '☃\uFE0E';
            weatherIcon.classList.add('weather-snow');
        } else if (weatherId >= 700 && weatherId < 800) {
            weatherIcon.innerText = '~\uFE0E';
            weatherIcon.classList.add('weather-mist');
        } else if (weatherId === 800) {
            weatherIcon.innerText = '☼\uFE0E';
            weatherIcon.classList.add('weather-sunny');
        } else if (weatherId > 800) {
            weatherIcon.innerText = '☁\uFE0E';
            weatherIcon.classList.add('weather-cloudy');
        }
    })
    .catch(error => {
        console.error('날씨 정보를 가져오는 데 실패했습니다:', error);
        const weatherIcon = document.getElementById('weather-icon');
        weatherIcon.innerText = '☉\uFE0E';
    });

// ===================================================
// 3. 방명록 기능 (Supabase 사용 - 완전한 자유!)
// ===================================================
function showGuestbook() {
    mainContent.innerHTML = `
        <h2>방명록</h2>
        <p>Supabase로 만든 방명록입니다. 디자인을 자유롭게 제어할 수 있습니다!</p>
        
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

async function saveEntry(event) {
    event.preventDefault();
    const nameInput = document.getElementById('guest-name');
    const messageInput = document.getElementById('guest-message');

    const { data, error } = await supabase
        .from('entries')
        .insert([{ name: nameInput.value, message: messageInput.value }]);

    if (error) {
        console.error('저장 중 에러 발생:', error);
    } else {
        console.log('글이 성공적으로 저장되었습니다:', data);
        nameInput.value = '';
        messageInput.value = '';
        loadEntries();
    }
}

async function loadEntries() {
    const entriesDiv = document.getElementById('guestbook-entries');
    entriesDiv.innerHTML = '';

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