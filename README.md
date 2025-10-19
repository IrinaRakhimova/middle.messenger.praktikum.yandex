# Messenger App — Sprint 3

Проектная работа в рамках 3-го спринта курса «Мидл фронтенд-разработчик» от Яндекс.Практикума.

## 🔗 Демо

Проект задеплоен на Netlify:\
[**https://your-netlify-site.netlify.app**](https://chat-yandex-irina.netlify.app)

---

## 📄 Ссылки на страницы

- [Авторизация](https://chat-yandex-irina.netlify.app/login)
- [Регистрация](https://chat-yandex-irina.netlify.app/register)
- [Профиль](https://chat-yandex-irina.netlify.app/profile)
- [Чаты](https://chat-yandex-irina.netlify.app/chats)
- [404](https://chat-yandex-irina.netlify.app/404)
- [500](https://chat-yandex-irina.netlify.app/500)

---

## 🖼️ Прототип

[Ссылка на Figma макет](https://www.figma.com/design/jF5fFFzgGOxQeB4CmKWTiE/Chat_external_link?node-id=0-1&p=f&t=Ofk6Q5THxqVFHQTq-0)

---

## ⚙️ Технологии

- Vite
- TypeScript
- PostCSS
- Handlebars
- HTML / CSS
- JavaScript (ESModules)
- XHR (без fetch/axios)
- WebSocket (для real-time сообщений)
- Netlify
- ESLint + Stylelint + EditorConfig

---

## 🔹 Страницы

### 📅 Логин
- login, password
- Авторизация пользователя
- Проверка авторизации и редирект неавторизованных пользователей на страницу логина

### 📅 Регистрация
- first_name, second_name, login, email, password, phone
- После успешной регистрации — переход на страницу чатов
- Используются только тестовые данные

### 💬 Чаты
- Список чатов пользователя
- Создание нового чата
- Добавление и удаление пользователей из чата
- Работа с real-time сообщениями через WebSocket

### 👤 Профиль
- first_name, second_name, display_name, login, email, phone, avatar, oldPassword, newPassword
- Возможность изменять данные пользователя, аватар и пароль

### 🌐 Роутинг
- `/` — главная страница 
- `/chats` — чат 
- `/register` — страница регистрации
- `/login` — страница входа
- `/profile` — настройки профиля 
- `/profile-edit` — редактирование профиля
- `/password-edit` — редактирование пароля
- `/500` — ошибка сервера
- `/404` — страница не найдена  
- Поддержка навигации «Назад» и «Вперёд»  
- Поддержка переходов по кнопкам в интерфейсе  
- При обновлении страницы URL сохраняет текущую страницу  

---

## 🚀 Команды

```bash
npm install       # Установка зависимостей
npm run dev       # Режим разработки (localhost:3000)
npm run build     # Сборка проекта в dist/
npm run start     # Предпросмотр собранного проекта

npm run lint       # ESLint
npm run lint:css   # Stylelint
npm run type-check # Проверка типов (tsc --noEmit)
npm run check      # Линт + проверка типов
```

