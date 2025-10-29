// Инициализация страницы поста
document.addEventListener('DOMContentLoaded', function() {
    loadPostDetail();
    setupCommentForm();
});

// Загрузка деталей поста
function loadPostDetail() {
    const postId = parseInt(localStorage.getItem('currentPost'));
    const posts = JSON.parse(localStorage.getItem('mkblog_posts')) || [];
    const users = JSON.parse(localStorage.getItem('mkblog_users')) || [];
    const post = posts.find(p => p.id === postId);
    
    const postDetail = document.getElementById('postDetail');
    
    if (!post) {
        postDetail.innerHTML = '<div class="error-message">Пост не найден</div>';
        return;
    }
    
    const author = users.find(u => u.id === post.authorId) || { username: 'Неизвестный' };
    const commentCount = post.comments ? post.comments.length : 0;
    
    postDetail.innerHTML = `
        <article class="post-detail">
            <div class="post-header">
                <div class="author-info">
                    <div class="author-avatar" style="background: linear-gradient(135deg, ${getRandomColor()}, ${getRandomColor()})">
                        ${author.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div class="author-name">${author.username}</div>
                        <div class="post-date">${formatDate(post.createdAt)}</div>
                    </div>
                </div>
                ${post.authorId === (getCurrentUser()?.id) ? `
                    <div class="post-actions">
                        <button class="btn btn-outline" onclick="editPostFromDetail(${post.id})">Редактировать</button>
                        <button class="btn btn-danger" onclick="deletePostFromDetail(${post.id})">Удалить</button>
                    </div>
                ` : ''}
            </div>
            
            <h1 class="post-detail-title">${post.title}</h1>
            
            ${post.media ? `
                <div class="post-media-large">
                    ${post.media.type === 'image' ? 
                        `<img src="${post.media.url}" class="post-detail-image" alt="${post.title}">` : 
                        `<video controls class="post-detail-video">
                            <source src="${post.media.url}" type="video/mp4">
                        </video>`
                    }
                </div>
            ` : ''}
            
            <div class="post-detail-content">
                ${post.content.replace(/\n/g, '<br>')}
            </div>
            
            <div class="post-stats">
                <button class="stat-btn like-btn ${isPostLiked(post) ? 'liked' : ''}" onclick="likePostFromDetail(${post.id})">
                    ❤️ <span class="stat-count">${post.likes || 0}</span>
                </button>
                <div class="stat-btn">
                    💬 <span class="stat-count">${commentCount}</span>
                </div>
            </div>
        </article>
    `;
    
    loadComments(postId);
}

// Загрузка комментариев
function loadComments(postId) {
    const posts = JSON.parse(localStorage.getItem('mkblog_posts')) || [];
    const users = JSON.parse(localStorage.getItem('mkblog_users')) || [];
    const post = posts.find(p => p.id === postId);
    const commentsList = document.getElementById('commentsList');
    
    if (!post || !post.comments || post.comments.length === 0) {
        commentsList.innerHTML = '<div class="no-comments">Пока нет комментариев. Будьте первым!</div>';
        return;
    }
    
    commentsList.innerHTML = post.comments.map(comment => {
        const commentAuthor = users.find(u => u.id === comment.authorId) || { username: 'Неизвестный' };
        
        return `
            <div class="comment-item">
                <div class="comment-header">
                    <div class="comment-author">
                        <div class="comment-avatar" style="background: linear-gradient(135deg, ${getRandomColor()}, ${getRandomColor()})">
                            ${commentAuthor.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div class="comment-author-name">${commentAuthor.username}</div>
                            <div class="comment-date">${formatDate(comment.date)}</div>
                        </div>
                    </div>
                    <div class="comment-actions">
                        <button class="comment-like-btn ${isCommentLiked(comment) ? 'liked' : ''}" 
                                onclick="likeComment(${postId}, ${comment.id})">
                            ❤️ <span class="like-count">${comment.likes || 0}</span>
                        </button>
                    </div>
                </div>
                <div class="comment-text">${comment.text}</div>
            </div>
        `;
    }).join('');
}

