# Kinza Admin v2 — документация

## Общее

- Headless CMS на Strapi v4 для меню/заказов Kinza: товары, ингредиенты, теги, адреса, заказы и уведомления.
- Основные сервисы: Strapi API, n8n для триггеров по заказам, S3‑хранилище (Yandex Cloud) для медиа, Postgres (по умолчанию).
- Язык интерфейса админки — русский (`src/admin/app.tsx`).

## Технологии и зависимости

- Node.js 16–20 (engines в `package.json`), Strapi `@strapi/strapi` 4.24.1.
- Плагины: users-permissions, email, i18n, upload (AWS S3 provider), кастомный `sms` плагин.
- Прочее: `canvas` (для работы с изображениями/blurhash), `strapi-blurhash`, React 18 для админки.

## npm-скрипты

- `npm run develop` — dev-режим Strapi с автоперезагрузкой.
- `npm run start` — прод-режим.
- `npm run build` — сборка админки + `copy-plugin-files` (кладёт `plugins/sms/package.json` в `dist`).
- `npm run strapi` — прямой вызов CLI.

## Структура проекта

- `config/` — общие настройки (сервер, БД, плагины, middleware, API).
- `src/api/*` — content-types, контроллеры, сервисы, маршруты и lifecycle'ы.
- `src/components/` — компоненты (nutrition).
- `src/extensions/users-permissions/` — расширение плагина пользователей (схема user, кастомные маршруты phone-auth).
- `plugins/sms/` — SMS-плагин (sms-prosto) с режимами mock/real.
- `images/strapi/Dockerfile` — прод‑образ.
- `public/uploads/` — локальные медиа (если не используется S3).
- `database/migrations/` — заготовка для миграций.

## Переменные окружения (ключевые)

_Не храните реальные секреты в публичных репозиториях; используйте `.env.local` / секреты CI._

- Сервер/Strapi: `HOST`, `PORT`, `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`.
- БД: `DATABASE_CLIENT` (`postgres`|`mysql`|`mysql2`|`sqlite`), `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_SSL`, `DATABASE_POOL_MIN/MAX`, `DATABASE_CONNECTION_TIMEOUT`.
- Хранилище: `AWS_ACCESS_KEY_ID`, `AWS_ACCESS_SECRET`, `AWS_BUCKET`, `AWS_ENDPOINT` (по умолчанию Yandex Cloud), регион `ru-central1`.
- Интеграция n8n: `N8N_WEBHOOK_ID` (используется lifecycle заказа), SMTP/DB переменные n8n (`N8N_*`, `DB_*`, `POSTGRES_*`).
- SMS (sms-prosto): `SMS_MODE` (`real`|`mock`), `SMS_PROSTO_BASE_URL`, `SMS_PROSTO_SENDER_NAME`, `SMS_PROSTO_KEY` (или `SMS_PROSTO_EMAIL`+`SMS_PROSTO_PASSWORD`), `SMS_PROSTO_PRIORITY`, `SMS_HTTP_TIMEOUT_MS`, `SMS_MOCK_LOG_TEXT`.
- Прочее: `STRAPI_LOG_LEVEL`, `PORT_PROD` (используется извне).

## Настройка и запуск локально

1. Установить Node 18/20 (совместимо с 16, но Dockerfile сейчас на 22 — для прод лучше зафиксировать LTS).
2. Установить зависимости:
   ```bash
   npm install
   ```
3. Создать `.env` с переменными выше. Для локальной БД по умолчанию Postgres (`DATABASE_CLIENT=postgres`).
4. Запуск dev:
   ```bash
   npm run develop
   ```
   Админка будет на `http://localhost:1337/admin`.
5. Сборка и прод-запуск:
   ```bash
   npm run build
   npm run start
   ```
   `npm run build` дополнительно копирует `plugins/sms/package.json` в `dist` (иначе Strapi не увидит плагин после сборки).

## Docker

