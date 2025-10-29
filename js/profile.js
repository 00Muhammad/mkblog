// Инициализация личного кабинета
document.addEventListener('DOMContentLoaded', function() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    loadProfile();
    loadUserPosts();
    setupPostCreation();
    setupUserAvatar();
});

// Загрузка профиля
function loadProfile() {
    const currentUser = getCurrentUser();
    const posts = JSON.parse(localStorage.getItem('mkblog_posts')) || [];
    
    if (!currentUser) return;
    
    // Заполняем информацию профиля
    document.getElementById('profileUsername').textContent = currentUser.username;
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('profileJoinDate').textContent = `Участник с ${formatJoinDate(currentUser.joinDate)}`;
    
    // Аватар
    const profileAvatar = document.getElementById('profileAvatar');
    if (currentUser.avatar && currentUser.avatar.startsWith('data:')) {
        profileAvatar.style.backgroundImage = `url(${currentUser.avatar})`;
        profileAvatar.innerHTML = '';
    } else {
        profileAvatar.textContent = currentUser.username.charAt(0).toUpperCase();
        profileAvatar.style.background = `linear-gradient(135deg, ${getRandomColor()}, ${getRandomColor()})`;
    }
    
    // Обложка
    const profileCover = document.getElementById('profileCover');
    if (currentUser.coverPhoto) {
        profileCover.style.backgroundImage = `url(${currentUser.coverPhoto})`;
    }
    
    // Био и компания
    const profileBio = document.getElementById('profileBio');
    profileBio.innerHTML = `
        ${currentUser.bio ? `<p class="bio-text">${currentUser.bio}</p>` : ''}
        ${currentUser.company?.name ? `
            <div class="company-info">
                <h4>🏢 ${currentUser.company.name}</h4>
                ${currentUser.company.founded ? `<p><strong>Основана:</strong> ${currentUser.company.founded} год</p>` : ''}
                ${currentUser.company.mission ? `<p class="mission"><strong>Миссия:</strong> ${currentUser.company.mission}</p>` : ''}
                ${currentUser.company.description ? `<p class="description">${currentUser.company.description}</p>` : ''}
            </div>
        ` : ''}
        ${currentUser.social?.website || currentUser.social?.twitter || currentUser.social?.instagram ? `
            <div class="social-links">
                <h4>🌐 Социальные сети:</h4>
                <div class="social-buttons">
                    ${currentUser.social.website ? `<a href="${currentUser.social.website}" target="_blank" class="btn btn-outline">Сайт</a>` : ''}
                    ${currentUser.social.twitter ? `<a href="https://twitter.com/${currentUser.social.twitter.replace('@', '')}" target="_blank" class="btn btn-outline">Twitter</a>` : ''}
                    ${currentUser.social.instagram ? `<a href="https://instagram.com/${currentUser.social.instagram.replace('@', '')}" target="_blank" class="btn btn-outline">Instagram</a>` : ''}
                </div>
            </div>
        ` : ''}
    `;
    
    // Статистика
    const userPosts = posts.filter(post => post.authorId === currentUser.id);
    const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes || 0), 0);
    const totalComments = userPosts.reduce((sum, post) => sum + (post.comments ? post.comments.length : 0), 0);
    
    document.getElementById('userPostsCount').textContent = userPosts.length;
    document.getElementById('userLikesCount').textContent = totalLikes;
    document.getElementById('userCommentsCount').textContent = totalComments;
}

// Настройка аватара пользователя в навигации
function setupUserAvatar() {
    const currentUser = getCurrentUser();
    const userAvatar = document.getElementById('userAvatar');
    
    if (currentUser.avatar && currentUser.avatar.startsWith('data:')) {
        userAvatar.style.backgroundImage = `url(${currentUser.avatar})`;
        userAvatar.innerHTML = '';
    } else {
        userAvatar.textContent = currentUser.username.charAt(0).toUpperCase();
        userAvatar.style.background = `linear-gradient(135deg, ${getRandomColor()}, ${getRandomColor()})`;
    }
}