// Настройка формы комментария
function setupCommentForm() {
    document.getElementById('commentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!isLoggedIn()) {
            alert('Пожалуйста, войдите в систему чтобы оставлять комментарии');
            return;
        }
        
        const postId = parseInt(localStorage.getItem('currentPost'));
        const text = document.getElementById('commentText').value;
        const currentUser = getCurrentUser();
        
        if (!text.trim()) {
            alert('Пожалуйста, введите текст комментария');
            return;
        }
        
        const newComment = {
            id: Date.now(),
            authorId: currentUser.id,
            text: text,
            date: new Date().toISOString(),
            likes: 0,
            likedBy: []
        };
        
        addCommentToPost(postId, newComment);
    });
}

// Добавление комментария к посту
function addCommentToPost(postId, comment) {
    const posts = JSON.parse(localStorage.getItem('mkblog_posts')) || [];
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex !== -1) {
        if (!posts[postIndex].comments) {
            posts[postIndex].comments = [];
        }
        posts[postIndex].comments.unshift(comment);
        localStorage.setItem('mkblog_posts', JSON.stringify(posts));
        
        // Очистка формы и обновление
        document.getElementById('commentForm').reset();
        loadComments(postId);
        updateCommentCount();
    }
}

// Лайк комментария
function likeComment(postId, commentId) {
    if (!isLoggedIn()) {
        alert('Пожалуйста, войдите в систему чтобы ставить лайки');
        return;
    }
    
    const posts = JSON.parse(localStorage.getItem('mkblog_posts')) || [];
    const postIndex = posts.findIndex(p => p.id === postId);
    const currentUser = getCurrentUser();
    
    if (postIndex !== -1 && posts[postIndex].comments) {
        const commentIndex = posts[postIndex].comments.findIndex(c => c.id === commentId);
        
        if (commentIndex !== -1) {
            const comment = posts[postIndex].comments[commentIndex];
            
            if (!comment.likes) comment.likes = 0;
            if (!comment.likedBy) comment.likedBy = [];
            
            const userLiked = comment.likedBy.includes(currentUser.id);
            
            if (userLiked) {
                comment.likes--;
                comment.likedBy = comment.likedBy.filter(id => id !== currentUser.id);
            } else {
                comment.likes++;
                comment.likedBy.push(currentUser.id);
            }
            
            localStorage.setItem('mkblog_posts', JSON.stringify(posts));
            loadComments(postId);
        }
    }
}

// Проверка лайка комментария
function isCommentLiked(comment) {
    const currentUser = getCurrentUser();
    return currentUser && comment.likedBy && comment.likedBy.includes(currentUser.id);
}

// Лайк поста со страницы деталей
function likePostFromDetail(postId) {
    likePost(postId);
    loadPostDetail(); // Полная перезагрузка
}

// Обновление счетчика комментариев
function updateCommentCount() {
    const postId = parseInt(localStorage.getItem('currentPost'));
    const posts = JSON.parse(localStorage.getItem('mkblog_posts')) || [];
    const post = posts.find(p => p.id === postId);
    
    if (post) {
        const commentCount = post.comments ? post.comments.length : 0;
        const commentElements = document.querySelectorAll('.stat-count');
        commentElements[1].textContent = commentCount;
    }
}

// Удаление поста со страницы деталей
function deletePostFromDetail(postId) {
    if (confirm('Вы уверены, что хотите удалить этот пост?')) {
        const posts = JSON.parse(localStorage.getItem('mkblog_posts')) || [];
        const updatedPosts = posts.filter(p => p.id !== postId);
        localStorage.setItem('mkblog_posts', JSON.stringify(updatedPosts));
        
        alert('Пост успешно удален!');
        window.location.href = 'dashboard.html';
    }
}

// Редактирование поста со страницы деталей
function editPostFromDetail(postId) {
    localStorage.setItem('editingPost', postId);
    window.location.href = 'dashboard.html';
}