- `docker-compose.yml` поднимает:
  - `strapi` (сборка из `images/strapi/Dockerfile`, порт 1337, env из `.env`);
  - `n8n` (порт 5678, хранит данные в `n8n_storage`);
  - `n8n_db` (Postgres 16.1, данные в `./n8n_db`).
- Прод-образ: Node 20 (`node:20-bookworm-slim`), ставит зависимости для `canvas`, копирует проект, `npm run build`, затем `npm start`.

## Модель данных (Content Types)

- **Компонент `nutrition.nutrition`**: `kcal_100`, `protein_100`, `fat_100`, `carb_100`, `kcal_total`, `protein_total`, `carb_total`, `fat_total` (decimal), `ingredients_text` (string).
- **allergen** (коллекция, D&P): `title` (string, req, unique); связь manyToMany ↔ `kinza.allergens`.
- **category** (коллекция, D&P): `title` (string), `slug` (uid от title, req), связь manyToMany ↔ `kinza.categories`.
- **ingredient** (коллекция, D&P): `name` (string), `photo` (media[], images), связи manyToMany ↔ `kinza.ingredients`; oneToOne ↔ `ingredient-option.ingredient_option`.
- **ingredient-option** (коллекция, D&P): флаги `canRemove`, `canAdd`, `canDouble`, `default` (boolean, с дефолтами), `addPrice`/`doublePrice` (int), связи oneToOne ↔ ingredient, manyToMany ↔ `kinza.ingredient_options`.
- **kinza** (коллекция, D&P) — карточка товара: `mark`, `category`, `name_item`, `description_item` (string), `price`/`discountPrice` (int), `blurHash` (string, дефолт «…»), `ImageUrl` (media), `isWeightBased` (bool, default false), `minimumWeight`, `weight` (decimal), связи manyToMany ↔ categories/tags/allergens/ingredient_options, manyToMany inversedBy ↔ ingredients, oneToMany ↔ order_items. Компонент `nutrition`.
- **tag** (коллекция, D&P): `name` (string), `code` (string, unique), связь manyToMany ↔ `kinza.tags`.
- **delivery** (коллекция, D&P): `Title` (string, req), `Slug` (string, req, unique), `Description` (string), `Order` (int), `minOrderForFree` (int).
- **delivery-condition** (коллекция, D&P): `Name` (string, req), `order` (int).
- **email-order** (single type, D&P): `email_order` (email) — куда слать уведомления.
- **address** (коллекция, без D&P): связь manyToOne → user, поля `type` (enum home|work|other, req, default other), `street`/`house` (req string), `flat`, `comment` (string), `lat`/`lng` (decimal, 9,6), `isDefault` (bool), `fullLine` (req string), связь oneToMany ↔ orders.
- **order** (коллекция, D&P): цены/метаданные заказа: `total_price` (int), `delivery_fee` (int), `phone` (string), `payment_method` (string), `shipping_address` (string), `details` (text), `orderNumber` (int), `order_date` (datetime), `status` (enum new|cooking|on_way|done, default new), `payStatus` (enum unpaid|paid|refunded, default unpaid), `payment` (enum card|cash|sbp), `delivery` (enum courier|pickup), `comment` (text); связи manyToOne → user, manyToOne → address, oneToMany ↔ items.
- **order-item** (коллекция, D&P): `titleCached` (string), `price` (int, req), `qty` (int, default 1), `weight` (decimal), `total` (int, req); связь manyToOne → order, manyToOne → kinza.
- **otp-code** (коллекция, без D&P): `phone` (string), `code` (string), `expires` (datetime), `used` (bool, default false).
- **refresh-token** (коллекция, без D&P, скрыта в админке): `tokenHash` (string, private, unique), `expiresAt` (datetime), `revokedAt` (datetime), `lastUsedAt` (datetime), `deviceId` (string), связь manyToOne → user.
- **test** (коллекция, D&P): `test` (string) — вспомогательный.
- **Пользователь (users-permissions, расширение)**: добавлены `phone` (string, unique, regex `+?[0-9]{10,15}`), `deletedAt` (datetime, private), связи oneToMany ↔ addresses/orders. Email и username отмечены как required/unique.
- **delivery-setting** (single type, без D&P): правила доставки `courierTiers`/`pickupTiers` (repeatable component `delivery.tier`: `label`, `minOrder`, `fee`, `order`).

