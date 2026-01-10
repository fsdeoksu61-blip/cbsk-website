// API URL 설정 (Railway 배포 완료)
const API_URL = 'https://hopeful-mindfulness-production-7106.up.railway.app/api';

// 전역 상태
let isAuthenticated = false;
let posts = [];

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    await loadPosts();
    setupEventListeners();
});

// 인증 상태 확인
async function checkAuth() {
    try {
        const response = await fetch(`${API_URL}/check-auth`, {
            credentials: 'include'
        });
        const data = await response.json();
        isAuthenticated = data.authenticated;
        updateUI();
    } catch (error) {
        console.error('Auth check failed:', error);
        isAuthenticated = false;
        updateUI();
    }
}

// 게시글 목록 불러오기
async function loadPosts() {
    try {
        const response = await fetch(`${API_URL}/posts`);
        posts = await response.json();
        renderPosts();
    } catch (error) {
        console.error('Failed to load posts:', error);
        document.getElementById('posts-list').innerHTML =
            '<li style="text-align: center; padding: 20px;">게시글을 불러오는데 실패했습니다.</li>';
    }
}

// 게시글 렌더링
function renderPosts() {
    const postsList = document.getElementById('posts-list');

    if (posts.length === 0) {
        postsList.innerHTML = '<li style="text-align: center; padding: 20px;">등록된 게시글이 없습니다.</li>';
        return;
    }

    postsList.innerHTML = posts.map(post => `
        <li>
            <span class="list-title">${escapeHtml(post.title)}</span>
            <span class="list-date">${formatDate(post.date)}</span>
            ${isAuthenticated ? `
                <span class="list-actions">
                    <button class="btn-edit" onclick="editPost(${post.id})">수정</button>
                    <button class="btn-delete" onclick="deletePost(${post.id})">삭제</button>
                </span>
            ` : ''}
        </li>
    `).join('');
}

// UI 업데이트
function updateUI() {
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const newPostBtn = document.getElementById('new-post-btn');

    if (isAuthenticated) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        newPostBtn.style.display = 'inline-block';
    } else {
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        newPostBtn.style.display = 'none';
    }

    renderPosts();
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 로그인 버튼
    document.getElementById('login-btn').addEventListener('click', showLoginModal);

    // 로그아웃 버튼
    document.getElementById('logout-btn').addEventListener('click', logout);

    // 새 글 쓰기 버튼
    document.getElementById('new-post-btn').addEventListener('click', showNewPostModal);

    // 모달 닫기
    document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
        el.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close') || e.target.classList.contains('modal-overlay')) {
                closeAllModals();
            }
        });
    });

    // 로그인 폼
    document.getElementById('login-form').addEventListener('submit', handleLogin);

    // 게시글 폼
    document.getElementById('post-form').addEventListener('submit', handlePostSubmit);
}

// 로그인 모달 표시
function showLoginModal() {
    document.getElementById('login-modal').style.display = 'flex';
    document.getElementById('login-username').focus();
}

// 새 글 쓰기 모달 표시
function showNewPostModal() {
    document.getElementById('post-modal-title').textContent = '새 글 쓰기';
    document.getElementById('post-id').value = '';
    document.getElementById('post-title').value = '';
    document.getElementById('post-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('post-modal').style.display = 'flex';
    document.getElementById('post-title').focus();
}

// 게시글 수정
function editPost(id) {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    document.getElementById('post-modal-title').textContent = '게시글 수정';
    document.getElementById('post-id').value = post.id;
    document.getElementById('post-title').value = post.title;
    document.getElementById('post-date').value = post.date;
    document.getElementById('post-modal').style.display = 'flex';
    document.getElementById('post-title').focus();
}

// 게시글 삭제
async function deletePost(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
        const response = await fetch(`${API_URL}/posts/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            await loadPosts();
        } else {
            alert('삭제에 실패했습니다.');
        }
    } catch (error) {
        console.error('Delete failed:', error);
        alert('삭제에 실패했습니다.');
    }
}

// 로그인 처리
async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            isAuthenticated = true;
            updateUI();
            closeAllModals();
            document.getElementById('login-form').reset();
        } else {
            alert('아이디 또는 비밀번호가 올바르지 않습니다.');
        }
    } catch (error) {
        console.error('Login failed:', error);
        alert('로그인에 실패했습니다.');
    }
}

// 로그아웃
async function logout() {
    try {
        await fetch(`${API_URL}/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        isAuthenticated = false;
        updateUI();
    } catch (error) {
        console.error('Logout failed:', error);
    }
}

// 게시글 작성/수정 처리
async function handlePostSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('post-id').value;
    const title = document.getElementById('post-title').value.trim();
    const date = document.getElementById('post-date').value;

    if (!title) {
        alert('제목을 입력해주세요.');
        return;
    }

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/posts/${id}` : `${API_URL}/posts`;

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ title, date })
        });

        if (response.ok) {
            await loadPosts();
            closeAllModals();
            document.getElementById('post-form').reset();
        } else {
            alert('저장에 실패했습니다.');
        }
    } catch (error) {
        console.error('Save failed:', error);
        alert('저장에 실패했습니다.');
    }
}

// 모달 닫기
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// 날짜 포맷팅
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
}

// HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
