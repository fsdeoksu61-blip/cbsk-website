// API URL - 같은 도메인이므로 상대 경로 사용
const API_URL = '/api';

// 전역 상태
let isAuthenticated = false;
let posts = [];

// DOM 요소
const loginScreen = document.getElementById('login-screen');
const adminScreen = document.getElementById('admin-screen');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const newPostBtn = document.getElementById('new-post-btn');
const postsList = document.getElementById('posts-list');
const postsCount = document.getElementById('posts-count');

// 모달 요소
const postModal = document.getElementById('post-modal');
const viewModal = document.getElementById('view-modal');
const postForm = document.getElementById('post-form');

// 초기화
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    setupEventListeners();
});

// 인증 확인
async function checkAuth() {
    try {
        const response = await fetch(`${API_URL}/check-auth`, {
            credentials: 'include'
        });
        const data = await response.json();
        isAuthenticated = data.authenticated;

        if (isAuthenticated) {
            showAdminScreen();
            await loadPosts();
        } else {
            showLoginScreen();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        showLoginScreen();
    }
}

// 화면 전환
function showLoginScreen() {
    loginScreen.style.display = 'flex';
    adminScreen.style.display = 'none';
}

function showAdminScreen() {
    loginScreen.style.display = 'none';
    adminScreen.style.display = 'block';
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 로그인
    loginForm.addEventListener('submit', handleLogin);

    // 로그아웃
    logoutBtn.addEventListener('click', handleLogout);

    // 새 글 쓰기
    newPostBtn.addEventListener('click', showNewPostModal);

    // 게시글 폼
    postForm.addEventListener('submit', handlePostSubmit);

    // 모달 닫기
    document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
        el.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close') ||
                e.target.classList.contains('modal-overlay')) {
                closeAllModals();
            }
        });
    });
}

// 로그인 처리
async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            isAuthenticated = true;
            showAdminScreen();
            await loadPosts();
            loginForm.reset();
        } else {
            alert('아이디 또는 비밀번호가 올바르지 않습니다.');
        }
    } catch (error) {
        console.error('Login failed:', error);
        alert('로그인에 실패했습니다.');
    }
}

// 로그아웃
async function handleLogout() {
    try {
        await fetch(`${API_URL}/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        isAuthenticated = false;
        posts = [];
        showLoginScreen();
    } catch (error) {
        console.error('Logout failed:', error);
    }
}

// 게시글 목록 불러오기
async function loadPosts() {
    try {
        const response = await fetch(`${API_URL}/posts`, {
            credentials: 'include'
        });
        posts = await response.json();
        renderPosts();
    } catch (error) {
        console.error('Failed to load posts:', error);
        postsList.innerHTML = '<div class="empty">게시글을 불러오는데 실패했습니다.</div>';
    }
}

// 게시글 렌더링
function renderPosts() {
    postsCount.textContent = posts.length;

    if (posts.length === 0) {
        postsList.innerHTML = '<div class="empty">등록된 게시글이 없습니다.</div>';
        return;
    }

    postsList.innerHTML = posts.map(post => `
        <div class="post-item">
            <div class="post-info">
                <span class="post-title" onclick="viewPost(${post.id})">${escapeHtml(post.title)}</span>
                <span class="post-date">${formatDate(post.date)}</span>
            </div>
            <div class="post-actions">
                <button class="btn btn-edit" onclick="editPost(${post.id})">수정</button>
                <button class="btn btn-delete" onclick="deletePost(${post.id})">삭제</button>
            </div>
        </div>
    `).join('');
}

// 새 글 쓰기 모달
function showNewPostModal() {
    document.getElementById('modal-title').textContent = '새 글 쓰기';
    document.getElementById('post-id').value = '';
    document.getElementById('post-title').value = '';
    document.getElementById('post-content').value = '';
    document.getElementById('post-image').value = '';
    document.getElementById('post-date').value = new Date().toISOString().split('T')[0];
    postModal.classList.add('show');
    document.getElementById('post-title').focus();
}

// 게시글 상세보기
async function viewPost(id) {
    try {
        const response = await fetch(`${API_URL}/posts/${id}`, {
            credentials: 'include'
        });
        const post = await response.json();

        document.getElementById('view-title').textContent = post.title;
        document.getElementById('view-date').textContent = formatDate(post.date);
        document.getElementById('view-text').textContent = post.content || '내용이 없습니다.';

        const imageContainer = document.getElementById('view-image-container');
        const imageElement = document.getElementById('view-image');
        if (post.image_url) {
            imageElement.src = post.image_url;
            imageContainer.style.display = 'block';
        } else {
            imageContainer.style.display = 'none';
        }

        viewModal.classList.add('show');
    } catch (error) {
        console.error('Failed to load post:', error);
        alert('게시글을 불러오는데 실패했습니다.');
    }
}

// 게시글 수정
async function editPost(id) {
    try {
        const response = await fetch(`${API_URL}/posts/${id}`, {
            credentials: 'include'
        });
        const post = await response.json();

        document.getElementById('modal-title').textContent = '게시글 수정';
        document.getElementById('post-id').value = post.id;
        document.getElementById('post-title').value = post.title;
        document.getElementById('post-content').value = post.content || '';
        document.getElementById('post-image').value = post.image_url || '';
        document.getElementById('post-date').value = post.date;
        postModal.classList.add('show');
        document.getElementById('post-title').focus();
    } catch (error) {
        console.error('Failed to load post:', error);
        alert('게시글을 불러오는데 실패했습니다.');
    }
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
            alert('삭제되었습니다.');
        } else {
            alert('삭제에 실패했습니다.');
        }
    } catch (error) {
        console.error('Delete failed:', error);
        alert('삭제에 실패했습니다.');
    }
}

// 게시글 작성/수정 처리
async function handlePostSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('post-id').value;
    const title = document.getElementById('post-title').value.trim();
    const content = document.getElementById('post-content').value.trim();
    const image_url = document.getElementById('post-image').value.trim();
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
            body: JSON.stringify({ title, content, image_url, date })
        });

        if (response.ok) {
            await loadPosts();
            closeAllModals();
            postForm.reset();
            alert('저장되었습니다.');
        } else {
            const error = await response.json();
            alert('저장에 실패했습니다: ' + (error.error || '알 수 없는 오류'));
        }
    } catch (error) {
        console.error('Save failed:', error);
        alert('저장에 실패했습니다: ' + error.message);
    }
}

// 모달 닫기
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
}

// 유틸리티 함수
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
