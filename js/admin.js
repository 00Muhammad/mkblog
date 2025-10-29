// Загрузка постов для админа
function loadAdminPosts() {
    const postsList = document.getElementById('adminPostsList');
    const posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    
    if (posts.length === 0) {
        postsList.innerHTML = '<p>У вас пока нет постов.</p>';
        return;
    }

    postsList.innerHTML = posts.map(post => `
        <div class="post-card">
            <div class="post-content">
                <h3>${post.title}</h3>
                <p>${post.content.substring(0, 100)}...</p>
                <div class="post-meta">
                    <span>${new Date(post.date).toLocaleDateString('ru-RU')}</span>
                    <button onclick="deletePost(${post.id})" class="btn-danger">Удалить</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Создание нового поста
document.getElementById('postForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const imageFile = document.getElementById('postImage').files[0];
    const videoFile = document.getElementById('postVideo').files[0];
    
    const newPost = {
        id: Date.now(),
        title: title,
        content: content,
        date: new Date().toISOString(),
        comments: []
    };
    
    // Обработка загрузки файлов (упрощенная версия)
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            newPost.image = e.target.result;
            savePost(newPost);
        };
        reader.readAsDataURL(imageFile);
    } else if (videoFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            newPost.video = e.target.result;
            savePost(newPost);
        };
        reader.readAsDataURL(videoFile);
    } else {
        savePost(newPost);
    }
});

function savePost(post) {
    const posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    posts.unshift(post); // Добавляем в начало
    localStorage.setItem('blogPosts', JSON.stringify(posts));
    
    // Очистка формы
    document.getElementById('postForm').reset();
    loadAdminPosts();
    alert('Пост успешно опубликован!');
}

// Удаление поста
function deletePost(postId) {
    if (confirm('Вы уверены, что хотите удалить этот пост?')) {
        let posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
        posts = posts.filter(post => post.id !== postId);
        localStorage.setItem('blogPosts', JSON.stringify(posts));
        loadAdminPosts();
    }
}

// Инициализация админ-панели
document.addEventListener('DOMContentLoaded', loadAdminPosts);