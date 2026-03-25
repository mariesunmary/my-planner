# Інструкція з розгортання проєкту "My Planner" у Production середовищі

Цей документ призначений для Release Engineer / DevOps та містить усі необхідні кроки для успішного розгортання React-додатка "My Planner" на виробничих серверах (Production). Оскільки це Single Page Application (SPA), ми розглядаємо розгортання статичних файлів через вебсервер, наприклад, Nginx.

---

## 1. Вимоги до апаратного забезпечення

Оскільки додаток компілюється у статичні файли (HTML, CSS, JS), вимоги до сервера є мінімальними:

- **Архітектура:** x86_64, ARM64 (наприклад, AWS EC2 t3.micro/t4g.micro або еквівалент).
- **CPU:** 1-2 ядра (віртуальних (vCPU) цілком достатньо).
- **Оперативна пам'ять (RAM):** Мінімум 512 MB (рекомендовано 1 GB для комфортної роботи ОС та вебсервера, або 2 GB якщо збірка проєкту планується на самому сервері).
- **Диск:** Від 10 GB SSD. Сама збірка займає до 50 MB, додаткове місце потрібне для ОС, логів та/або резервних копій.

## 2. Необхідне програмне забезпечення

На сервері повинні бути встановлені наступні пакети:
- **ОС:** Linux (реєструється Ubuntu 22.04 LTS / 24.04 LTS або Debian 12).
- **Вебсервер:** Nginx (версія 1.18+).
- **Node.js та npm:** (Тільки якщо збірка виконується безпосередньо на сервері, хоча рекомендується збирати в CI/CD). Версія Node.js 18.x+.
- **Службові утиліти:** `git`, `curl`, `tar`, `nano` (або `vim`).

## 3. Налаштування мережі

Перед розгортанням переконайтеся у правильній конфігурації мережі та Firewall (ufw / iptables або AWS Security Groups):
- Відкритий порт **80 (HTTP)** — для перенаправлення на HTTPS.
- Відкритий порт **443 (HTTPS)** — для безпечного доступу клієнтів.
- Відкритий порт **22 (SSH)** — для адміністрування.

## 4. Конфігурація серверів (Nginx)

Приклад базового конфігураційного файлу Nginx для React SPA. Створіть файл `/etc/nginx/sites-available/my-planner`:

```nginx
server {
    listen 80;
    server_name my-planner.example.com; # Вкажіть дійсне доменне ім'я

    root /var/www/my-planner/build; # Шлях до зібраного проєкту
    index index.html index.htm;

    # Налаштування стиснення Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Основний location для SPA (правильний routing)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Кешування статичних ассетів
    location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|svg|map)$ {
        expires 6M;
        access_log off;
        add_header Cache-Control "public, max-age=15552000, immutable";
    }
}
```

Активуйте сайт і перезапустіть Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/my-planner /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```
*Наполегливо рекомендується встановити SSL сертифікат (наприклад, за допомогою `certbot --nginx`).*

## 5. Налаштування СУБД

Додаток "My Planner" є клієнтським застосунком (Frontend-only), і його поточна реалізація зберігає дані локально (localStorage/IndexedDB) або використовує зовнішні API (наприклад, через Firebase). 
Тому **розгортання окремої локальної або виділеної СУБД (PostgreSQL/MySQL/MongoDB) на цьому кроці НЕ потрібне.**

*(Якщо Backend буде додано пізніше, цей розділ буде оновлено конфігурацією БД та параметрами в `.env`).*

## 6. Розгортання коду

Процес розгортання включає наступні кроки:

1. Отримання артифактів збірки (з CI/CD платформи, напр., GitHub Actions, або збірка з вихідних кодів).
2. Якщо збірка відбувається локально на сервері:
   ```bash
   git clone <URL_РЕПОЗИТОРІЮ> /tmp/my-planner-source
   cd /tmp/my-planner-source
   git checkout main
   npm ci
   npm run build
   ```
3. Копіювання збірки у робочу директорію вебсервера:
   ```bash
   sudo mkdir -p /var/www/my-planner
   sudo rm -rf /var/www/my-planner/build # Видалення старої версії
   sudo cp -r /tmp/my-planner-source/build /var/www/my-planner/
   sudo chown -R www-data:www-data /var/www/my-planner/build
   ```

## 7. Перевірка працездатності

Як переконатись, що все працює правильно (Health Check):

1. **Мережева доступність:** Відкрийте браузер і перейдіть за адресою `https://my-planner.example.com`. Додаток має завантажитись без помилок.
2. **HTTP Статус:** Можна перевірити терміналом:
   ```bash
   curl -I https://my-planner.example.com
   ```
   Очікуваний результат: `HTTP/2 200 OK` (або `HTTP/1.1 200 OK`).
3. **Роутинг:** Перейдіть на будь-яку внутрішню сторінку кліком із головного меню і перезавантажте сторінку (F5). Якщо Nginx налаштований вірно, ви побачите сторінку, а не помилку 404 (завдяки `try_files $uri /index.html`).
4. **Логи серверу:** Перевірте логи Nginx на відсутність помилок доступу:
   ```bash
   sudo tail -n 50 /var/log/nginx/error.log
   ```
   
Якщо інтерфейс вантажиться і браузерна консоль (F12 -> Console) не показує критичних помилок із завантаженням JS/CSS (`404 Not Found`), розгортання пройшло успішно.
