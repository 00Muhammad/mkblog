// Инициализация настроек профиля
document.addEventListener('DOMContentLoaded', function() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    loadProfileData();
    setupEventListeners();
    setupImageUploads();
    setupThemeSelector();
});

// Загрузка данных профиля
function loadProfileData() {
    const currentUser = getCurrentUser();
    
    if (!currentUser) return;
    
    // Заполняем форму профиля
    document.getElementById('username').value = currentUser.username || '';
    document.getElementById('email').value = currentUser.email || '';
    document.getElementById('phone').value = currentUser.phone || '';
    document.getElementById('bio').value = currentUser.bio || '';
    
    // Заполняем данные компании
    document.getElementById('companyName').value = currentUser.company?.name || '';
    document.getElementById('foundedYear').value = currentUser.company?.founded || '';
    document.getElementById('companyMission').value = currentUser.company?.mission || '';
    document.getElementById('companyDescription').value = currentUser.company?.description || '';
    
    // Заполняем настройки приватности
    document.getElementById('profileVisible').checked = currentUser.privacy?.profileVisible ?? true;
    document.getElementById('emailVisible').checked = currentUser.privacy?.emailVisible ?? true;
    document.getElementById('phoneVisible').checked = currentUser.privacy?.phoneVisible ?? false;
    
    // Заполняем соцсети
    document.getElementById('website').value = currentUser.social?.website || '';
    document.getElementById('twitter').value = currentUser.social?.twitter || '';
    document.getElementById('instagram').value = currentUser.social?.instagram || '';
    
    // Обновляем превью
    updatePreview();
    loadAvatarPreview();
    loadCoverPreview();
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Сохранение профиля
    document.getElementById('profileForm').addEventListener('submit', saveProfile);
    
    // Сохранение компании
    document.getElementById('companyForm').addEventListener('submit', saveCompany);
    
    // Сохранение приватности
    document.getElementById('privacyForm').addEventListener('submit', savePrivacy);
    
    // Сохранение соцсетей
    document.getElementById('socialForm').addEventListener('submit', saveSocial);
    
    // Обновление превью при изменении полей
    document.getElementById('username').addEventListener('input', updatePreview);
    document.getElementById('bio').addEventListener('input', updatePreview);
    document.getElementById('companyName').addEventListener('input', updatePreview);
    document.getElementById('companyMission').addEventListener('input', updatePreview);
    
    // Маска для телефона
    document.getElementById('phone').addEventListener('input', function(e) {
        let x = e.target.value.replace(/\D/g, '').match(/(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
        e.target.value = '+7' + (x[2] ? ' (' + x[2] : '') + (x[3] ? ') ' + x[3] : '') + (x[4] ? '-' + x[4] : '') + (x[5] ? '-' + x[5] : '');
    });
}

// Сохранение профиля
function saveProfile(e) {
    e.preventDefault();
    
    const updates = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        bio: document.getElementById('bio').value
    };
    
    const result = updateUserProfile(getCurrentUser().id, updates);
    
    if (result.success) {
        alert(result.message);
        updatePreview();
    } else {
        alert(result.message);
    }
}

// Сохранение информации о компании
function saveCompany(e) {
    e.preventDefault();
    
    const updates = {
        company: {
            name: document.getElementById('companyName').value,
            founded: document.getElementById('foundedYear').value,
            mission: document.getElementById('companyMission').value,
            description: document.getElementById('companyDescription').value
        }
    };
    
    const result = updateUserProfile(getCurrentUser().id, updates);
    
    if (result.success) {
        alert(result.message);
        updatePreview();
    } else {
        alert(result.message);
    }
}

// Сохранение настроек приватности
function savePrivacy(e) {
    e.preventDefault();
    
    const updates = {
        privacy: {
            profileVisible: document.getElementById('profileVisible').checked,
            emailVisible: document.getElementById('emailVisible').checked,
            phoneVisible: document.getElementById('phoneVisible').checked
        }
    };
    
    const result = updateUserProfile(getCurrentUser().id, updates);
    alert(result.message);
}

// Сохранение соцсетей
function saveSocial(e) {
    e.preventDefault();
    
    const updates = {
        social: {
            website: document.getElementById('website').value,
            twitter: document.getElementById('twitter').value,
            instagram: document.getElementById('instagram').value
        }
    };
    
    const result = updateUserProfile(getCurrentUser().id, updates);
    alert(result.message);
}

// Загрузка превью аватара
function loadAvatarPreview() {
    const currentUser = getCurrentUser();
    const avatarPreview = document.getElementById('avatarPreview');
    
    if (currentUser.avatar && currentUser.avatar.startsWith('data:')) {
        avatarPreview.style.backgroundImage = `url(${currentUser.avatar})`;
        avatarPreview.innerHTML = '';
    } else {
        avatarPreview.style.backgroundImage = '';
        avatarPreview.innerHTML = currentUser.username.charAt(0).toUpperCase();
        avatarPreview.style.background = `linear-gradient(135deg, ${getRandomColor()}, ${getRandomColor()})`;
    }
}

// Загрузка превью обложки
function loadCoverPreview() {
    const currentUser = getCurrentUser();
    const coverPreview = document.getElementById('coverPreview');
    
    if (currentUser.coverPhoto) {
        coverPreview.style.backgroundImage = `url(${currentUser.coverPhoto})`;
    } else {
        coverPreview.style.backgroundImage = 'linear-gradient(135deg, #667eea, #764ba2)';
    }
}

// Настройка загрузки изображений
function setupImageUploads() {
    // Загрузка аватара
    document.getElementById('avatarUpload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const updates = { avatar: e.target.result };
                const result = updateUserProfile(getCurrentUser().id, updates);
                
                if (result.success) {
                    loadAvatarPreview();
                    updatePreview();
                }
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Загрузка обложки
    document.getElementById('coverUpload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const updates = { coverPhoto: e.target.result };
                const result = updateUserProfile(getCurrentUser().id, updates);
                
                if (result.success) {
                    loadCoverPreview();
                    updatePreview();
                }
            };
            reader.readAsDataURL(file);
        }
    });
}

