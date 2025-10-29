class PostManager {
    constructor() {
        this.storage = window.blogStorage;
        this.auth = window.authSystem;
    }

    createPost(title, content, category, media = null) {
        if (!this.auth.isAuthenticated()) {
            throw new Error('Необходимо войти в систему');
        }

        const post = {
            id: Date.now(),
            author: this.auth.getCurrentUser(),
            title: title,
            content: content,
            category: category,
            date: new Date().toLocaleString('ru-RU'),
            media: media
        };

        this.storage.addPost(post);
        return post;
    }

    getAllPosts() {
        return this.storage.getPosts();
    }

    searchPosts(query) {
        const posts = this.getAllPosts();
        const lowerQuery = query.toLowerCase();
        
        return posts.filter(post => 
            post.title.toLowerCase().includes(lowerQuery) ||
            post.content.toLowerCase().includes(lowerQuery) ||
            post.author.toLowerCase().includes(lowerQuery)
        );
    }

    toggleLike(postId) {
        if (!this.auth.isAuthenticated()) {
            throw new Error('Необходимо войти в систему');
        }
        this.storage.toggleLike(postId, this.auth.getCurrentUser());
    }

    getLikesCount(postId) {
        return this.storage.getLikesCount(postId);
    }

    isPostLiked(postId) {
        if (!this.auth.isAuthenticated()) return false;
        return this.storage.isLiked(postId, this.auth.getCurrentUser());
    }

    addComment(postId, text) {
        if (!this.auth.isAuthenticated()) {
            throw new Error('Необходимо войти в систему');
        }

        const comment = {
            id: Date.now(),
            author: this.auth.getCurrentUser(),
            text: text.trim(),
            date: new Date().toLocaleString('ru-RU')
        };

        this.storage.addComment(postId, comment);
        return comment;
    }

    getComments(postId) {
        return this.storage.getComments(postId);
    }
}

window.postManager = new PostManager();