// Загрузка постов пользователя
function loadUserPosts() {
    const currentUser = getCurrentUser();
    const posts = JSON.parse(localStorage.getItem('mkblog_posts')) || [];
    const userPosts = posts.filter(post => post.authorId === currentUser.id);
    const postsGrid = document.getElementById('myPostsGrid');
    
    if (userPosts.length === 0) {
        postsGrid.innerHTML = `
            <div class="no-posts">
                <h3>У вас пока нет публикаций</h3>
                <p>Создайте свой первый пост и поделитесь мыслями с сообществом!</p>
            </div>
        `;
        return;
    }
    
    postsGrid.innerHTML = userPosts.map(post => {
        const commentCount = post.comments ? post.comments.length : 0;
        
        return `
            <div class="post-card" onclick="viewPost(${post.id})">
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
                    <h3 class="post-title">${post.title}</h3>
                    <p class="post-text">${post.content}</p>
                    <div class="post-meta">
                        <span class="post-date">${formatDate(post.createdAt)}</span>
                        <div class="post-stats">
                            <span>❤️ ${post.likes || 0}</span>
                            <span>💬 ${commentCount}</span>
                        </div>
                    </div>
                    <div class="post-actions">
                        <button class="btn btn-outline" onclick="event.stopPropagation(); editPost(${post.id})">✏️ Редактировать</button>
                        <button class="btn btn-danger" onclick="event.stopPropagation(); deletePost(${post.id})">🗑️ Удалить</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Создание поста
function setupPostCreation() {
    document.getElementById('createPostForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('postTitle').value;
        const content = document.getElementById('postContent').value;
        const imageFile = document.getElementById('postImage').files[0];
        const videoFile = document.getElementById('postVideo').files[0];
        
        if (!title || !content) {
            alert('Пожалуйста, заполните заголовок и содержание поста');
            return;
        }
        
        const newPost = {
            id: Date.now(),
            title: title,
            content: content,
            authorId: getCurrentUser().id,
            createdAt: new Date().toISOString(),
            likes: 0,
            likedBy: [],
            comments: []
        };
        
        // Обработка медиа
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                newPost.media = {
                    type: 'image',
                    url: e.target.result
                };
                savePost(newPost);
            };
            reader.readAsDataURL(imageFile);
        } else if (videoFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                newPost.media = {
                    type: 'video',
                    url: e.target.result
                };
                savePost(newPost);
            };
            reader.readAsDataURL(videoFile);
        } else {
            savePost(newPost);
        }
    });
}

function savePost(post) {
    const posts = JSON.parse(localStorage.getItem('mkblog_posts')) || [];
    posts.unshift(post);
    localStorage.setItem('mkblog_posts', JSON.stringify(posts));
    
    // Очистка формы
    document.getElementById('createPostForm').reset();
    loadUserPosts();
    loadProfile(); // Обновляем статистику
    
    alert('Пост успешно опубликован!');
}

// Редактирование поста
function editPost(postId) {
    const posts = JSON.parse(localStorage.getItem('mkblog_posts')) || [];
    const post = posts.find(p => p.id === postId);
    
    if (post) {
        document.getElementById('postTitle').value = post.title;
        document.getElementById('postContent').value = post.content;
        
        // Прокрутка к форме
        document.querySelector('.create-post-section').scrollIntoView({ 
            behavior: 'smooth' 
        });
        
        // Удаляем старый пост
        deletePost(postId, false);
    }
}

// Удаление поста
function deletePost(postId, showAlert = true) {
    if (!confirm('Вы уверены, что хотите удалить этот пост?')) return;
    
    const posts = JSON.parse(localStorage.getItem('mkblog_posts')) || [];
    const updatedPosts = posts.filter(post => post.id !== postId);
    localStorage.setItem('mkblog_posts', JSON.stringify(updatedPosts));
    
    if (showAlert) {
        alert('Пост успешно удален!');
    }
    
    loadUserPosts();
    loadProfile();
}

// Копирование ссылки на профиль
function copyProfileLink() {
    const currentUser = getCurrentUser();
    const profileLink = `${window.location.origin}${window.location.pathname.replace('dashboard.html', 'profile-view.html')}?user=${currentUser.id}`;
    
    navigator.clipboard.writeText(profileLink).then(() => {
        alert('Ссылка на профиль скопирована!');
    }).catch(() => {
        // Fallback для старых браузеров
        const tempInput = document.createElement('input');
        tempInput.value = profileLink;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        alert('Ссылка на профиль скопирована!');
    });
}

// Просмотр поста
function viewPost(postId) {
    localStorage.setItem('currentPost', postId);
    window.location.href = 'post.html';
}

// Утилиты
function formatJoinDate(dateString) {
    return new Date(dateString).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

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