// Инициализация публичного профиля
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    loadPublicProfile();
});

// Загрузка публичного профиля
function loadPublicProfile() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = parseInt(urlParams.get('user'));
    
    if (!userId) {
        window.location.href = 'index.html';
        return;
    }
    
    const user = getUserById(userId);
    const posts = JSON.parse(localStorage.getItem('mkblog_posts')) || [];
    const userPosts = posts.filter(post => post.authorId === userId);
    
    if (!user) {
        document.getElementById('userPostsGrid').innerHTML = '<p>Пользователь не найден или профиль скрыт</p>';
        return;
    }
    
    // Заполняем информацию профиля
    document.getElementById('profileUsername').textContent = user.username;
    document.getElementById('profileJoinDate').textContent = `Участник с ${formatJoinDate(user.joinDate)}`;
    
    // Аватар
    const profileAvatar = document.getElementById('profileAvatar');
    if (user.avatar && user.avatar.startsWith('data:')) {
        profileAvatar.style.backgroundImage = `url(${user.avatar})`;
        profileAvatar.innerHTML = '';
    } else {
        profileAvatar.textContent = user.username.charAt(0).toUpperCase();
        profileAvatar.style.background = `linear-gradient(135deg, ${getRandomColor()}, ${getRandomColor()})`;
    }
    
    // Обложка
    const profileCover = document.getElementById('profileCover');
    if (user.coverPhoto) {
        profileCover.style.backgroundImage = `url(${user.coverPhoto})`;
    }
    
    // Био и компания
    const profileBio = document.getElementById('profileBio');
    profileBio.innerHTML = `
        ${user.bio ? `<p class="bio-text">${user.bio}</p>` : ''}
        ${user.company?.name ? `
            <div class="company-info">
                <h4>🏢 ${user.company.name}</h4>
                ${user.company.founded ? `<p><strong>Основана:</strong> ${user.company.founded} год</p>` : ''}
                ${user.company.mission ? `<p class="mission"><strong>Миссия:</strong> ${user.company.mission}</p>` : ''}
                ${user.company.description ? `<p class="description">${user.company.description}</p>` : ''}
            </div>
        ` : ''}
        ${user.social?.website || user.social?.twitter || user.social?.instagram ? `
            <div class="social-links">
                <h4>🌐 Социальные сети:</h4>
                <div class="social-buttons">
                    ${user.social.website ? `<a href="${user.social.website}" target="_blank" class="btn btn-outline">Сайт</a>` : ''}
                    ${user.social.twitter ? `<a href="https://twitter.com/${user.social.twitter.replace('@', '')}" target="_blank" class="btn btn-outline">Twitter</a>` : ''}
                    ${user.social.instagram ? `<a href="https://instagram.com/${user.social.instagram.replace('@', '')}" target="_blank" class="btn btn-outline">Instagram</a>` : ''}
                </div>
            </div>
        ` : ''}
    `;
    
    // Статистика
    const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes || 0), 0);
    const totalComments = userPosts.reduce((sum, post) => sum + (post.comments ? post.comments.length : 0), 0);
    
    document.getElementById('userPostsCount').textContent = userPosts.length;
    document.getElementById('userLikesCount').textContent = totalLikes;
    document.getElementById('userCommentsCount').textContent = totalComments;
    
    // Загружаем посты пользователя
    loadUserPosts(userPosts, userId);
}

// Загрузка постов пользователя
function loadUserPosts(posts, authorId) {
    const users = JSON.parse(localStorage.getItem('mkblog_users')) || [];
    const author = users.find(u => u.id === authorId);
    const postsGrid = document.getElementById('userPostsGrid');
    
    if (!posts || posts.length === 0) {
        postsGrid.innerHTML = `
            <div class="no-posts">
                <h3>У пользователя пока нет публикаций</h3>
                <p>Когда пользователь создаст пост, он появится здесь</p>
            </div>
        `;
        return;
    }
    
    postsGrid.innerHTML = posts.map(post => {
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
                </div>
            </div>
        `;
    }).join('');
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