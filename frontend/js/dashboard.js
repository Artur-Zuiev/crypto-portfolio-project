// ==================================================
// DASHBOARD.JS — CLEAN STRUCTURE / ЧИСТАЯ СТРУКТУРА
// Управляет страницей dashboard.html: пользователь, цены, сделки, портфель.
// ==================================================

// ==================================================
// BLOCK 01 — API SETTINGS / НАСТРОЙКИ API
// Адрес backend-сервера и общие параметры страницы.
// ==================================================

const API_URL = `${window.location.protocol}//${window.location.hostname}:8080/api`;
const PRICE_REFRESH_INTERVAL_MINUTES = 5;
const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}


// ==================================================
// BLOCK 02 — DOM SHORTCUTS / БЫСТРЫЙ ДОСТУП К HTML
// Здесь собраны все элементы dashboard.html, которые нужны JavaScript.
// ==================================================

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const dom = {
    userName: $("#userName"),
    userEmail: $("#userEmail"),
    userAvatar: $("#userAvatar"),
    lastUpdatedInfo: $("#lastUpdatedInfo"),

    totalValue: $("#totalValue"),
    totalInvested: $("#totalInvested"),
    totalProfitLoss: $("#totalProfitLoss"),
    assetCount: $("#assetCount"),
    bestCoin: $("#bestCoin"),
    worstCoin: $("#worstCoin"),

    addCryptoForm: $("#addCryptoForm"),
    transactionTypeInput: $("#transactionType"),
    buyTypeBtn: $("#buyTypeBtn"),
    sellTypeBtn: $("#sellTypeBtn"),
    addTransactionBtn: $("#addTransactionBtn"),
    addMessage: $("#addMessage"),

    cryptoSelect: $("#cryptoCurrencyId"),
    quantityInput: $("#quantity"),
    priceInput: $("#averageBuyPrice"),
    selectedCryptoPrice: $("#selectedCryptoPrice"),
    transactionPreviewValue: $("#transactionPreviewValue"),

    cryptoDropdown: $("#cryptoDropdown"),
    cryptoDropdownToggle: $("#cryptoDropdownToggle"),
    cryptoDropdownIcon: $(".crypto-dropdown-icon"),
    cryptoDropdownTitle: $("#cryptoDropdownTitle"),
    cryptoDropdownSubtitle: $("#cryptoDropdownSubtitle"),
    cryptoDropdownOptions: $$(".crypto-dropdown-option"),

    transactionsList: $("#transactionsList"),
    allocationChart: $("#allocationChart"),
    portfolioList: $("#portfolioList"),
    portfolioStatus: $("#portfolioStatus"),
    searchPortfolio: $("#searchPortfolio"),
    sortPortfolio: $("#sortPortfolio"),

    sortDropdown: $("#sortDropdown"),
    sortDropdownToggle: $("#sortDropdownToggle"),
    sortDropdownIcon: $(".sort-dropdown-icon"),
    sortDropdownTitle: $("#sortDropdownTitle"),
    sortDropdownSubtitle: $("#sortDropdownSubtitle"),
    sortDropdownOptions: $$(".sort-dropdown-option"),

    refreshPricesBtn: $("#refreshPricesBtn"),
    logoutBtn: $("#logoutBtn"),

    deleteModal: $("#deleteModal"),
    deleteModalText: $("#deleteModalText"),
    cancelDeleteBtn: $("#cancelDeleteBtn"),
    confirmDeleteBtn: $("#confirmDeleteBtn")
};


// ==================================================
// BLOCK 03 — PAGE STATE / СОСТОЯНИЕ СТРАНИЦЫ
// Данные, которые используются в нескольких блоках.
// ==================================================

const state = {
    portfolio: [],
    cryptoList: [],
    itemToDelete: null
};


// ==================================================
// BLOCK 04 — API HELPERS / ПОМОЩНИКИ ДЛЯ API
// Убирает повторяющиеся fetch, headers, JSON и обработку 401.
// ==================================================

function logoutUser() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

function getAuthHeaders(includeJson = false) {
    const headers = { Authorization: `Bearer ${token}` };

    if (includeJson) {
        headers["Content-Type"] = "application/json";
    }

    return headers;
}

async function readJsonSafe(response) {
    const text = await response.text();

    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            ...getAuthHeaders(Boolean(options.body)),
            ...(options.headers || {})
        }
    });

    const data = await readJsonSafe(response);

    if (response.status === 401 || response.status === 403) {
        logoutUser();
        return null;
    }

    if (!response.ok) {
        throw new Error(data?.message || `Request failed: ${path}`);
    }

    return data;
}

const apiGet = (path) => apiRequest(path);

function apiSend(path, method, body = null) {
    return apiRequest(path, {
        method,
        body: body ? JSON.stringify(body) : undefined
    });
}


// ==================================================
// BLOCK 05 — FORMAT HELPERS / ФОРМАТИРОВАНИЕ
// Деньги, числа, даты и проверка свежести цены.
// ==================================================

function formatEuro(value) {
    const amount = Number(value ?? 0);
    if (!Number.isFinite(amount)) return "—";
    const magnitude = Math.abs(amount);
    // Preserve visible sub-cent movement instead of turning small P/L into 0,00 €.
    const digits = magnitude > 0 && magnitude < 0.005 ? 18 : 2;
    return `${amount.toLocaleString("de-DE", {
        minimumFractionDigits: digits === 2 ? 2 : 0,
        maximumFractionDigits: digits
    })} €`;
}

function formatNumber(value) {
    return Number(value || 0).toLocaleString("de-DE", {
        maximumFractionDigits: 16
    });
}

