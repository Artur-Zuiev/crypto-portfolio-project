# CSS structure — Crypto Portfolio

Я разделил CSS по смысловым блокам сайта.

## Главный файл

`css/style.css` работает как карта проекта: он только подключает CSS-блоки через `@import`.

## Где что менять

- `css/core/00-base.css` — переменные, фон, body, reset, cursor, number input.
- `css/core/01-forms.css` — общие input/select/form-label/message.
- `css/core/02-buttons.css` — базовые кнопки.

- `css/blocks/01-dashboard-layout.css` — общий layout Dashboard/Transactions, container, отступы.
- `css/blocks/02-navigation.css` — верхняя навигация, logo, active link, Refresh, Logout.
- `css/blocks/03-user-profile-card.css` — карточка пользователя: username, email, last price update.
- `css/blocks/04-summary-cards.css` — карточки Total Value, Profit/Loss, Assets и т.д.
- `css/blocks/05-add-transaction-form.css` — Add Transaction, BUY/SELL, quantity, price, preview, submit.
- `css/blocks/06-crypto-dropdown.css` — кастомный выбор крипты BTC/ETH/SOL/ADA/BNB.
- `css/blocks/07-transactions.css` — список транзакций и кнопки View all / Back.
- `css/blocks/08-allocation.css` — Portfolio Share и progress bars.
- `css/blocks/09-portfolio-list.css` — список купленных монет, строки, edit/delete, empty search.
- `css/blocks/10-portfolio-filters-sort.css` — Search и Sort by.
- `css/blocks/11-edit-card.css` — карточка редактирования монеты.
- `css/blocks/12-delete-modal.css` — модальное окно подтверждения удаления.
- `css/blocks/13-auth-pages.css` — login/register.
- `css/blocks/99-responsive.css` — общая адаптация.

- `css/scene.css` — отдельный файл для 3D Dashboard. Он не смешан с Dashboard CSS.

## Правильный порядок подключения в `style.css`

```css
@import url("./core/00-base.css");
@import url("./core/01-forms.css");
@import url("./core/02-buttons.css");

@import url("./blocks/01-dashboard-layout.css");
@import url("./blocks/02-navigation.css");
@import url("./blocks/03-user-profile-card.css");
@import url("./blocks/04-summary-cards.css");
@import url("./blocks/05-add-transaction-form.css");
@import url("./blocks/06-crypto-dropdown.css");
@import url("./blocks/07-transactions.css");
@import url("./blocks/08-allocation.css");
@import url("./blocks/09-portfolio-list.css");
@import url("./blocks/10-portfolio-filters-sort.css");
@import url("./blocks/11-edit-card.css");
@import url("./blocks/12-delete-modal.css");
@import url("./blocks/13-auth-pages.css");

@import url("./blocks/99-responsive.css");