// ==================================================
// BLOCK 01 — API SETTINGS / НАСТРОЙКИ API
// Адрес backend-сервера для login/register.
// ==================================================

const API_URL = "http://localhost:8080/api";


// ==================================================
// BLOCK 02 — DOM ELEMENTS / HTML-ЭЛЕМЕНТЫ
// Формы входа, регистрации и сообщение об ошибке/успехе.
// ==================================================

const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");


// ==================================================
// BLOCK 03 — UI HELPERS / ПОМОЩНИКИ ИНТЕРФЕЙСА
// Показывает сообщение под формой.
// ==================================================

function showMessage(text, type) {
    if (!message) {
        return;
    }

    message.textContent = text;
    message.classList.remove("success", "error");

    if (type) {
        message.classList.add(type);
    }
}


// ==================================================
// BLOCK 04 — REGISTER / РЕГИСТРАЦИЯ
// Отправляет username, email, password на backend.
// ==================================================

async function handleRegisterSubmit(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !email || !password) {
        showMessage("Please fill in all fields.", "error");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(data.message || "Registration failed.", "error");
            return;
        }

        showMessage(data.message || "Registration successful.", "success");

        setTimeout(function () {
            window.location.href = "login.html";
        }, 1000);
    } catch (error) {
        showMessage("Server error. Please try again later.", "error");
        console.error(error);
    }
}


// ==================================================
// BLOCK 05 — LOGIN / ВХОД
// Отправляет email/password и сохраняет JWT token в localStorage.
// ==================================================

async function handleLoginSubmit(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        showMessage("Please enter email and password.", "error");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(data.message || "Login failed.", "error");
            return;
        }

        localStorage.setItem("token", data.token);
        window.location.href = "dashboard.html";
    } catch (error) {
        showMessage("Server error. Please try again later.", "error");
        console.error(error);
    }
}


// ==================================================
// BLOCK 06 — EVENT LISTENERS / ОБРАБОТЧИКИ СОБЫТИЙ
// Подключает submit к нужной форме: login или register.
// ==================================================

if (registerForm) {
    registerForm.addEventListener("submit", handleRegisterSubmit);
}

if (loginForm) {
    loginForm.addEventListener("submit", handleLoginSubmit);
}
