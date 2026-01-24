// API URL 설정
const API_URL = 'https://api.cbsk.kr/api';

// 전역 상태
let posts = [];

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', async () => {
    await loadPosts();
    setupEventListeners();
});

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

// 게시글 렌더링 (읽기 전용)
function renderPosts() {
    const postsList = document.getElementById('posts-list');

    if (posts.length === 0) {
        postsList.innerHTML = '<li style="text-align: center; padding: 20px;">등록된 게시글이 없습니다.</li>';
        return;
    }

    postsList.innerHTML = posts.map(post => `
        <li>
            <span class="list-title clickable" onclick="viewPost(${post.id})">${escapeHtml(post.title)}</span>
            <span class="list-date">${formatDate(post.date)}</span>
        </li>
    `).join('');
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 모달 닫기
    const viewModal = document.getElementById('view-modal');
    if (viewModal) {
        viewModal.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal-close') ||
                    e.target.classList.contains('modal-overlay')) {
                    closeModal();
                }
            });
        });
    }
}

// 게시글 상세보기
async function viewPost(id) {
    try {
        const response = await fetch(`${API_URL}/posts/${id}`);
        const post = await response.json();

        document.getElementById('view-title').textContent = post.title;
        document.getElementById('view-date').textContent = formatDate(post.date);
        document.getElementById('view-text').textContent = post.content || '내용이 없습니다.';

        // 이미지 표시
        const imageContainer = document.getElementById('view-image-container');
        const imageElement = document.getElementById('view-image');
        if (post.image_url) {
            imageElement.src = post.image_url;
            imageContainer.style.display = 'block';
        } else {
            imageContainer.style.display = 'none';
        }

        document.getElementById('view-modal').style.display = 'flex';
    } catch (error) {
        console.error('Failed to load post:', error);
        alert('게시글을 불러오는데 실패했습니다.');
    }
}

// 모달 닫기
function closeModal() {
    const modal = document.getElementById('view-modal');
    if (modal) {
        modal.style.display = 'none';
    }
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
