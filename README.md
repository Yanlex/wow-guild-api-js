# WoW Guild API

Апишка на бекенд

# Делой
`npm install`

### Настроить кофигурацию в .env
`DOCKER_POSTGRES_CONTAINER_ADDRESS=yanlex-wow-guild-postgres`
`DOCKER_POSTGRES_USERNAME=user-name`
`DOCKER_POSTGRES_PASSWORD=strong-password`
`DOCKER_POSTGRES_PORT=5432`
`DOCKER_POSTGRES_DATABASE=kvd_guild`
`DOCKER_NGINX=yanlex-wow-guild-front-nginx`

### Указать ссылку на гильдию
В функции getGuildData нужно указать ссылку на гильдию
`db/components/GuildDB/fetchGuild/index.js`


### Assets
Скачивание всех аватарок игроков в папку assets/img, запускается крон задача в app.js
К этой статике фронт обращается по АПИ

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