## Аутентификация по телефону

- Расширение плагина users-permissions (`src/extensions/users-permissions/strapi-server.js`) добавляет публичные маршруты:
  - `POST /api/phone-auth/send` — тело `{ phone }`, генерирует 4-значный OTP, сохраняет в `otp-code` с TTL 5 минут (`expires`), отправляет через `plugin::sms.sms.send` (priority=1, externalId=otp.id). Ответ: `{ ok: true }` в `SMS_MODE=real`, и `{ ok: true, code }` в `SMS_MODE=mock`.
  - `POST /api/phone-auth/confirm` — тело `{ phone, code, deviceId? }`; берёт последний неиспользованный OTP, проверяет срок; помечает used; находит роль `authenticated`; создаёт пользователя (username=phone, phone, random password, confirmed=true, роль) или переносит его в роль authenticated; выпускает `access` JWT (TTL 7d) + `refresh` (TTL 30d); возвращает `{ jwt, refreshToken, user }` без приватных полей.
  - `POST /api/phone-auth/refresh` — тело `{ refreshToken, deviceId? }`; валидирует refresh, делает ротацию и возвращает `{ jwt, refreshToken }`.
- Замечание: в схеме user `email` помечен required — убедитесь, что БД/валидация допускает создание пользователя без email (или заполняйте его в контроллере).
- `phone-auth/confirm` отклоняет заблокированные/удалённые аккаунты (`blocked=true` или `deletedAt`).
- Параметры TTL (опционально через env): `ACCESS_TOKEN_TTL` (по умолчанию `7d`), `REFRESH_TOKEN_TTL_DAYS` (по умолчанию `30`), `REFRESH_TOKEN_BYTES` (по умолчанию `64`).

## Удаление аккаунта (анонимизация)

- `DELETE /api/account` (JWT обязателен).
- Блокирует удаление при активных заказах (`status` in `new|cooking|on_way`) → `409 { ok: false, error: "active_orders" }`.
- Действия: `blocked=true`, `deletedAt=now`, `phone=null`, `email/username` заменяются на уникальные `deleted_{id}`; очищаются `resetPasswordToken`, `confirmationToken`, `provider`; все адреса пользователя удаляются; в заказах пользователя обнуляются `phone`, `shipping_address`, `comment`, `details`, связи `order.user` и `order.address` удаляются; refresh‑токены пользователя удаляются.

## SMS (sms-prosto)

- Реализовано через API `push_msg` (`https://ssl.bs00.ru/`, `format=json`), с env-переключателем `SMS_MODE`.
- В `SMS_MODE=real` плагин требует `SMS_PROSTO_SENDER_NAME=Kinza` и авторизацию через `SMS_PROSTO_KEY` (рекомендуется) или `SMS_PROSTO_EMAIL`+`SMS_PROSTO_PASSWORD`.
- В `SMS_MODE=mock` отправка не выполняется; по умолчанию в логи выводится только факт отправки (без текста), а `phone-auth/send` возвращает `code` в ответе.

## Заказы и интеграция с n8n

- Lifecycle `afterCreate` у `order` (`src/api/order/content-types/order/lifecycles.ts`) отправляет payload заказа POST-запросом на `http://n8n:5678/webhook/${N8N_WEBHOOK_ID}`. При ошибке логирует в консоль. Для работы нужен доступ к сервису n8n в сети контейнеров.
- Email-адрес для уведомлений хранится в single type `email-order`.
- Content API ограничения:
  - `GET /api/orders` и `GET /api/orders/:id` возвращают только заказы текущего пользователя (JWT обязателен).
  - `POST /api/orders` автоматически привязывает заказ к `user` из JWT.

## Статус заведения (store-status)

