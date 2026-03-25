#!/bin/bash

# Скрипт для збірки та локального тестування production-версії (Production)

echo "🏭 Ініціалізація Production Environment для My Planner (Локальне тестування)..."

# 1. Оновлення залежностей через чисте встановлення (npm ci - надійніше для production)
echo "📦 Встановлення точних версій залежностей..."
npm ci

# 2. Перевірка коду (Лінтер та Types)
echo "🔍 Запуск перевірок коду (Lint & Type-Check)..."
npm run check-all

# 3. Збірка проєкту
echo "🏗️ Збірка оптимізованих статичних файлів..."
npm run build

echo "✅ Збірка завершена в папку build/."

# 4. Локальний запуск через serve для перевірки (Production mode)
echo "🌐 Запуск локального production-сервера через 'npx serve' на порту 5000..."
npx serve -s build
