class UImanager {
    constructor() {
        this.postManager = window.postManager;
        this.auth = window.authSystem;
    }

    renderPosts(posts = null) {
        const container = document.getElementById('postsContainer');
        const postsToRender = posts || this.postManager.getAllPosts();

        if (postsToRender.length === 0) {
            container.innerHTML = this.getEmptyState();
            return;
        }

        container.innerHTML = postsToRender.map(post => this.createPostHTML(post)).join('');
    }

    createPostHTML(post) {
        const likesCount = this.postManager.getLikesCount(post.id);
        const isLiked = this.postManager.isPostLiked(post.id);
        const comments = this.postManager.getComments(post.id);

        let mediaHTML = '';
        if (post.media) {
            if (post.media.type === 'image') {
                mediaHTML = `<div class="post-media"><img src="${post.media.data}" alt="Изображение"></div>`;
            } else if (post.media.type === 'video') {
                mediaHTML = `<div class="post-media"><video src="${post.media.data}" controls></video></div>`;
            }
        }

        return `
            <div class="post-card" id="post-${post.id}">
                <div class="post-author">
                    <div class="author-avatar">${post.author.charAt(0).toUpperCase()}</div>
                    <div>
                        <div class="author-name">${post.author}</div>
                        <div class="post-date">${post.date}</div>
                    </div>
                </div>
                <div class="post-content">
                    <h3>${post.title}</h3>
                    <p>${post.content}</p>
                </div>
                ${mediaHTML}
                <div class="post-actions">
                    <button class="post-action ${isLiked ? 'liked' : ''}" onclick="uiManager.handleLike(${post.id})">
                        <i class="fas fa-heart"></i>
                        <span class="likes-count">${likesCount}</span>
                    </button>
                    <button class="post-action" onclick="uiManager.toggleComments(${post.id})">
                        <i class="far fa-comment"></i>
                        <span class="comments-count">${comments.length}</span>
                    </button>
                    <div class="comments-section" id="comments-${post.id}" style="display: none;">
                        ${this.createCommentsHTML(post.id, comments)}
                    </div>
                    <button class="post-action" onclick="uiManager.sharePost(${post.id})">
                        <i class="fas fa-share-alt"></i>
                    </button>
                </div>
            </div>
        `;
    }

    createCommentsHTML(postId, comments) {
        return `
            <div class="comment-form">
                <input type="text" class="comment-input" id="comment-input-${postId}" placeholder="Напишите комментарий...">
                <button class="btn btn-primary" onclick="uiManager.addComment(${postId})">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
            <div class="comments-list">
                ${comments.map(comment => `
                    <div class="comment">
                        <div class="comment-author">${comment.author}</div>
                        <div class="comment-text">${comment.text}</div>
                        <div class="comment-date">${comment.date}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getEmptyState() {
        return `
            <div class="empty-state">
                <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <i class="fas fa-newspaper" style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <h3>Пока нет постов</h3>
                    <p>Будьте первым, кто опубликует пост!</p>
                </div>
            </div>
        `;
    }

    handleLike(postId) {
        try {
            this.postManager.toggleLike(postId);
            this.renderPosts();
        } catch (error) {
            alert(error.message);
        }
    }

    toggleComments(postId) {
        const commentsSection = document.getElementById(`comments-${postId}`);
        commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
    }

    addComment(postId) {
        const input = document.getElementById(`comment-input-${postId}`);
        const text = input.value.trim();

        if (!text) {
            alert('Введите текст комментария!');
            return;
        }

        try {
            this.postManager.addComment(postId, text);
            input.value = '';
            this.renderPosts();
        } catch (error) {
            alert(error.message);
        }
    }

    sharePost(postId) {
        const url = `${window.location.origin}${window.location.pathname}?post=${postId}`;
        navigator.clipboard.writeText(url).then(() => {
            alert('Ссылка на пост скопирована в буфер обмена!');
        });
    }

    performSearch(query) {
        if (!query.trim()) {
            this.renderPosts();
            return;
        }

        const results = this.postManager.searchPosts(query);
        this.renderPosts(results);
    }
}

window.uiManager = new UImanager();