- Настройки заведения хранятся в Single Type `store-setting` (`src/api/store-setting/content-types/store-setting/schema.json`).
- В админке: Content Manager → Single Types → **Store Settings**.
- Поля:
  - `timezone` (по умолчанию `Europe/Saratov`)
  - `orderCutoffMinutes` (10–60) — за сколько минут до закрытия прекращаем приём заказов
  - `deliveryEnabled`, `pickupEnabled` — доступность способов получения
  - `isPaused`, `pauseMessage` — ручная пауза приёма заказов
  - `weeklySchedule` — расписание по дням недели (`opensAt`, `closesAt`, `isClosed`)
  - `overrides` — исключения по датам (праздники/особые часы)
- Публичный эндпоинт:
  - `GET /api/store-status`
- Возвращает `isOpen`, `canOrderNow`, `canOrderDeliveryNow`, `canOrderPickupNow`, а также `opensAt/closesAt/lastOrderAt/nextChangeAt` (ISO timestamps в UTC) + `timezone` и `serverTime`.
- Дополнительно возвращает `deliveryRules` с массивами правил для `courier` и `pickup` (из single type `delivery-setting`).
- Защита на сервере:
  - `POST /api/orders` проверяет статус и вернёт ошибку, если сейчас нельзя принимать заказы:
    - `409 store_closed` (закрыто / прошёл lastOrderAt)
    - `423 store_paused` (ручная пауза)
    - `503 store_status_unavailable` (настройки ещё не созданы)
  - `POST /api/orders` проверяет правила доставки (min order / fee) из `delivery-setting` и заполняет `delivery_fee`. Если правила не настроены — `503 delivery_rules_not_configured`, если не достигнут минимум — `409 min_order_not_met`.

## Загрузка файлов

- Плагин upload настроен на AWS S3 provider с endpoint `https://storage.yandexcloud.net`, регион `ru-central1`, бакет из `AWS_BUCKET`, принудительный path-style запрос.
- CSP в `config/middlewares.ts` позволяет `kinza.storage.yandexcloud.net` для `img-src` и `media-src`.
- При сборке в `dist` важно копировать `plugins/sms/package.json` (делает скрипт `copy-plugin-files`).

## Конфигурация сервера и middleware

- `config/server.ts`: `HOST` (по умолчанию `0.0.0.0`), `PORT` (1337), `APP_KEYS` обязателен, `WEBHOOKS_POPULATE_RELATIONS` по умолчанию false.
- `config/api.ts`: REST `defaultLimit=25`, `maxLimit=100`, `withCount=true`.
- `config/middlewares.ts`: стандартный стек Strapi + `contentSecurityPolicy` с разрешёнными `connect-src 'self' https:` и доменом Yandex Cloud для изображений/медиа.
- `config/plugins.ts`: upload на S3; регистрация плагина `sms` (`plugins/sms`).
- `config/database.ts`: поддержка postgres/mysql/mysql2/sqlite, таймаут подключения по умолчанию 60s, пул min/max настраивается через env.

## Админка

- `src/admin/app.tsx`: включена локаль `ru`. Bootstrap оставлен по умолчанию.
- Сборка админки идёт в `build/` внутри `dist` при `npm run build`.

## Docker/n8n заметки

- n8n использует свои переменные (`N8N_EMAIL_MODE`, SMTP, `DB_POSTGRESDB_*`, `POSTGRES_*`). В `.env` уже есть примеры, но для прод следует хранить их в секретах.
- Volume `n8n_storage` сохраняет состояние; база n8n лежит в `./n8n_db`.

## Отсутствующие части и TODO

- Для прода нужно: включить API-шлюз в ЛК sms-prosto, запросить `key`, передать исходящие IP в whitelist, зарегистрировать/согласовать `sender_name` (Kinza), пополнить баланс.
- Нет автоматических тестов/линтинга; при развитии стоит добавить хотя бы smoke-тесты API.
- Перепроверьте обязательность `email` для phone-auth, чтобы учётки создавались без ошибок.
