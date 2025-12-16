# CI/CD (master + stage)

Эта инструкция описывает базовый CI/CD для `kinza-admin-v2` (Strapi), который:

1. запускает проверки (lint + test)
2. собирает проект
3. деплоит на сервер через SSH + `docker compose`

Пайплайн запускается только для веток `master` и `stage`.

## Что уже есть в репозитории

- `docker-compose.yml` — запуск `strapi` (и `n8n` локально/на сервере при необходимости).
- `images/strapi/Dockerfile` — сборка Strapi (Node 20 + зависимости для `canvas`).
- Скрипты npm:
  - `npm run lint` — проверка форматирования Prettier
  - `npm test` — тесты через `node --test test`
  - `npm run build` — сборка Strapi admin + сборка проекта

## GitHub Actions

Workflow: `.github/workflows/ci-cd.yml`

### Триггеры

- `push` в `master`
- `push` в `stage`

### Шаги CI

1. Установка системных зависимостей (нужно для `canvas`)
2. `npm ci`
3. `npm run lint`
4. `npm test`
5. `npm run build`

### Шаги CD (deploy)

Deploy запускается только если:

- ветка `master` или `stage`
- CI прошёл успешно
- в GitHub Secrets задан `SSH_PRIVATE_KEY`

Деплой делает SSH на сервер и выполняет:

- `git fetch`
- `git checkout <branch>`
- `git reset --hard origin/<branch>`
- `docker compose up -d --build --force-recreate strapi`

## Какие секреты нужны (GitHub)

Рекомендуемый вариант: создать GitHub Environments:

- `staging` (для ветки `stage`)
- `production` (для ветки `master`)

И в каждом Environment добавить Secrets (названия одинаковые, значения разные).

### Secrets

- `SSH_HOST` — хост сервера (IP или домен)
- `SSH_USER` — пользователь для SSH
- `SSH_PORT` — порт SSH (если не 22)
- `SSH_PRIVATE_KEY` — приватный ключ (deploy key)
- `DEPLOY_PATH` — путь на сервере, где лежит репозиторий (например `/opt/kinza-admin-v2`)

## Подготовка сервера (один раз)

1. Установить Docker + Docker Compose plugin (`docker compose ...`).
2. Склонировать репозиторий в `DEPLOY_PATH`.
3. Создать/обновить файл `.env` на сервере (он не должен коммититься в git).
4. Проверить руками, что на сервере работает:

`docker compose up -d --build --force-recreate strapi`

## Как проверить локально (до пуша)

- `npm ci`
- `npm run lint`
- `npm test`
- `npm run build`

## Что нужно от тебя для финальной настройки deploy

Когда будешь готов — напиши:

- `SSH_HOST`, `SSH_USER`, `SSH_PORT`
- `DEPLOY_PATH`
- как именно ты деплоишь сейчас на проде (только `strapi` или ещё `n8n`)
- где хранится `.env` на сервере и нужно ли его обновлять пайплайном
