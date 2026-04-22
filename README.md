# Task Tracker

Система управления задачами и проектами на Django с возможностью отслеживания дедлайнов, приоритетов, исполнителей и комментариев.

## 🚀 Возможности

- **Управление задачами**: создание, редактирование, удаление задач
- **Статусы задач**: "В работе", "На проверке", "Выполнена", "Отменена"
- **Приоритеты**: числовое значение приоритета задачи
- **Дедлайны**: установка и изменение сроков выполнения
- **Исполнители**: назначение нескольких исполнителей на задачу
- **Комментарии**: обсуждение задач в комментариях
- **Проекты**: группировка задач по проектам с участниками
- **REST API**: полный API для интеграции

## 📋 Требования

- Docker
- Docker Compose

## 🛠️ Установка и запуск

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Настройка переменных окружения

Создайте файл `.env` в корне проекта (или отредактируйте существующий):

```env
# База данных
DB_NAME='postgres'
DB_USER='admin'
DB_PASSWORD='mypassword'
DB_PORT=5432
DB_HOST='postgres'
TIME_ZONE='Europe/Moscow'

# Django
SECRET_KEY='SK'
DEBUG=True
```

### 3. Запуск через Docker Compose

```bash
docker-compose up --build
```

Команда запускает три сервиса:
- **postgres** — база данных PostgreSQL
- **django** — Django-приложение (доступно на `http://localhost:8001`)
- **tailwind** — компиляция Tailwind CSS в реальном времени

### 4. Создание суперпользователя

После запуска контейнеров создайте администратора:

```bash
docker-compose exec django python manage.py createsuperuser
```

## 🌐 Доступ к приложению

- **Основное приложение**: http://localhost:8001
- **Django Admin**: http://localhost:8001/admin
- **API документация (Swagger)**: http://localhost:8001/api/schema/swagger-ui/

## 📁 Структура проекта

```
.
├── docker-compose.yml          # Конфигурация Docker Compose
├── Dockerfile                  # Образ для Django
├── Dockerfile.tailwind         # Образ для Tailwind CSS
├── requirements.txt            # Python-зависимости
├── package.json                # Node.js-зависимости
├── tailwind.config.js          # Конфигурация Tailwind
├── .env                        # Переменные окружения
└── task_tracker/
    ├── manage.py
    ├── core/                   # Основные настройки Django
    │   ├── settings.py
    │   ├── urls.py
    │   └── wsgi.py
    ├── account/                # Приложение пользователей
    ├── tasks/                  # Приложение задач
    ├── projects/               # Приложение проектов
    ├── api/                    # REST API
    ├── static/                 # Статические файлы (CSS, JS)
    └── templates/              # HTML-шаблоны
```

## 🔧 Управление контейнерами

### Остановка

```bash
docker-compose down
```

### Остановка с удалением данных

```bash
docker-compose down -v
```

### Перезапуск

```bash
docker-compose restart
```

### Просмотр логов

```bash
docker-compose logs -f django
docker-compose logs -f postgres
docker-compose logs -f tailwind
```

### Выполнение команд в контейнере

```bash
# Запустить оболочку Django
docker-compose exec django python manage.py shell

# Применить миграции
docker-compose exec django python manage.py migrate

# Создать миграции
docker-compose exec django python manage.py makemigrations

# Запустить тесты
docker-compose exec django python manage.py test
```

## 📊 Модель данных

### Task (Задача)
- `name` — название задачи
- `description` — описание
- `creator` — создатель задачи
- `executor` — исполнители (многие-ко-многим)
- `status` — статус (in_progress, review, done, cancelled)
- `priority` — приоритет (число)
- `deadline` — дедлайн (дата и время)
- `project` — проект (опционально)
- `created_at` — дата создания

### Comment (Комментарий)
- `text` — текст комментария
- `creator` — автор комментария
- `task` — задача
- `created_at` — дата создания

### Project (Проект)
- `name` — название проекта
- `description` — описание
- `participants` — участники (многие-ко-многим)
- `created_at` — дата создания

## 🔐 Аутентификация

Приложение использует стандартную Django-аутентификацию с кастомной моделью пользователя (`CustomUser`).

### Регистрация нового пользователя

Перейдите на страницу регистрации: http://localhost:8001/account/register

### Вход

Перейдите на страницу входа: http://localhost:8001/account/login

## 📡 REST API

API доступно по адресу `http://localhost:8001/api/`. Документация Swagger: http://localhost:8001/api/schema/swagger-ui/

### Основные эндпоинты:

| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| GET | `/api/tasks/` | Список задач |
| GET | `/api/tasks/{id}/` | Детали задачи |
| POST | `/api/tasks/` | Создание задачи |
| PUT | `/api/tasks/{id}/` | Обновление задачи |
| DELETE | `/api/tasks/{id}/` | Удаление задачи |
| GET | `/api/projects/` | Список проектов |
| GET | `/api/projects/{id}/` | Детали проекта |
| POST | `/api/projects/` | Создание проекта |
| PUT | `/api/projects/{id}/` | Обновление проекта |
| DELETE | `/api/projects/{id}/` | Удаление проекта |

## 🎨 Стили

Проект использует **Tailwind CSS**. Сборка стилей происходит автоматически в контейнере `tailwind`:

```bash
# Разработчик (watch mode)
docker-compose up tailwind

# Продакшен сборка
docker-compose run tailwind npm run build
```

Исходный файл: `task_tracker/static/tailwind/input.css`  
Выходной файл: `task_tracker/static/tailwind/output.css`

## ⚙️ Технологический стек

- **Backend**: Python 3.12, Django 6.0
- **Database**: PostgreSQL (Alpine)
- **Frontend**: HTML, JavaScript, Tailwind CSS 3
- **API**: Django REST Framework
- **Контейнеризация**: Docker, Docker Compose

