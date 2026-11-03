// Authentication UI — handles offline backend and non-JSON server errors safely.
const API_URL = `${window.location.protocol}//${window.location.hostname}:8080/api`;
const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

function showMessage(text, type = "error") {
    if (!message) return;
    message.textContent = text;
    message.classList.remove("success", "error");
    message.classList.add(type);
}

async function sendAuthRequest(endpoint, payload) {
    let response;
    try {
        response = await fetch(`${API_URL}/auth/${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        throw new Error("Cannot reach the API. Start Spring Boot on port 8080 and check the server IP / Wi-Fi connection.");
    }
    const contentType = response.headers.get("content-type") || "";
    let data = {};
    if (contentType.includes("application/json")) {
        try { data = await response.json(); } catch { /* malformed response */ }
    }
    if (!response.ok) {
        const fallback = response.status >= 500
            ? "The server encountered an error. Check the Spring Boot console."
            : "Request failed. Please check your details.";
        throw new Error(typeof data.message === "string" ? data.message : fallback);
    }
    return data;
}

function setFormBusy(form, busy) {
    const submit = form.querySelector('button[type="submit"]');
    if (submit) submit.disabled = busy;
}

if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        if (!username || !email || !password) {
            showMessage("Please fill in all fields.");
            return;
        }
        setFormBusy(registerForm, true);
        try {
            const data = await sendAuthRequest("register", { username, email, password });
            showMessage(data.message || "Registration successful. Redirecting to login...", "success");
            window.setTimeout(() => { window.location.href = "login.html"; }, 1000);
        } catch (error) {
            showMessage(error.message);
        } finally {
            setFormBusy(registerForm, false);
        }
    });
}

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        if (!email || !password) {
            showMessage("Please enter email and password.");
            return;
        }
        setFormBusy(loginForm, true);
        try {
            const data = await sendAuthRequest("login", { email, password });
            if (typeof data.token !== "string" || !data.token) {
                throw new Error("Login response is missing a token. Check the backend.");
            }
            localStorage.setItem("token", data.token);
            window.location.href = "dashboard.html";
        } catch (error) {
            showMessage(error.message);
        } finally {
            setFormBusy(loginForm, false);
        }
    });
}
