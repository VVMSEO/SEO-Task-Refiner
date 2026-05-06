# SEO Task Refiner

Приложение для превращения сырых пунктов чеклиста в конкретные SEO-задачи. Спроектировано для SEO-фрилансеров.

![Скриншот интерфейса](./public/favicon.svg) <!-- Замените на реальный скриншот после развертывания -->

## Установка локально

1. Клонируйте репозиторий.
2. Установите зависимости в корне проекта:
   \`\`\`bash
   npm install
   \`\`\`
   И в папке с функциями:
   \`\`\`bash
   cd functions && npm install
   \`\`\`
3. Скопируйте \`.env.example\` в \`.env\` и укажите ваши публичные Firebase ключи:
   \`\`\`bash
   cp .env.example .env
   \`\`\`
4. Запустите проект в режиме разработки:
   \`\`\`bash
   npm run dev
   \`\`\`

## Шаги деплоя в production

1. Создайте Firebase-проект, затем включите Authentication (провайдер Google) и Firestore Database.
2. Установите Firebase CLI, авторизуйтесь и инициализируйте проект:
   \`\`\`bash
   npm install -g firebase-tools
   firebase login
   firebase init functions firestore
   \`\`\`
3. Сохраните секретный API-ключ к RouterAI (чтобы он никогда не попал на клиент):
   \`\`\`bash
   firebase functions:secrets:set ROUTERAI_KEY
   \`\`\`
   *(Вас попросят вставить ключ в консоль)*
4. Откройте файл \`functions/src/index.ts\` и укажите ваши email-адреса в переменной \`ALLOWED_EMAILS\`:
   \`\`\`typescript
   const ALLOWED_EMAILS = ['ВАШ_EMAIL@gmail.com'];
   \`\`\`
5. Задеплойте Cloud Functions и правила Firestore:
   \`\`\`bash
   firebase deploy --only functions,firestore:rules
   \`\`\`
6. Перейдите в настройки репозитория на GitHub: **Settings → Pages → Source: GitHub Actions**.
7. В **Settings → Secrets and variables → Actions** добавьте следующие секреты:
   - \`VITE_FIREBASE_API_KEY\`
   - \`VITE_FIREBASE_AUTH_DOMAIN\`
   - \`VITE_FIREBASE_PROJECT_ID\`
   - \`VITE_FIREBASE_STORAGE_BUCKET\`
   - \`VITE_FIREBASE_MESSAGING_SENDER_ID\`
   - \`VITE_FIREBASE_APP_ID\`
8. В файле \`vite.config.ts\` убедитесь, что параметр \`base: '/имя-репозитория/'\` совпадает с URL-ом вашего репозитория.
9. Сделайте \`git push\` в ветку \`main\` — деплой на GitHub Pages запустится автоматически.

## Безопасность и архитектура

**Почему мы не делаем запросы к RouterAI напрямую из браузера?**
Это Single Page Application (SPA), и оно разворачивается статически на GitHub Pages. Если бы мы захардкодили API-ключ \`ROUTERAI_KEY\` в исходниках \`React\`, после сборки он оказался бы доступным любому пользователю, открывшему DevTools. \`Cloud Function\` выступает как секьюрный прокси-сервер — хранит ключ в секретном хранилище Google Cloud (Firebase Secrets) и пропускает запросы от приложения проверяя ваш \`email\` по \`allowlist\`, чтобы никто не тратил ваши токены на нейросети.
