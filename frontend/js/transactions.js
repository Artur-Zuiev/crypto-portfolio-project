// ==================================================
// BLOCK 01 — API SETTINGS / НАСТРОЙКИ API
// Адрес backend-сервера для страницы transactions.html.
// ==================================================

const API_URL = "http://localhost:8080/api";


// ==================================================
// BLOCK 02 — AUTH CHECK / ПРОВЕРКА АВТОРИЗАЦИИ
// Если JWT-токена нет, пользователь возвращается на login.html.
// ==================================================

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}


// ==================================================
// BLOCK 03 — DOM ELEMENTS / HTML-ЭЛЕМЕНТЫ
// Список всех транзакций и кнопка Logout.
// ==================================================

const allTransactionsList = document.getElementById("allTransactionsList");
const logoutBtn = document.getElementById("logoutBtn");


// ==================================================
// BLOCK 04 — FORMAT HELPERS / ПОМОЩНИКИ ФОРМАТИРОВАНИЯ
// Формат евро, чисел и даты.
// ==================================================

function formatEuro(value) {
    return Number(value || 0).toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + " €";
}

function formatNumber(value) {
    return Number(value || 0).toLocaleString("de-DE", {
        maximumFractionDigits: 16
    });
}

function formatDateTime(value) {
    if (!value) {
        return "not updated yet";
    }

    const date = new Date(value);

    return date.toLocaleString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


// ==================================================
// BLOCK 05 — TRANSACTIONS RENDER / ОТРИСОВКА ТРАНЗАКЦИЙ
// Создаёт карточки операций BUY/SELL.
// ==================================================

function renderAllTransactions(transactions) {
    if (!allTransactionsList) {
        return;
    }

    allTransactionsList.innerHTML = "";

    if (!transactions || transactions.length === 0) {
        allTransactionsList.innerHTML = `<p class="empty-portfolio">No transactions yet.</p>`;
        return;
    }

    for (const transaction of transactions) {
        const div = document.createElement("div");
        const typeClass = transaction.type === "BUY" ? "transaction-buy" : "transaction-sell";

        div.className = "transaction-item";
        div.innerHTML = `
            <div class="transaction-left">
                <div class="transaction-type ${typeClass}">
                    ${transaction.type}
                </div>

                <div>
                    <div class="transaction-main">
                        ${transaction.cryptoSymbol} · ${transaction.cryptoName}
                    </div>
                    <div class="transaction-date">
                        ${formatDateTime(transaction.transactionDate)}
                    </div>
                </div>
            </div>

            <div class="transaction-right">
                <div class="transaction-quantity">
                    ${formatNumber(transaction.quantity)} ${transaction.cryptoSymbol}
                </div>
                <div class="transaction-price">
                    ${formatEuro(transaction.price)} per coin
                </div>
                <div class="transaction-total">
                    ${formatEuro(transaction.totalValue)}
                </div>
            </div>
        `;

        allTransactionsList.appendChild(div);
    }
}


// ==================================================
// BLOCK 06 — API REQUESTS / ЗАПРОСЫ К BACKEND
// Загружает все транзакции и сортирует новые сверху.
// ==================================================

async function loadAllTransactions() {
    if (!allTransactionsList) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/transactions`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            allTransactionsList.innerHTML = `<p class="empty-portfolio">Could not load transactions.</p>`;
            return;
        }

        const transactions = await response.json();
        const sortedTransactions = transactions.sort(function (a, b) {
            return new Date(b.transactionDate) - new Date(a.transactionDate);
        });

        renderAllTransactions(sortedTransactions);
    } catch (error) {
        allTransactionsList.innerHTML = `<p class="empty-portfolio">Server error while loading transactions.</p>`;
        console.error(error);
    }
}


// ==================================================
// BLOCK 07 — EVENT LISTENERS / ОБРАБОТЧИКИ СОБЫТИЙ
// Logout очищает token и возвращает пользователя на login.html.
// ==================================================

if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("token");
        window.location.href = "login.html";
    });
}


// ==================================================
// BLOCK 08 — PAGE INITIALIZATION / ЗАПУСК СТРАНИЦЫ
// Запускает загрузку transactions.html.
// ==================================================

loadAllTransactions();
