# Project Structure / Структура проекта

# Crypto Portfolio — Frontend Architecture

Я привёл HTML, CSS и JavaScript к одному принципу:

**Блоки идут сверху вниз так же, как части сайта идут на странице.**

---

# 1. Frontend Pages / Страницы фронтенда

```text
dashboard.html
login.html
register.html
transactions.html
scene.html
```

## Назначение страниц

### dashboard.html

Главная страница портфеля:

- профиль пользователя
- summary cards
- add transaction
- portfolio share
- portfolio list
- search/sort
- edit/delete crypto

---

### transactions.html

Полная история транзакций:

- фильтры
- сортировка
- search
- все buy/sell операции

---

### login.html

Вход пользователя.

---

### register.html

Регистрация пользователя.

---

### scene.html

3D Dashboard на Three.js.

---

# 2. HTML Structure / Структура HTML

Во всех HTML используются одинаковые комментарии блоков:

```html
<!-- ================================================== -->
<!-- BLOCK 01 — DOCUMENT SETTINGS / НАСТРОЙКИ ДОКУМЕНТА -->
<!-- ================================================== -->
```

Это помогает быстро понимать структуру страницы.

## Пример структуры dashboard.html

```text
BLOCK 01 — DOCUMENT SETTINGS
BLOCK 02 — HEADER / NAVIGATION
BLOCK 03 — USER PROFILE
BLOCK 04 — SUMMARY CARDS
BLOCK 05 — ADD TRANSACTION FORM
BLOCK 06 — TRANSACTIONS PREVIEW
BLOCK 07 — PORTFOLIO SHARE
BLOCK 08 — MY PORTFOLIO
BLOCK 09 — DELETE CONFIRM MODAL
```

---

# 3. CSS Architecture / Архитектура CSS

## Главный CSS-файл

```text
css/style.css
```

Он работает как карта проекта и только подключает остальные CSS-файлы.

Стили напрямую в `style.css` лучше не писать.

---

# 4. CSS Folder Structure / Структура CSS

## CORE

```text
css/core/00-base.css
```

Основа проекта:

- CSS variables
- background
- body
- reset
- cursor
- scrollbar
- number input reset

---

```text
css/core/01-forms.css
```

Общие формы:

- input
- select
- textarea
- labels
- helper text
- form messages

---

```text
css/core/02-buttons.css
```

Общие кнопки:

- button reset
- hover
- transitions
- common button styles

---

# 5. CSS Blocks / Блоки CSS

```text
css/blocks/01-dashboard-layout.css
```

Главная структура Dashboard и Transactions:

- page layout
- container
- spacing
- sections

---

```text
css/blocks/02-navigation.css
```

Навигация:

- header
- nav
- logo
- active links
- refresh button
- logout button

---

```text
css/blocks/03-user-profile-card.css
```

Карточка пользователя:

- avatar
- username
- email
- last price update

---

```text
css/blocks/04-summary-cards.css
```

Summary cards:

- Total Value
- Total Invested
- Profit/Loss
- Assets
- Best/Worst Coin

---

```text
css/blocks/05-add-transaction-form.css
```

Add Transaction:

- BUY / SELL
- quantity
- price
- preview
- submit button

---

```text
css/blocks/06-crypto-dropdown.css
```

Кастомный dropdown криптовалют:

- BTC
- ETH
- SOL
- ADA
- BNB

---

```text
css/blocks/07-transactions.css
```

Transactions:

- latest transactions
- transactions list
- View all
- Back button

---

```text
css/blocks/08-allocation.css
```

Portfolio Share:

- allocation rows
- progress bars
- percentages

---

```text
css/blocks/09-portfolio-list.css
```

Portfolio list:

- portfolio rows
- edit/delete buttons
- allocation badge
- empty state
- empty search

---

```text
css/blocks/10-portfolio-filters-sort.css
```

Portfolio controls:

- Search
- Sort by
- custom sort dropdown

---

```text
css/blocks/11-edit-card.css
```

Карточка редактирования монеты:

- quantity edit
- average price edit
- save/cancel

---

```text
css/blocks/12-delete-modal.css
```

Модальное окно подтверждения удаления:

- overlay
- modal box
- confirm button
- cancel button

---

```text
css/blocks/13-auth-pages.css
```

