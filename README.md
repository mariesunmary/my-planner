# My Planner - Посібник Розробника

Цей документ містить покрокову інструкцію для розробників, які приєднуються до проєкту "My Planner". Проєкт побудований на React (Create React App).

## 🚀 Покрокова інструкція для нового розробника

Якщо ви тільки-но встановили нову ОС і плануєте працювати з цим проєктом, дотримуйтесь наступних кроків.

### 1. Необхідні залежності та програмне забезпечення

Перед початком роботи переконайтеся, що у вас встановлено:
- **[Git](https://git-scm.com/)** — система контролю версій (для клонування репозиторію та управління кодом).
- **[Node.js](https://nodejs.org/uk/) (версія 18.x або новіша) та npm** — середовище виконання JavaScript та менеджер пакетів. Рекомендується використовувати NVM чи NVM-Windows.
- **Редактор коду** — рекомендується **[Visual Studio Code](https://code.visualstudio.com/)** з плагінами для ESLint та Prettier.

### 2. Клонування репозиторію та налаштування середовища розробки

1. Відкрийте термінал і створіть робочу директорію:
   ```bash
   mkdir -p ~/projects
   cd ~/projects
   ```
2. Склонуйте репозиторій проєкту:
   ```bash
   git clone <URL_ВАШОГО_РЕПОЗИТОРІЮ> my-planner
   cd my-planner
   ```

### 3. Встановлення та конфігурація залежностей

У кореневій папці проєкту запустіть команду для встановлення всіх необхідних пакетів (у тому числі React, husky, eslint тощо):

```bash
npm install
```

> **Примітка:** Проєкт використовує Husky для git-хуків. Під час `npm install` автоматично налаштуються необхідні pre-commit перевірки (`husky install`).

### 4. Створення та налаштування бази даних

*Для поточного React-додатка окрема локальна база даних (на кшталт PostgreSQL/MySQL) не потрібна. Додаток працює з browser API (наприклад, localStorage) або підключається до зовнішнього API.*

Якщо у майбутньому з'явиться Backend/API-сервер, тут буде описано процес розгортання локальної БД. Якщо потрібні файли змінних оточення (наприклад, `.env`), скопіюйте їх із шаблону:
```bash
cp .env.example .env
```
*(Скоригуйте значення у `.env` за потреби).*

### 5. Запуск проєкту у режимі розробки

Щоб запустити проєкт для локальної розробки (з гарячим перезавантаженням – Hot-Reloading), виконайте:

```bash
npm start
```
Додаток буде доступний за адресою: [http://localhost:3000](http://localhost:3000)

### 6. Базові команди та операції

Основні скрипти, доступні у проєкті (знаходяться у `package.json`):

- `npm start` — запуск dev-сервера.
- `npm run build` — збірка оптимізованого проєкту для production у папку `build`.
- `npm test` — запуск тестів у режимі watch.
- `npm run lint` — перевірка JS-файлів лінтером (ESLint).
- `npm run lint:fix` — автоматичне виправлення помилок лінтера.
- `npm run type-check` — перевірка типів через TypeScript (checkJs).
- `npm run check-all` — запуск лінтера та перевірки типів.
- `npm run docs` — генерація документації за допомогою JSDoc (відповідно до конфігурації `jsdoc.json`).

---

# Офіційна документація Create React App

Проєкт створено за допомогою [Create React App](https://github.com/facebook/create-react-app).
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Code Documentation Guidelines

In this project, we use **JSDoc** as the standard for documenting our JavaScript and React code. 
All project contributors should follow these guidelines to keep the codebase understandable and maintainable.

### What to Document
- **Key Functions & Utilities**: Any function containing business logic, complex data transformations (e.g., date formatting), or calculations.
- **Custom Hooks**: Explain what state it manages and what it returns.
- **React Components**: Describe the purpose of the component, its behavior, and expected props (if any).

### How to Document
We use standard JSDoc block comments. Start your comment block with `/**` directly above the function or component declaration.

#### Example: Documenting a Function
```javascript
/**
 * Calculates the total sum of items in a shopping cart.
 * 
 * @param {Array<{price: number, quantity: number}>} items - List of cart items.
 * @param {number} [discount=0] - Optional discount percentage to apply (0-100).
 * @returns {number} The final calculated total.
 */
export function calculateTotal(items, discount = 0) {
  // ...
}
```

#### Automatically Generating Documentation
While the primary focus is to keep the code readable for IDE extensions (like VSCode intellisense), you will be able to generate explicit HTML documentation in the future using tools like [JSDoc](https://jsdoc.app/) or [TypeDoc](https://typedoc.org/). Please ensure all your code strictly follows the JSDoc syntax standard.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
