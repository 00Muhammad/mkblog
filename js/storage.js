// Общее хранилище данных для всех пользователей
class BlogStorage {
    constructor() {
        this.key = 'mkblog_data';
        this.loadData();
    }

    loadData() {
        const saved = localStorage.getItem(this.key);
        if (saved) {
            const data = JSON.parse(saved);
            this.posts = data.posts || [];
            this.likes = data.likes || {};
            this.comments = data.comments || {};
            this.users = data.users || {};
        } else {
            this.posts = [];
            this.likes = {};
            this.comments = {};
            this.users = {};
            this.saveData();
        }
    }

    saveData() {
        const data = {
            posts: this.posts,
            likes: this.likes,
            comments: this.comments,
            users: this.users,
            lastUpdate: new Date().toISOString()
        };
        localStorage.setItem(this.key, JSON.stringify(data));
    }

    // Посты
    addPost(post) {
        this.posts.unshift(post);
        this.saveData();
    }

    getPosts() {
        return this.posts;
    }

    // Лайки
    toggleLike(postId, username) {
        const likeKey = `${postId}_${username}`;
        if (this.likes[likeKey]) {
            delete this.likes[likeKey];
        } else {
            this.likes[likeKey] = true;
        }
        this.saveData();
    }

    getLikesCount(postId) {
        return Object.keys(this.likes).filter(key => key.startsWith(postId + '_')).length;
    }

    isLiked(postId, username) {
        const likeKey = `${postId}_${username}`;
        return !!this.likes[likeKey];
    }

    // Комментарии
    addComment(postId, comment) {
        if (!this.comments[postId]) {
            this.comments[postId] = [];
        }
        this.comments[postId].push(comment);
        this.saveData();
    }

    getComments(postId) {
        return this.comments[postId] || [];
    }

    // Пользователи
    saveUser(username, userData) {
        this.users[username] = { ...this.users[username], ...userData };
        this.saveData();
    }

    getUser(username) {
        return this.users[username] || {};
    }
}

// Глобальный экземпляр хранилища
window.blogStorage = new BlogStorage();