Login/Register pages:

- auth card
- auth form
- auth buttons
- auth messages

---

```text
css/blocks/99-responsive.css
```

Responsive design:

- desktop
- laptop
- tablet
- mobile

Должен подключаться последним.

---

# 6. 3D Dashboard CSS

```text
css/scene.css
```

Отдельный CSS для Three.js сцены.

Не смешан с Dashboard CSS.

---

# 7. JavaScript Architecture / Архитектура JavaScript

# js/dashboard.js

Главный frontend файл Dashboard.

## Структура блоков

```text
BLOCK 01 — API SETTINGS
BLOCK 02 — DOM SHORTCUTS
BLOCK 03 — PAGE STATE
BLOCK 04 — API HELPERS
BLOCK 05 — FORMAT HELPERS
BLOCK 06 — UI HELPERS
BLOCK 07 — USER PROFILE
BLOCK 08 — CRYPTO PRICES
BLOCK 09 — SUMMARY CARDS
BLOCK 10 — ADD TRANSACTION FORM
BLOCK 11 — CRYPTO DROPDOWN
BLOCK 12 — TRANSACTIONS PREVIEW
BLOCK 13 — ALLOCATION
BLOCK 14 — PORTFOLIO FILTERS
BLOCK 15 — PORTFOLIO LIST
BLOCK 16 — EDIT PORTFOLIO ITEM
BLOCK 17 — DELETE CONFIRM MODAL
BLOCK 18 — DASHBOARD RELOAD
BLOCK 19 — EVENT LISTENERS
BLOCK 20 — PAGE INITIALIZATION
```

---

# js/auth.js

```text
API SETTINGS
DOM ELEMENTS
UI HELPERS
REGISTER
LOGIN
EVENT LISTENERS
```

---

# js/transactions.js

```text
API SETTINGS
AUTH CHECK
DOM ELEMENTS
FORMAT HELPERS
RENDER
API REQUESTS
EVENTS
INIT
```

---

# js/scene.js

Большой файл Three.js сцены.

Блоки подписаны на английском и русском.

---

# 8. How To Work With Project / Как работать с проектом

## Изменить навигацию

```text
css/blocks/02-navigation.css
```

---

## Изменить карточку пользователя

```text
css/blocks/03-user-profile-card.css
js/dashboard.js → BLOCK 07
```

---

## Изменить summary cards

```text
css/blocks/04-summary-cards.css
js/dashboard.js → BLOCK 09
```

---

## Изменить Add Transaction

```text
css/blocks/05-add-transaction-form.css
js/dashboard.js → BLOCK 10
```

---

## Изменить dropdown крипты

```text
css/blocks/06-crypto-dropdown.css
js/dashboard.js → BLOCK 11
```

---

## Изменить Transactions

```text
css/blocks/07-transactions.css
js/dashboard.js → BLOCK 12
```

---

## Изменить Portfolio Share

```text
css/blocks/08-allocation.css
js/dashboard.js → BLOCK 13
```

---

## Изменить Portfolio List

```text
css/blocks/09-portfolio-list.css
js/dashboard.js → BLOCK 15
```

---

## Изменить Search/Sort

```text
css/blocks/10-portfolio-filters-sort.css
js/dashboard.js → BLOCK 14
```

---

## Изменить Edit Card

```text
css/blocks/11-edit-card.css
js/dashboard.js → BLOCK 16
```

---

## Изменить Delete Modal

```text
css/blocks/12-delete-modal.css
js/dashboard.js → BLOCK 17
```

---

## Изменить Login/Register

```text
css/blocks/13-auth-pages.css
js/auth.js
```

---

## Изменить Responsive

```text
css/blocks/99-responsive.css
```

---

## Изменить 3D Dashboard

```text
css/scene.css
js/scene.js
```

---

# 9. Backup

Старые CSS-файлы и старые версии лежат в:

```text
css/_backup/
```

---

# 10. Main Principle / Главный принцип

Главный принцип проекта:

```text
Один блок сайта = один CSS-блок + один JS-блок.
```

То есть:

- navigation → отдельный CSS
- transactions → отдельный CSS
- dropdown → отдельный CSS
- delete modal → отдельный CSS

Это делает проект:

- чище
- проще
- понятнее
- легче для поддержки
- легче для масштабирования
