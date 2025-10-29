// База данных пользователей
let users = JSON.parse(localStorage.getItem('mkblog_users')) || [];
let currentUser = JSON.parse(localStorage.getItem('mkblog_currentUser')) || null;

// Регистрация нового пользователя
function registerUser(username, email, password, phone = '') {
    if (users.find(user => user.email === email)) {
        return { success: false, message: 'Пользователь с таким email уже существует' };
    }
    
    if (users.find(user => user.username === username)) {
        return { success: false, message: 'Пользователь с таким именем уже существует' };
    }
    
    if (phone && users.find(user => user.phone === phone)) {
        return { success: false, message: 'Пользователь с таким номером телефона уже существует' };
    }
    
    const newUser = {
        id: Date.now(),
        username: username,
        email: email,
        password: password,
        phone: phone,
        avatar: `https://ui-avatars.com/api/?name=${username}&background=667eea&color=fff`,
        coverPhoto: '',
        bio: '',
        company: {
            name: '',
            founded: '',
            mission: '',
            description: ''
        },
        privacy: {
            phoneVisible: false,
            emailVisible: true,
            profileVisible: true
        },
        social: {
            website: '',
            twitter: '',
            instagram: ''
        },
        joinDate: new Date().toISOString(),
        posts: [],
        isVerified: false
    };
    
    users.push(newUser);
    localStorage.setItem('mkblog_users', JSON.stringify(users));
    
    return { success: true, message: 'Регистрация успешна!' };
}

// Вход пользователя
function loginUser(email, password) {
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('mkblog_currentUser', JSON.stringify(user));
        return { success: true, message: 'Вход успешен!', user: user };
    } else {
        return { success: false, message: 'Неверный email или пароль' };
    }
}

// Вход по телефону
function loginByPhone(phone, password) {
    const user = users.find(u => u.phone === phone && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('mkblog_currentUser', JSON.stringify(user));
        return { success: true, message: 'Вход успешен!', user: user };
    } else {
        return { success: false, message: 'Неверный номер телефона или пароль' };
    }
}

// Обновление профиля пользователя
function updateUserProfile(userId, updates) {
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates };
        localStorage.setItem('mkblog_users', JSON.stringify(users));
        
        // Обновляем текущего пользователя если это он
        if (currentUser && currentUser.id === userId) {
            currentUser = users[userIndex];
            localStorage.setItem('mkblog_currentUser', JSON.stringify(currentUser));
        }
        
        return { success: true, message: 'Профиль обновлен!' };
    }
    
    return { success: false, message: 'Пользователь не найден' };
}

// Выход пользователя
function logoutUser() {
    currentUser = null;
    localStorage.removeItem('mkblog_currentUser');
    window.location.href = 'index.html';
}

// Получение текущего пользователя
function getCurrentUser() {
    return currentUser;
}

// Проверка авторизации
function isLoggedIn() {
    return currentUser !== null;
}

// Получение пользователя по ID (с учетом приватности)
function getUserById(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return null;
    
    // Возвращаем только публичные данные
    return {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        coverPhoto: user.coverPhoto,
        bio: user.privacy.profileVisible ? user.bio : '',
        company: user.company,
        joinDate: user.joinDate,
        isVerified: user.isVerified,
        social: user.social
    };
}