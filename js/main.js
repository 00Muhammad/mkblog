// Основной файл инициализации
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    updateAuthUI();
    window.uiManager.renderPosts();
    setupEventListeners();
    setupMobileMenu();
    setupTheme();
}

function updateAuthUI() {
    const isLoggedIn = window.authSystem.isAuthenticated();
    const user = window.authSystem.getCurrentUser();

    if (isLoggedIn) {
        document.getElementById('userMenu').style.display = 'block';
        document.getElementById('authLinks').style.display = 'none';
        document.getElementById('createPostLink').style.display = 'block';
        document.getElementById('heroCreatePost').style.display = 'inline-block';
        document.getElementById('userName').textContent = user;
        document.getElementById('create-post').style.display = 'block';
    } else {
        document.getElementById('userMenu').style.display = 'none';
        document.getElementById('authLinks').style.display = 'block';
        document.getElementById('createPostLink').style.display = 'none';
        document.getElementById('heroCreatePost').style.display = 'none';
        document.getElementById('create-post').style.display = 'none';
    }
}

function setupEventListeners() {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (window.authSystem.login(username, password)) {
            alert('Успешный вход!');
            document.getElementById('loginModal').style.display = 'none';
            updateAuthUI();
            window.uiManager.renderPosts();
        } else {
            alert('Ошибка входа!');
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', function() {
        window.authSystem.logout();
        updateAuthUI();
        window.uiManager.renderPosts();
    });

    document.getElementById('newPostForm').addEventListener('submit', function(e) {
        e.preventDefault();
        createNewPost();
    });

    document.querySelector('.search-btn').addEventListener('click', function() {
        const query = document.getElementById('searchInput').value;
        window.uiManager.performSearch(query);
    });

    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const query = document.getElementById('searchInput').value;
            window.uiManager.performSearch(query);
        }
    });

    document.getElementById('closeModal').addEventListener('click', function() {
        document.getElementById('loginModal').style.display = 'none';
    });

    document.getElementById('openLogin').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('loginModal').style.display = 'block';
    });

    window.addEventListener('click', function(e) {
        if (e.target === document.getElementById('loginModal')) {
            document.getElementById('loginModal').style.display = 'none';
        }
    });
}

function createNewPost() {
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const category = document.getElementById('postCategory').value;

    try {
        window.postManager.createPost(title, content, category);
        document.getElementById('newPostForm').reset();
        window.uiManager.renderPosts();
        alert('Пост успешно опубликован!');
    } catch (error) {
        alert(error.message);
    }
}

function setupMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
}

function setupTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
}
