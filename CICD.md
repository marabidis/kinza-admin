# CI/CD (master + stage)

Эта инструкция описывает базовый CI/CD для `kinza-admin-v2` (Strapi), который:

1. запускает проверки (lint + test)
2. собирает проект
3. собирает Docker-образ и пушит в registry
4. деплоит на сервер через SSH + `docker compose` (pull готового образа)

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
6. Docker build & push образа `strapi` в registry (если настроены секреты)

### Шаги CD (deploy)

Deploy запускается только если:

- ветка `master` или `stage`
- CI прошёл успешно
- в GitHub Secrets задан `SSH_PRIVATE_KEY`

Деплой делает SSH на сервер и выполняет:

- `git fetch`
- `git checkout <branch>`
- `git reset --hard origin/<branch>`
- `docker login` (если задан registry и креды)
- `docker compose pull strapi` (тянем готовый образ)
- `docker compose up -d --no-build --force-recreate strapi`

Если registry-секреты не заданы, workflow делает fallback на локальную сборку на сервере:

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

### Secrets (Docker registry)

Чтобы деплоить “docker way” (pull готового образа), добавь:

- `DOCKER_REGISTRY` — адрес registry, например `ghcr.io` или `registry.example.com`
- `DOCKER_IMAGE` — путь образа без тега, например `marabidis/kinza-admin-strapi`
- `DOCKER_USERNAME` — логин для registry
- `DOCKER_PASSWORD` — пароль/токен для registry
- `DOCKER_PLATFORMS` — (опционально) платформы для buildx, например `linux/amd64,linux/arm64` (по умолчанию `linux/amd64`)

## Подготовка сервера (один раз)

1. Установить Docker + Docker Compose plugin (`docker compose ...`).
2. Склонировать репозиторий в `DEPLOY_PATH`.
3. Создать/обновить файл `.env` на сервере (он не должен коммититься в git).
4. Проверить руками, что на сервере работает:

`docker compose up -d --build --force-recreate strapi`

Если используешь registry (готовые образы), то на сервере можно проверять так:

`STRAPI_IMAGE=<registry>/<image>:<tag> docker compose pull strapi && STRAPI_IMAGE=<registry>/<image>:<tag> docker compose up -d --no-build --force-recreate strapi`

## Как проверить локально (до пуша)

- `npm ci`
- `npm run lint`
- `npm test`
- `npm run build`

## Локальная работа через Docker

В `docker-compose.yml` для `strapi` задан `image` + `build`.

- **Локально (сборка из исходников):**
  - `docker compose up -d --build --force-recreate strapi`
- **Локально/на сервере (запуск готового образа из registry):**
  - `STRAPI_IMAGE=<registry>/<image>:<tag> docker compose pull strapi`
  - `STRAPI_IMAGE=<registry>/<image>:<tag> docker compose up -d --no-build --force-recreate strapi`

## Что нужно от тебя для финальной настройки deploy

Когда будешь готов — напиши:

- `SSH_HOST`, `SSH_USER`, `SSH_PORT`
- `DEPLOY_PATH`
- как именно ты деплоишь сейчас на проде (только `strapi` или ещё `n8n`)
- где хранится `.env` на сервере и нужно ли его обновлять пайплайном
