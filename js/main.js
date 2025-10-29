// Инициализация главной страницы
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    loadStats();
    loadPosts();
    setupEventListeners();
});

// Проверка статуса авторизации
function checkAuthStatus() {
    const currentUser = getCurrentUser();
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const userAvatar = document.getElementById('userAvatar');

    if (currentUser) {
        authButtons.classList.add('hidden');
        userMenu.classList.remove('hidden');
        if (currentUser.avatar && currentUser.avatar.startsWith('data:')) {
            userAvatar.style.backgroundImage = `url(${currentUser.avatar})`;
            userAvatar.innerHTML = '';
        } else {
            userAvatar.textContent = currentUser.username.charAt(0).toUpperCase();
            userAvatar.style.background = `linear-gradient(135deg, ${getRandomColor()}, ${getRandomColor()})`;
        }
    } else {
        authButtons.classList.remove('hidden');
        userMenu.classList.add('hidden');
    }
}

// Загрузка статистики
function loadStats() {
    const users = JSON.parse(localStorage.getItem('mkblog_users')) || [];
    const posts = JSON.parse(localStorage.getItem('mkblog_posts')) || [];
    let totalComments = 0;

    posts.forEach(post => {
        totalComments += post.comments ? post.comments.length : 0;
    });

    // Анимируем счетчики
    animateCounter('totalUsers', users.length);
    animateCounter('totalPosts', posts.length);
    animateCounter('totalComments', totalComments);
}

// Анимация счетчиков
function animateCounter(elementId, target) {
    const element = document.getElementById(elementId);
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 30);
}

// Загрузка постов
function loadPosts(filter = 'all') {
    const posts = JSON.parse(localStorage.getItem('mkblog_posts')) || [];
    const users = JSON.parse(localStorage.getItem('mkblog_users')) || [];
    const postsGrid = document.getElementById('postsGrid');

    if (posts.length === 0) {
        postsGrid.innerHTML = `
            <div class="no-posts">
                <h3>Пока нет публикаций</h3>
                <p>Будьте первым, кто поделится своими мыслями!</p>
                <a href="register.html" class="btn btn-primary">Присоединиться</a>
            </div>
        `;
        return;
    }

    let filteredPosts = [...posts];

    // Применяем фильтры
    if (filter === 'popular') {
        filteredPosts.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (filter === 'recent') {
        filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    postsGrid.innerHTML = filteredPosts.map(post => {
        const author = users.find(u => u.id === post.authorId) || { username: 'Неизвестный', avatar: '' };
        const commentCount = post.comments ? post.comments.length : 0;
        
        return `
            <div class="post-card">
                ${post.media ? `
                    <div class="post-media">
                        ${post.media.type === 'image' ? 
                            `<img src="${post.media.url}" class="post-image" alt="${post.title}">` : 
                            `<video class="post-video">
                                <source src="${post.media.url}" type="video/mp4">
                            </video>`
                        }
                    </div>
                ` : ''}
                <div class="post-content">
                    <div class="post-header">
                        <div class="post-avatar" style="background: ${author.avatar && author.avatar.startsWith('data:') ? `url(${author.avatar})` : `linear-gradient(135deg, ${getRandomColor()}, ${getRandomColor()})`}; background-size: cover; background-position: center;">
                            ${author.avatar && author.avatar.startsWith('data:') ? '' : author.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div class="post-author" onclick="event.stopPropagation(); viewUserProfile(${post.authorId})">${author.username}</div>
                            <div class="post-date">${formatDate(post.createdAt)}</div>
                        </div>
                    </div>
                    <h3 class="post-title" onclick="viewPost(${post.id})">${post.title}</h3>
                    <p class="post-text" onclick="viewPost(${post.id})">${post.content}</p>
                    <div class="post-actions">
                        <button class="like-btn ${isPostLiked(post) ? 'liked' : ''}" 
                                onclick="event.stopPropagation(); likePost(${post.id})">
                            ❤️ <span class="like-count">${post.likes || 0}</span>
                        </button>
                        <button class="comment-btn" onclick="event.stopPropagation(); viewPost(${post.id})">
                            💬 <span class="comment-count">${commentCount}</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Фильтрация постов
function filterPosts(type) {
    // Обновляем активные кнопки
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    loadPosts(type);
}

// Лайк поста
function likePost(postId) {
    if (!isLoggedIn()) {
        alert('Пожалуйста, войдите в систему чтобы ставить лайки');
        return;
    }

    const posts = JSON.parse(localStorage.getItem('mkblog_posts')) || [];
    const postIndex = posts.findIndex(p => p.id === postId);
    const currentUser = getCurrentUser();

    if (postIndex !== -1) {
        const post = posts[postIndex];
        
        if (!post.likes) post.likes = 0;
        if (!post.likedBy) post.likedBy = [];

        const userLiked = post.likedBy.includes(currentUser.id);

        if (userLiked) {
            // Убираем лайк
            post.likes--;
            post.likedBy = post.likedBy.filter(id => id !== currentUser.id);
        } else {
            // Добавляем лайк
            post.likes++;
            post.likedBy.push(currentUser.id);
        }

        localStorage.setItem('mkblog_posts', JSON.stringify(posts));
        loadPosts(); // Перезагружаем посты
    }
}

// Проверка лайка пользователя
function isPostLiked(post) {
    const currentUser = getCurrentUser();
    return currentUser && post.likedBy && post.likedBy.includes(currentUser.id);
}

// Просмотр поста
function viewPost(postId) {
    localStorage.setItem('currentPost', postId);
    window.location.href = 'post.html';
}

// Просмотр профиля пользователя
function viewUserProfile(userId) {
    const user = getUserById(userId);
    if (user && user.privacy.profileVisible) {
        window.location.href = `profile-view.html?user=${userId}`;
    } else {
        alert('Профиль пользователя скрыт или не найден');
    }
}

// Показать секцию исследования
function showExplore() {
    document.getElementById('explore').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Обработка кликов вне выпадающих меню
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.user-menu')) {
            document.querySelectorAll('.user-dropdown').forEach(dropdown => {
                dropdown.style.display = 'none';
            });
        }
    });

    // Обработка наведения на user-menu
    document.querySelectorAll('.user-menu').forEach(menu => {
        menu.addEventListener('mouseenter', function() {
            this.querySelector('.user-dropdown').style.display = 'block';
        });
        
        menu.addEventListener('mouseleave', function() {
            this.querySelector('.user-dropdown').style.display = 'none';
        });
    });
}

// Утилиты
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'только что';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч назад`;
    
    return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function getRandomColor() {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Выход пользователя
function logoutUser() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        currentUser = null;
        localStorage.removeItem('mkblog_currentUser');
        window.location.href = 'index.html';
    }
}