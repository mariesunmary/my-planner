#!/bin/bash

# Скрипт для запуску середовища розробки (Development)

echo "🚀 Ініціалізація Development Environment для My Planner..."

# 1. Перевірка наявності node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 Папка node_modules не знайдена. Виконується npm install..."
    npm install
else
    echo "✅ Залежності вже встановлені."
fi

# (Опціонально) Запуск міграцій БД (якщо вони з'являться)
# echo "🗄️ Перевірка міграцій БД..."
# npm run db:migrate

echo "💻 Запуск React Dev Server..."
# 2. Запуск проєкту
npm start
