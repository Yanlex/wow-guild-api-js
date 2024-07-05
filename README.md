# WoW Guild API

Апишка на бекенд

### Параметры подключения к БД
```js
const pool = new Pool({
  user: "user-name",
  host: "localhost",
  database: "kvd_guild",
  password: "strong-password",
  port: 5432,
});
```
### Важно указать домен с которого разрешим соединение к АПИ
```js 
app.use(cors({ credentials: true, origin: "https://yourDomainName.ru/" }));
```

### Assets
Скачивание всех аватарок игроков в папку assets/img, запускается крон задача в app.js
Эту папку потом переносим на фронт
29 мин 11 час ежедневно
```js
cron.schedule(
  "29 11 * * *",
  async () => {
    try {
      await updateAndDownloadImages();
    } catch (error) {
      console.error("Ошибка в расписании:", error);
    }
  },
  {
    scheduled: true,
    timezone: "Europe/Moscow",
  }
);
```

### Запуск через менеджер процессов pm2
- Запуск
`pm2 start ecosystem.config.js`
 - Посмотреть запщенные
`pm2 status`
- Войти в консоль запущенного процесса
`pm2 log id`
- Удалить процесс
`pm2 delete id`