// Обновление превью профиля
function updatePreview() {
    const currentUser = getCurrentUser();
    
    document.getElementById('previewUsername').textContent = currentUser.username;
    document.getElementById('previewBio').textContent = currentUser.bio || 'Расскажите о себе...';
    
    // Аватар превью
    const previewAvatar = document.getElementById('previewAvatar');
    if (currentUser.avatar && currentUser.avatar.startsWith('data:')) {
        previewAvatar.style.backgroundImage = `url(${currentUser.avatar})`;
        previewAvatar.innerHTML = '';
    } else {
        previewAvatar.style.backgroundImage = '';
        previewAvatar.innerHTML = currentUser.username.charAt(0).toUpperCase();
        previewAvatar.style.background = `linear-gradient(135deg, ${getRandomColor()}, ${getRandomColor()})`;
    }
    
    // Обложка превью
    const previewCover = document.getElementById('previewCover');
    if (currentUser.coverPhoto) {
        previewCover.style.backgroundImage = `url(${currentUser.coverPhoto})`;
    } else {
        previewCover.style.backgroundImage = 'linear-gradient(135deg, #667eea, #764ba2)';
    }
    
    // Информация о компании
    const previewCompany = document.getElementById('previewCompany');
    if (currentUser.company?.name) {
        previewCompany.innerHTML = `
            <strong>${currentUser.company.name}</strong>
            ${currentUser.company.founded ? ` · Основана в ${currentUser.company.founded}` : ''}
            ${currentUser.company.mission ? `<br><small>${currentUser.company.mission}</small>` : ''}
        `;
    } else {
        previewCompany.innerHTML = '<em>Информация о компании не указана</em>';
    }
}

// Переключение секций настроек
function showSection(section) {
    // Скрываем все секции
    document.querySelectorAll('.settings-section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    // Убираем активный класс у всех пунктов меню
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Показываем выбранную секцию
    document.getElementById(section + '-section').classList.add('active');
    
    // Активируем соответствующий пункт меню
    document.querySelector(`.nav-item[href="#${section}"]`).classList.add('active');
}

// Настройка выбора темы
function setupThemeSelector() {
    document.querySelectorAll('.theme-color').forEach(color => {
        color.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            applyTheme(theme);
        });
    });
}

// Применение темы
function applyTheme(theme) {
    const root = document.documentElement;
    
    switch(theme) {
        case 'blue':
            root.style.setProperty('--primary', '#4facfe');
            root.style.setProperty('--secondary', '#00f2fe');
            break;
        case 'purple':
            root.style.setProperty('--primary', '#a18cd1');
            root.style.setProperty('--secondary', '#fbc2eb');
            break;
        case 'orange':
            root.style.setProperty('--primary', '#f093fb');
            root.style.setProperty('--secondary', '#f5576c');
            break;
        default:
            root.style.setProperty('--primary', '#667eea');
            root.style.setProperty('--secondary', '#764ba2');
    }
    
    // Сохраняем тему
    localStorage.setItem('mkblog_theme', theme);
}

// Утилиты
function getRandomColor() {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
    return colors[Math.floor(Math.random() * colors.length)];
}