function formatPercent(value) {
    const percent = Number(value);
    return (Number.isFinite(percent) ? percent : 0).toLocaleString("de-DE", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}

function formatDateTime(value) {
    if (!value) {
        return "not updated yet";
    }

    return new Date(value).toLocaleString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function getNewestCryptoDate(cryptoList) {
    return (cryptoList || []).reduce((newestDate, crypto) => {
        if (!crypto.lastUpdated) {
            return newestDate;
        }

        const currentDate = new Date(crypto.lastUpdated);
        return !newestDate || currentDate > newestDate ? currentDate : newestDate;
    }, null);
}

function isOlderThanMinutes(dateValue, minutes) {
    if (!dateValue) {
        return true;
    }

    return (new Date() - new Date(dateValue)) / 1000 / 60 > minutes;
}


// ==================================================
// BLOCK 06 — UI HELPERS / ПОМОЩНИКИ ИНТЕРФЕЙСА
// Сообщения, открытие/закрытие dropdown и маленькие действия.
// ==================================================

function showMessage(text, type = "success") {
    if (!dom.addMessage) {
        return;
    }

    dom.addMessage.textContent = text;
    dom.addMessage.className = type === "success" ? "message-success" : "message-error";

    setTimeout(() => {
        dom.addMessage.textContent = "";
        dom.addMessage.className = "";
    }, 3000);
}

function closeDropdowns() {
    dom.cryptoDropdown?.classList.remove("open");
    dom.sortDropdown?.classList.remove("open");
}

function setButtonLoading(button, isLoading, loadingText, normalText) {
    if (!button) {
        return;
    }

    button.disabled = isLoading;
    button.textContent = isLoading ? loadingText : normalText;
}


// ==================================================
// BLOCK 07 — USER PROFILE / ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ
// Загружает имя, email и первую букву аватара.
// ==================================================

async function loadCurrentUser() {
    try {
        const user = await apiGet("/auth/me");
        const username = user?.username || "Unknown user";
        const email = user?.email || "No email";

        if (dom.userName) dom.userName.textContent = username;
        if (dom.userEmail) dom.userEmail.textContent = email;
        if (dom.userAvatar) dom.userAvatar.textContent = username.trim().charAt(0).toUpperCase() || "?";
    } catch (error) {
        if (dom.userName) dom.userName.textContent = "Could not load user";
        if (dom.userEmail) dom.userEmail.textContent = "Server error";
        if (dom.userAvatar) dom.userAvatar.textContent = "!";
        console.error(error);
    }
}


// ==================================================
// BLOCK 08 — CRYPTO PRICES / ЦЕНЫ КРИПТОВАЛЮТ
// Загружает цены, обновляет select и дату последнего обновления.
// ==================================================

async function loadCryptoList() {
    state.cryptoList = await apiGet("/crypto") || [];
    updateCryptoSelectPrices();
    renderLastUpdated();
    return state.cryptoList;
}

function renderLastUpdated() {
    if (!dom.lastUpdatedInfo) {
        return;
    }

    const newestDate = getNewestCryptoDate(state.cryptoList);
    dom.lastUpdatedInfo.textContent = newestDate ? formatDateTime(newestDate) : "not updated yet";
}

function updateCryptoSelectPrices() {
    if (!dom.cryptoSelect) return;

    // Coin identifiers must come from the database, not hard-coded option IDs.
    // This also works after users reset PostgreSQL and the IDs change.
    const previousSymbol = getSelectedCryptoSymbol();
    const placeholder = new Option("Choose crypto", "");
    dom.cryptoSelect.replaceChildren(placeholder);

    for (const crypto of state.cryptoList) {
        const option = new Option(`${crypto.symbol} - ${crypto.name}`, String(crypto.id));
        option.dataset.symbol = crypto.symbol;
        option.dataset.name = crypto.name;
        option.dataset.price = String(crypto.currentPrice ?? 0);
        dom.cryptoSelect.add(option);
    }

    const matching = [...dom.cryptoSelect.options].find(option => option.dataset.symbol === previousSymbol);
    if (matching) dom.cryptoSelect.value = matching.value;

    // Existing custom dropdown buttons remain, but use database IDs.
    dom.cryptoDropdownOptions.forEach(button => {
        const symbol = button.querySelector(".crypto-option-icon")?.textContent?.trim();
        const coin = state.cryptoList.find(item => item.symbol === symbol);
        button.dataset.value = coin ? String(coin.id) : "";
        button.disabled = !coin;
    });

    updateCustomCryptoDropdown();
    updateSelectedCryptoPriceInfo();
    const price = getSelectedCryptoPrice();
    if (price > 0 && dom.priceInput && !dom.priceInput.value) {
        dom.priceInput.value = price;
        updateTransactionPreview();
    }
}

async function autoRefreshPricesIfNeeded() {
    try {
        const cryptoList = await loadCryptoList();
        const newestDate = getNewestCryptoDate(cryptoList);

        if (!newestDate || isOlderThanMinutes(newestDate, PRICE_REFRESH_INTERVAL_MINUTES)) {
            await refreshPrices({ silent: true });
        }
    } catch (error) {
        console.error("Auto refresh check failed:", error);
    }
}

async function refreshPrices({ silent = false } = {}) {
    try {
        setButtonLoading(dom.refreshPricesBtn, true, "Updating...", "Refresh Prices");
        await apiSend("/crypto/update-prices", "POST");

        await reloadDashboardData({ includeCrypto: true, includeTransactions: true });

        if (!silent) {
            showMessage("Prices updated successfully", "success");
        }
    } catch (error) {
        // The API can initialize the coin list even when CoinGecko is unavailable.
        // Reload it so the selector uses real database IDs, never hard-coded ones.
        try {
            await loadCryptoList();
        } catch (reloadError) {
            console.error("Coin list reload failed:", reloadError);
        }
        showMessage(error.message || "Could not refresh prices", "error");
        console.error(error);
    } finally {
        setButtonLoading(dom.refreshPricesBtn, false, "Updating...", "Refresh Prices");
    }
}


// ==================================================
// BLOCK 09 — SUMMARY CARDS / КАРТОЧКИ СТАТИСТИКИ
// Total Value, Invested, Profit/Loss, Assets, Best/Worst Coin.
// ==================================================

async function loadSummary() {
    try {
        const summary = await apiGet("/portfolio/my/summary") || {};

        if (dom.totalValue) dom.totalValue.textContent = formatEuro(summary.totalValue);
        if (dom.totalInvested) dom.totalInvested.textContent = formatEuro(summary.totalInvested);
        if (dom.assetCount) dom.assetCount.textContent = summary.assetCount || 0;

        setProfitText(dom.totalProfitLoss, summary.totalProfitLoss);
        setCoinResult(dom.bestCoin, summary.bestAssetSymbol, summary.bestAssetProfitLoss, "No gains yet", "No assets yet", summary.assetCount);
        setCoinResult(dom.worstCoin, summary.worstAssetSymbol, summary.worstAssetProfitLoss, "No losses yet", "No assets yet", summary.assetCount);
        saveObservedValue(summary.totalValue);
        renderValueHistory();
        await loadRealizedPerformance(summary.totalProfitLoss);
    } catch (error) {
        [dom.totalValue, dom.totalInvested, dom.totalProfitLoss, dom.assetCount, dom.bestCoin, dom.worstCoin]
            .forEach((element) => {
                if (element) element.textContent = "Error";
            });

        console.error(error);
    }
}

// ==================================================
// RECORDED PERFORMANCE / TRADE ACCOUNTING
// ==================================================

async function loadRealizedPerformance(unrealizedValue) {
    const realizedNode = $("#realizedProfitLoss");
    const combinedNode = $("#combinedProfitLoss");
    const note = $("#realizedProfitNote");

    try {
        const data = await apiGet("/portfolio/performance/realized");
        if (!data) return;
        const realized = Number(data.realizedProfitLoss ?? 0);
        const unmatched = Number(data.unmatchedSales ?? 0);
        // Do not publish a misleading combined total when cost history is incomplete.
        if (unmatched > 0) {
            if (realizedNode) realizedNode.textContent = "Incomplete history";
            if (combinedNode) combinedNode.textContent = "—";
            if (note) note.textContent = `${unmatched} sale(s) cannot be matched to recorded buys`;
            return;
        }
        setProfitText(realizedNode, realized);
        setProfitText(combinedNode, realized + Number(unrealizedValue || 0));
        if (note) note.textContent = `${data.completedSales ?? 0} recorded sale(s), weighted-average cost`;
    } catch (error) {
        if (realizedNode) realizedNode.textContent = "Unavailable";
        if (combinedNode) combinedNode.textContent = "—";
        if (note) note.textContent = "Could not load trade performance";
        console.error("Realized profit unavailable:", error);
    }
}

// This is NOT a reconstruction of historical market prices. Each point is a real
// value observed while the dashboard was open. Data is browser-local and
// isolated per logged-in account; no historical prices are invented.
function valueHistoryStorageKey() {
    const email = dom.userEmail?.textContent?.trim() || "";
    if (!email || email === "No email" || email === "Server error") return null;
    return `crypto-portfolio-observations-v1:${email}`;
}

function getObservedValues() {
    const key = valueHistoryStorageKey();
    if (!key) return [];
    try {
        const parsed = JSON.parse(localStorage.getItem(key) || "[]");
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(entry => Number.isFinite(entry?.at) &&
            Number.isFinite(entry?.value) && entry.value >= 0);
    } catch { return []; }
}

function saveObservedValue(totalValue) {
    const key = valueHistoryStorageKey();
    const amount = Number(totalValue);
    if (!key || !Number.isFinite(amount) || amount < 0) return;
    try {
        const list = getObservedValues();
        const now = Date.now();
        const last = list[list.length - 1];
        // Record price movements at most once per minute; record unchanged
        // values only every 10 minutes to avoid flooding localStorage.
        if (last && now - last.at < 60000) return;
        if (last && now - last.at < 600000 && Math.abs(last.value - amount) < 0.00000001) return;
        const cutoff = now - 90 * 86400000;
        const history = [...list, { at: now, value: amount }]
            .filter(entry => entry.at >= cutoff).slice(-360);
        localStorage.setItem(key, JSON.stringify(history));
    } catch (error) {
        console.warn("Could not save local value observation", error);
    }
}

function renderValueHistory() {
    const node = $("#portfolioHistoryGraph");
    const counter = $("#historySampleCount");
    if (!node) return;
    const entries = getObservedValues();
    if (counter) counter.textContent = `${entries.length} observation${entries.length === 1 ? "" : "s"}`;
    if (entries.length < 2) {
        node.innerHTML = '<p class="performance-chart-empty">Your value history starts now. Open or refresh the dashboard later to collect more observations.</p>';
        return;
    }

    const width = 900, height = 260;
    const left = 76, right = 24, top = 24, bottom = 46;
    const plotWidth = width - left - right, plotHeight = height - top - bottom;
    const start = entries[0].at, end = entries[entries.length - 1].at;
    const rawMin = Math.min(...entries.map(point => point.value));
    const rawMax = Math.max(...entries.map(point => point.value));
    const padding = Math.max((rawMax - rawMin) * 0.12, Math.max(rawMax, 1) * 0.004);
    const min = Math.max(0, rawMin - padding), max = rawMax + padding;
    const x = point => left + (point.at - start) / Math.max(end - start, 1) * plotWidth;
    const y = point => top + (max - point.value) / Math.max(max - min, 0.00001) * plotHeight;
    const coords = entries.map(point => [x(point), y(point)]);
    const line = coords.map(([px, py], i) => `${i === 0 ? "M" : "L"}${px.toFixed(2)},${py.toFixed(2)}`).join(" ");
    const floor = height - bottom;
    const area = `${line} L${coords[coords.length - 1][0].toFixed(2)},${floor} L${coords[0][0].toFixed(2)},${floor} Z`;
    const grid = Array.from({ length: 4 }, (_, i) => {
        const value = min + (max - min) * i / 3;
        const py = top + (3 - i) / 3 * plotHeight;
        return `<line class="chart-grid" x1="${left}" y1="${py}" x2="${width - right}" y2="${py}"/>` +
            `<text x="${left - 12}" y="${py + 4}" text-anchor="end">${formatEuro(value)}</text>`;
    }).join("");
    const dates = [entries[0], entries[entries.length - 1]].map(point =>
        `<text x="${x(point)}" y="${height - 16}" text-anchor="${point === entries[0] ? "start" : "end"}">${new Date(point.at).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</text>`
    ).join("");
    const latest = coords[coords.length - 1];
    node.innerHTML = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs><linearGradient id="value-history-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#668bff" stop-opacity=".26"/>
          <stop offset="100%" stop-color="#668bff" stop-opacity="0"/>
        </linearGradient></defs>
        ${grid}<path class="chart-area" d="${area}"/>
        <path class="chart-line" d="${line}"/>
        <circle class="chart-point" cx="${latest[0]}" cy="${latest[1]}" r="5"/>
        ${dates}</svg>`;
    node.setAttribute("aria-label", `Portfolio value observations from ${formatEuro(entries[0].value)} to ${formatEuro(entries[entries.length - 1].value)}`);
}

function setProfitText(element, value) {
    if (!element) {
        return;
    }

    element.textContent = formatEuro(value);
    element.className = Number(value || 0) >= 0 ? "profit" : "loss";
}

function setCoinResult(element, symbol, profitLoss, noResultText = "No change yet", emptyText = "No assets yet", assetCount = 0) {
    if (!element) return;

    const result = Number(profitLoss || 0);
    if (!symbol || symbol === "-" || !Number.isFinite(result) || result === 0) {
        element.textContent = Number(assetCount) > 0 ? noResultText : emptyText;
        element.className = "";
        return;
    }

    element.textContent = `${symbol} ${formatEuro(result)}`;
    element.className = result > 0 ? "profit" : "loss";
}


// ==================================================
// BLOCK 10 — ADD TRANSACTION FORM / ФОРМА ДОБАВЛЕНИЯ СДЕЛКИ
// BUY/SELL, quantity, price, preview и отправка сделки.
// ==================================================

function setTransactionType(type) {
    const isBuy = type === "BUY";
    const isSell = type === "SELL";

    if (dom.transactionTypeInput) dom.transactionTypeInput.value = type;
    dom.buyTypeBtn?.classList.toggle("active", isBuy);
    dom.sellTypeBtn?.classList.toggle("active", isSell);
    dom.addCryptoForm?.classList.toggle("buy-mode", isBuy);
    dom.addCryptoForm?.classList.toggle("sell-mode", isSell);

    if (dom.addTransactionBtn) {
        dom.addTransactionBtn.textContent = isBuy ? "Add Buy Transaction" : "Add Sell Transaction";
    }
}

function getSelectedCryptoOption() {
    return dom.cryptoSelect?.options[dom.cryptoSelect.selectedIndex] || null;
}

function getSelectedCryptoPrice() {
    const selectedOption = getSelectedCryptoOption();
    return selectedOption?.value ? Number(selectedOption.dataset.price || 0) : 0;
}

function getSelectedCryptoSymbol() {
    const selectedOption = getSelectedCryptoOption();
    return selectedOption?.value ? selectedOption.dataset.symbol || "" : "";
}

function updateSelectedCryptoPriceInfo() {
    if (!dom.selectedCryptoPrice) {
        return;
    }

    const selectedOption = getSelectedCryptoOption();

    if (!selectedOption?.value) {
        dom.selectedCryptoPrice.textContent = "Select a coin";
        return;
    }

    const price = getSelectedCryptoPrice();
    const symbol = getSelectedCryptoSymbol();

    dom.selectedCryptoPrice.textContent = price > 0
        ? `${formatEuro(price)} / 1 ${symbol}`
        : "Price not loaded";
}

function updateTransactionPreview() {
    if (!dom.transactionPreviewValue) {
        return;
    }

    const quantity = Number(dom.quantityInput?.value || 0);
    const price = Number(dom.priceInput?.value || 0);

    dom.transactionPreviewValue.textContent = formatEuro(quantity * price);
}

async function submitTransaction(event) {
    event.preventDefault();

    const transactionType = dom.transactionTypeInput?.value || "BUY";
    const cryptoCurrencyId = Number(dom.cryptoSelect?.value || 0);
    const quantity = Number(dom.quantityInput?.value || 0);
    const price = Number(dom.priceInput?.value || 0);

    if (!["BUY", "SELL"].includes(transactionType)) {
        showMessage("Please choose transaction type correctly", "error");
        return;
    }

    if (!cryptoCurrencyId || quantity <= 0 || price <= 0) {
        showMessage("Please choose crypto, quantity and price correctly", "error");
        return;
    }

    try {
        setButtonLoading(dom.addTransactionBtn, true, "Saving...", "Add Transaction");

        const endpoint = transactionType === "BUY" ? "/transactions/buy" : "/transactions/sell";

        await apiSend(endpoint, "POST", { cryptoCurrencyId, quantity, price });
        showMessage(
            transactionType === "BUY" ? "Buy transaction added successfully" : "Sell transaction added successfully",
            "success"
        );

        dom.addCryptoForm?.reset();
        setTransactionType("BUY");
        updateCustomCryptoDropdown();
        updateSelectedCryptoPriceInfo();
        updateTransactionPreview();
        await reloadDashboardData({ includeTransactions: true });
    } catch (error) {
        showMessage(error.message || "Could not add transaction", "error");
        console.error(error);
    } finally {
        const currentType = dom.transactionTypeInput?.value || "BUY";
        setButtonLoading(
            dom.addTransactionBtn,
            false,
            "Saving...",
            currentType === "BUY" ? "Add Buy Transaction" : "Add Sell Transaction"
        );
    }
}


// ==================================================
// BLOCK 11 — CRYPTO DROPDOWN / ВЫБОР КРИПТЫ
// Синхронизация красивого dropdown с настоящим select.
// ==================================================

function getCryptoOptionClass(symbol) {
    return symbol ? symbol.toLowerCase() : "";
}

function updateCustomCryptoDropdown() {
    if (!dom.cryptoSelect || !dom.cryptoDropdownTitle || !dom.cryptoDropdownSubtitle) {
        return;
    }

    const selectedOption = getSelectedCryptoOption();

    if (!selectedOption?.value) {
        dom.cryptoDropdownTitle.textContent = "Choose crypto";
        dom.cryptoDropdownSubtitle.textContent = "Select coin for this transaction";

        if (dom.cryptoDropdownIcon) {
            dom.cryptoDropdownIcon.textContent = "?";
            dom.cryptoDropdownIcon.className = "crypto-dropdown-icon";
        }

        dom.cryptoDropdownOptions.forEach((option) => option.classList.remove("active"));
        return;
    }

    const symbol = selectedOption.dataset.symbol || "";
    const name = selectedOption.dataset.name || selectedOption.textContent;

    dom.cryptoDropdownTitle.textContent = `${symbol} - ${name}`;
    dom.cryptoDropdownSubtitle.textContent = "Selected cryptocurrency";

    if (dom.cryptoDropdownIcon) {
        dom.cryptoDropdownIcon.textContent = symbol;
        dom.cryptoDropdownIcon.className = `crypto-dropdown-icon ${getCryptoOptionClass(symbol)}`;
    }

    dom.cryptoDropdownOptions.forEach((option) => {
        option.classList.toggle("active", option.dataset.value === selectedOption.value);
    });
}

function selectCryptoFromCustomDropdown(value) {
    if (!dom.cryptoSelect) {
        return;
    }

    dom.cryptoSelect.value = value;
    dom.cryptoSelect.dispatchEvent(new Event("change", { bubbles: true }));
    dom.cryptoDropdown?.classList.remove("open");
}


// ==================================================
// BLOCK 12 — TRANSACTIONS PREVIEW / ПОСЛЕДНИЕ ТРАНЗАКЦИИ
// Показывает последние 4 операции на dashboard.html.
// ==================================================

async function loadTransactions() {
    if (!dom.transactionsList) {
        return;
    }

    try {
        const transactions = await apiGet("/transactions") || [];
        const latestFour = transactions
            .sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate))
            .slice(0, 4);

        renderTransactions(latestFour);
    } catch (error) {
        dom.transactionsList.innerHTML = `<p class="empty-portfolio">Server error while loading transactions.</p>`;
        console.error(error);
    }
}

function renderTransactions(transactions) {
    if (!dom.transactionsList) {
        return;
    }

    if (!transactions.length) {
        dom.transactionsList.innerHTML = `<p class="empty-portfolio">No transactions yet.</p>`;
        return;
    }

    dom.transactionsList.innerHTML = transactions.map((transaction) => {
        const typeClass = transaction.type === "BUY" ? "transaction-buy" : "transaction-sell";

        return `
            <div class="transaction-item">
                <div class="transaction-left">
                    <div class="transaction-type ${typeClass}">${escapeHtml(transaction.type)}</div>
                    <div>
                        <div class="transaction-main">${escapeHtml(transaction.cryptoSymbol)} · ${escapeHtml(transaction.cryptoName)}</div>
                        <div class="transaction-date">${formatDateTime(transaction.transactionDate)}</div>
                    </div>
                </div>

                <div class="transaction-right">
                    <div class="transaction-quantity">${formatNumber(transaction.quantity)} ${escapeHtml(transaction.cryptoSymbol)}</div>
                    <div class="transaction-price">${formatEuro(transaction.price)} per coin</div>
                    <div class="transaction-total">${formatEuro(transaction.totalValue)}</div>
                </div>
            </div>
        `;
    }).join("");
}


// ==================================================
// BLOCK 13 — ALLOCATION / РАСПРЕДЕЛЕНИЕ ПОРТФЕЛЯ
// Полосы процентов по каждой криптовалюте.
// ==================================================

function renderAllocationChart(portfolio) {
    if (!dom.allocationChart) return;

    const entries = portfolio.map((item) => ({
        symbol: item.symbol,
        name: item.name,
        share: Math.max(0, Number(item.allocationPercentage) || 0)
    })).filter((item) => Number.isFinite(item.share) && item.share > 0);

    if (!entries.length) {
        dom.allocationChart.innerHTML = '<p class="empty-portfolio">No allocation data yet.</p>';
        return;
    }

    // Normalize the portfolio shares to make sure the ring always totals 100%.
    const total = entries.reduce((sum, item) => sum + item.share, 0);
    const colors = ['#ffb04e', '#657aff', '#30d9d0', '#b18aff', '#ff708b', '#8dd9ff'];
    let cursor = 0;
    const segments = entries.map((item, index) => {
        const start = cursor;
        cursor += item.share / total * 100;
        return `${colors[index % colors.length]} ${start.toFixed(4)}% ${cursor.toFixed(4)}%`;
    });

    const chart = `<div class="allocation-visual">
        <div class="allocation-donut" role="img"
             aria-label="Portfolio distribution by asset"
             style="background: conic-gradient(${segments.join(', ')})">
            <div class="allocation-donut-center"><strong>${entries.length}</strong><span>Assets</span></div>
        </div>
    </div>`;

    const legend = entries.map((item, index) => {
        const percent = Math.min(100, item.share / total * 100);
        return `<div class="allocation-row">
            <div class="allocation-info">
                <span class="coin-symbol" style="--allocation-color:${colors[index % colors.length]}">${escapeHtml(item.symbol)}</span>
                <span class="allocation-name">${escapeHtml(item.name)}</span>
                <span class="allocation-percent">${formatPercent(percent)}%</span>
            </div>
            <div class="allocation-track">
                <div class="allocation-fill" style="width:${percent.toFixed(4)}%;--allocation-color:${colors[index % colors.length]}"></div>
            </div>
        </div>`;
    }).join('');

    dom.allocationChart.innerHTML = chart + '<div class="allocation-legend">' + legend + '</div>';
}

// ==================================================
// BLOCK 14 — PORTFOLIO FILTERS / ФИЛЬТРЫ ПОРТФЕЛЯ
// Поиск, сортировка и красивый dropdown Sort by.
// ==================================================

const sortMeta = {
    "value-desc": ["Biggest assets first", "€↓"],
    "value-asc": ["Smallest assets first", "€↑"],
    "profit-desc": ["Best profit first", "+↓"],
    "profit-asc": ["Worst result first", "-↑"],
    "allocation-desc": ["Largest share first", "%↓"],
    "allocation-asc": ["Smallest share first", "%↑"],
    "name-asc": ["Alphabetical order", "A"],
    "name-desc": ["Reverse alphabetical order", "Z"]
};

const sortMethods = {
    "value-asc": (a, b) => a.currentValue - b.currentValue,
    "value-desc": (a, b) => b.currentValue - a.currentValue,
    "profit-asc": (a, b) => a.profitLoss - b.profitLoss,
    "profit-desc": (a, b) => b.profitLoss - a.profitLoss,
    "allocation-asc": (a, b) => a.allocationPercentage - b.allocationPercentage,
    "allocation-desc": (a, b) => b.allocationPercentage - a.allocationPercentage,
    "name-asc": (a, b) => String(a.name || "").localeCompare(String(b.name || "")),
    "name-desc": (a, b) => String(b.name || "").localeCompare(String(a.name || ""))
};

function getVisiblePortfolio(items) {
    const searchValue = dom.searchPortfolio?.value.trim().toLowerCase() || "";
    const sortValue = dom.sortPortfolio?.value || "value-desc";

    const filtered = searchValue
        ? items.filter((item) => `${item.symbol || ""} ${item.name || ""}`.toLowerCase().includes(searchValue))
        : [...items];

    return filtered.sort(sortMethods[sortValue] || sortMethods["value-desc"]);
}

function updateCustomSortDropdown() {
    if (!dom.sortPortfolio || !dom.sortDropdownTitle || !dom.sortDropdownSubtitle) {
        return;
    }

    const selectedOption = dom.sortPortfolio.options[dom.sortPortfolio.selectedIndex];
    const value = selectedOption?.value || "value-desc";
    const [subtitle, icon] = sortMeta[value] || ["Sort portfolio assets", "↕"];

    dom.sortDropdownTitle.textContent = selectedOption?.textContent || "Sort by";
    dom.sortDropdownSubtitle.textContent = subtitle;

    if (dom.sortDropdownIcon) {
        dom.sortDropdownIcon.textContent = icon;
    }

    dom.sortDropdownOptions.forEach((option) => {
        option.classList.toggle("active", option.dataset.value === value);
    });
}

function selectSortFromCustomDropdown(value) {
    if (!dom.sortPortfolio) {
        return;
    }

    dom.sortPortfolio.value = value;
    dom.sortPortfolio.dispatchEvent(new Event("change", { bubbles: true }));
    dom.sortDropdown?.classList.remove("open");
}


// ==================================================
// BLOCK 15 — PORTFOLIO LIST / СПИСОК КУПЛЕННЫХ МОНЕТ
// Рендерит список портфеля, empty-state, Edit и Delete.
// ==================================================

async function loadPortfolio() {
    if (!dom.portfolioList) {
        return;
    }

    try {
        state.portfolio = await apiGet("/portfolio/my") || [];
        renderAllocationChart(state.portfolio);
        renderPortfolioList();
    } catch (error) {
        dom.portfolioList.textContent = "Server error";
        console.error(error);
    }
}

function renderPortfolioList() {
    if (!dom.portfolioList) {
        return;
    }

    if (!state.portfolio.length) {
        dom.portfolioList.innerHTML = `<p class="empty-portfolio">No crypto assets yet.</p>`;
        if (dom.portfolioStatus) dom.portfolioStatus.textContent = "Showing 0 of 0 assets";
        return;
    }

    const visiblePortfolio = getVisiblePortfolio(state.portfolio);

    if (dom.portfolioStatus) {
        dom.portfolioStatus.textContent = `Showing ${visiblePortfolio.length} of ${state.portfolio.length} assets`;
    }

    if (!visiblePortfolio.length) {
        dom.portfolioList.innerHTML = `
            <div class="portfolio-empty-search">
                <div class="portfolio-empty-icon">⌕</div>
                <div class="portfolio-empty-content">
                    <h3>No matching crypto found</h3>
                    <p>Nothing matches your search. Try another coin name or symbol.</p>
                </div>
            </div>
        `;
        return;
    }

    dom.portfolioList.innerHTML = visiblePortfolio.map((item) => `
        <div class="portfolio-item">
            <span class="coin-symbol" data-label="Symbol">${escapeHtml(item.symbol)}</span>
            <span data-label="Name">${escapeHtml(item.name)}</span>
            <span data-label="Quantity">${formatNumber(item.quantity)}</span>
            <span data-label="Buy price">${formatEuro(item.averageBuyPrice)}</span>
            <span data-label="Current price">${formatEuro(item.currentPrice)}</span>
            <span data-label="Value">${formatEuro(item.currentValue)}</span>
            <span data-label="Profit / Loss" class="${item.profitLoss >= 0 ? "profit" : "loss"}">${formatEuro(item.profitLoss)}</span>
            <span data-label="Allocation" class="allocation-badge">${formatPercent(item.allocationPercentage)}%</span>
            <div class="action-buttons" aria-label="Asset actions">
                <button class="edit-btn" data-action="edit" data-id="${item.id}">Edit</button>
                <button class="delete-btn" data-action="delete" data-id="${item.id}">Delete</button>
            </div>
        </div>
    `).join("");
}

function getPortfolioItemById(itemId) {
    return state.portfolio.find((item) => String(item.id) === String(itemId));
}


// ==================================================
// BLOCK 16 — EDIT PORTFOLIO ITEM / РЕДАКТИРОВАНИЕ МОНЕТЫ
// Карточка редактирования количества и средней цены покупки.
// ==================================================

function showEditForm(item) {
    if (!dom.portfolioList) {
        return;
    }

    const safeSymbol = escapeHtml(item.symbol);
    const safeName = escapeHtml(item.name);

    dom.portfolioList.innerHTML = `
        <div class="edit-card">
            <div class="edit-card-header">
                <div class="edit-card-title-wrap">
                    <span class="edit-coin-badge">${safeSymbol}</span>
                    <div>
                        <h3>Edit ${safeName}</h3>
                        <p>Update your asset quantity and average buy price</p>
                    </div>
                </div>
                <button data-action="cancel-edit" type="button" class="edit-close-btn">✕</button>
            </div>

            <div class="edit-card-info">
                <div class="edit-info-box">
                    <span>Current Quantity</span>
                    <strong>${formatNumber(item.quantity)} ${safeSymbol}</strong>
                </div>
                <div class="edit-info-box">
                    <span>Current Avg Buy Price</span>
                    <strong>${formatEuro(item.averageBuyPrice)}</strong>
                </div>
                <div class="edit-info-box">
                    <span>Current Market Price</span>
                    <strong>${formatEuro(item.currentPrice)}</strong>
                </div>
            </div>

            <div class="edit-form-grid">
                <div class="edit-field">
                    <label for="editQuantity">Quantity</label>
                    <input type="number" id="editQuantity" value="${item.quantity}" step="any" min="0" placeholder="Enter quantity">
                    <small>Enter how many ${safeSymbol} you currently hold</small>
                </div>

                <div class="edit-field">
                    <label for="editAverageBuyPrice">Average Buy Price</label>
                    <input type="number" id="editAverageBuyPrice" value="${item.averageBuyPrice}" step="any" min="0" placeholder="Enter average buy price">
                    <small>Average price you paid per coin</small>
                </div>
            </div>

            <div class="edit-actions">
                <button data-action="save-edit" data-id="${item.id}" class="edit-save-btn" type="button">Save Changes</button>
                <button data-action="cancel-edit" class="edit-cancel-btn" type="button">Cancel</button>
            </div>

            <p id="editMessage" class="edit-message"></p>
        </div>
    `;
}

function showEditMessage(text, type = "error") {
    const editMessage = $("#editMessage");

    if (editMessage) {
        editMessage.textContent = text;
        editMessage.className = `edit-message ${type}`;
    }
}

async function updatePortfolioItem(itemId) {
    const quantity = Number($("#editQuantity")?.value || 0);
    const averageBuyPrice = Number($("#editAverageBuyPrice")?.value || 0);

    if (quantity <= 0 || averageBuyPrice <= 0) {
        showEditMessage("Quantity and price must be greater than 0");
        return;
    }

    try {
        await apiSend(`/portfolio/items/${itemId}`, "PUT", { quantity, averageBuyPrice });
        showEditMessage("Crypto updated successfully", "success");
        await reloadDashboardData();
    } catch (error) {
        showEditMessage(error.message || "Could not update crypto");
        console.error(error);
    }
}


// ==================================================
// BLOCK 16.1 — DELETE CONFIRM MODAL / ПОДТВЕРЖДЕНИЕ УДАЛЕНИЯ
// Открывает окно подтверждения перед реальным удалением монеты.
// ==================================================

function openDeleteModal(itemId) {
    const item = getPortfolioItemById(itemId);

    if (!item || !dom.deleteModal) {
        return;
    }

    state.itemToDelete = item;

    if (dom.deleteModalText) {
        dom.deleteModalText.textContent = `Are you sure you want to delete ${item.symbol}?`;
    }

    dom.deleteModal.classList.remove("hidden");
}

function closeDeleteModal() {
    state.itemToDelete = null;
    dom.deleteModal?.classList.add("hidden");
}

async function confirmDeletePortfolioItem() {
    if (!state.itemToDelete) {
        return;
    }

    const itemId = state.itemToDelete.id;
    closeDeleteModal();

    await deletePortfolioItem(itemId);
}

async function deletePortfolioItem(itemId) {
    try {
        await apiSend(`/portfolio/items/${itemId}`, "DELETE");
        showMessage("Crypto deleted successfully", "success");
        await reloadDashboardData({ includeTransactions: true });
    } catch (error) {
        showMessage(error.message || "Could not delete crypto", "error");
        console.error(error);
    }
}


// ==================================================
// BLOCK 17 — DASHBOARD RELOAD / ПЕРЕЗАГРУЗКА ДАННЫХ
// Одна функция для обновления связанных блоков после действий.
// ==================================================

async function reloadDashboardData({ includeCrypto = false, includeTransactions = false } = {}) {
    const jobs = [
        loadSummary(),
        loadPortfolio()
    ];

    if (includeCrypto) {
        jobs.push(loadCryptoList());
    }

    if (includeTransactions) {
        jobs.push(loadTransactions());
    }

    const results = await Promise.allSettled(jobs);

    results.forEach((result) => {
        if (result.status === "rejected") {
            console.error("Dashboard reload error:", result.reason);
        }
    });
}


// ==================================================
// BLOCK 18 — EVENT LISTENERS / ОБРАБОТЧИКИ СОБЫТИЙ
// Клики, input/change, dropdown, Edit/Delete и Logout.
// ==================================================

function setupEventListeners() {
    dom.buyTypeBtn?.addEventListener("click", () => setTransactionType("BUY"));
    dom.sellTypeBtn?.addEventListener("click", () => setTransactionType("SELL"));
    dom.addCryptoForm?.addEventListener("submit", submitTransaction);
    dom.quantityInput?.addEventListener("input", updateTransactionPreview);
    dom.priceInput?.addEventListener("input", updateTransactionPreview);
    dom.searchPortfolio?.addEventListener("input", renderPortfolioList);
    dom.sortPortfolio?.addEventListener("change", () => {
        updateCustomSortDropdown();
        renderPortfolioList();
    });
    dom.refreshPricesBtn?.addEventListener("click", () => refreshPrices());
    dom.logoutBtn?.addEventListener("click", logoutUser);
    dom.cancelDeleteBtn?.addEventListener("click", closeDeleteModal);
    dom.confirmDeleteBtn?.addEventListener("click", confirmDeletePortfolioItem);

    dom.cryptoSelect?.addEventListener("change", handleCryptoSelectChange);
    dom.cryptoDropdownToggle?.addEventListener("click", (event) => toggleDropdown(event, dom.cryptoDropdown));
    dom.sortDropdownToggle?.addEventListener("click", (event) => toggleDropdown(event, dom.sortDropdown));

    dom.cryptoDropdownOptions.forEach((option) => {
        option.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            selectCryptoFromCustomDropdown(option.dataset.value);
        });
    });

    dom.sortDropdownOptions.forEach((option) => {
        option.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            selectSortFromCustomDropdown(option.dataset.value);
        });
    });

    dom.portfolioList?.addEventListener("click", handlePortfolioClick);
    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("keydown", handleEscapeKey);
}

function handleCryptoSelectChange() {
    updateSelectedCryptoPriceInfo();
    updateCustomCryptoDropdown();

    const currentPrice = getSelectedCryptoPrice();

    if (dom.priceInput) {
        dom.priceInput.value = currentPrice > 0 ? currentPrice : "";
    }

    updateTransactionPreview();
}

function toggleDropdown(event, dropdown) {
    event.preventDefault();
    event.stopPropagation();

    const isOpen = dropdown?.classList.contains("open");

    closeDropdowns();

    if (!isOpen) {
        dropdown?.classList.add("open");
    }
}

async function handlePortfolioClick(event) {
    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const action = button.dataset.action;
    const itemId = button.dataset.id;

    if (action === "edit") {
        const item = getPortfolioItemById(itemId);
        if (item) showEditForm(item);
    }

    if (action === "delete") {
        openDeleteModal(itemId);
    }

    if (action === "save-edit") {
        await updatePortfolioItem(itemId);
    }

    if (action === "cancel-edit") {
        renderPortfolioList();
    }
}

function handleOutsideClick(event) {
    if (dom.cryptoDropdown && !dom.cryptoDropdown.contains(event.target)) {
        dom.cryptoDropdown.classList.remove("open");
    }

    if (dom.sortDropdown && !dom.sortDropdown.contains(event.target)) {
        dom.sortDropdown.classList.remove("open");
    }

    if (event.target === dom.deleteModal) {
        closeDeleteModal();
    }
}

function handleEscapeKey(event) {
    if (event.key === "Escape") {
        closeDropdowns();
        closeDeleteModal();
    }
}


// ==================================================
// BLOCK 19 — PAGE INITIALIZATION / ЗАПУСК СТРАНИЦЫ
// Главная последовательность загрузки dashboard.html.
// ==================================================

async function initDashboard() {
    try {
        setupEventListeners();
        setTransactionType("BUY");
        updateCustomCryptoDropdown();
        updateCustomSortDropdown();
        updateTransactionPreview();

        await loadCurrentUser();
        await autoRefreshPricesIfNeeded();

        // Crypto prices are already loaded inside autoRefreshPricesIfNeeded().
        // Here we update only the remaining dashboard blocks.
        await reloadDashboardData({ includeTransactions: true });
    } catch (error) {
        console.error("Dashboard initialization failed:", error);
        showMessage("Dashboard could not be fully loaded. Please refresh the page.", "error");
    }
}

initDashboard();
