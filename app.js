const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const compression = require("compression");
const cron = require("node-cron");

require("dotenv").config();

hostPostgres = process.env.DOCKER_POSTGRES_CONTAINER_ADDRESS;
userPostgres = process.env.DOCKER_POSTGRES_USERNAME;
passwordPostgres = process.env.DOCKER_POSTGRES_PASSWORD;
portPostgres = process.env.DOCKER_POSTGRES_PORT;
databasePostgres = process.env.DOCKER_POSTGRES_DATABASE;

// работа с БД
const { Pool } = require("pg");
const pool = new Pool({
  user: userPostgres,
  host: hostPostgres,
  database: databasePostgres,
  password: passwordPostgres,
  port: portPostgres,
});

// REDIS
// const redis = require("redis");

const { getPlayerMythicPlus } = require("./db/components/GuildDB/fetchGuild");
const {
  updateMembersWithThumbnails,
} = require("./components/PlyersAssetsImg/thumbnaul");
const downloadImages = require("./components/PlyersAssetsImg");
const path = require("path");

// Сначала заполняет столбец thumbnail_url в таблице members ссылками на аватарки, потом запускает скачивание аватарок отсутвующих в папке assets/img
async function updateAndDownloadImages() {
  await updateMembersWithThumbnails(); // Обновление ссылков на аватарки
  downloadImages(); // Загрузка изображений
}

// Крон задача на столбца thumbnail_url и скачивание аватарок
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

// let redisClient;

// (async () => {
//   redisClient = redis.createClient();

//   redisClient.on("error", (error) => console.error(`Error : ${error}`));

//   await redisClient.connect();
// })();

// *** APP USE *** ///
app.use(bodyParser.json({ limit: "10mb" }));
// Настройка правил CORS
app.use(cors({ credentials: true, origin: `http://wow-guild-front-nginx` }));
// app.use(cors({ credentials: true, origin: "http://wow-guild-front-nginx" }));

// app.use(cookieParser(cookieSecret));
app.use(express.urlencoded({ extended: true }));
app.use(compression());
// Фронт
// Настройка Express для обслуживания статических файлов из папки '/'
// app.use(express.static(path.join(__dirname, "dist")));
// Настройка Express для обслуживания статических файлов из папки '/kvd'
// app.use("/kvd", express.static(path.join(__dirname, "./dist/kvd")));
// Устанавливаем путь к папке, содержащей изображения аватарок игровых персонажей
// app.use("/img", express.static(path.join(__dirname, "./dist/kvd/assets/img")));
// Устанавливаем путь к папке, содержащей изображения аватарок игровых персонажей
app.use("/api/avatar", express.static(path.join(__dirname, "./assets/img")));
// Устанавливаем путь к папке, содержащей классовых изображения
app.use("/api/class", express.static(path.join(__dirname, "./assets/class")));
// Устанавливаем путь к папке, содержащей изображения аватарок игровых персонажей
// app.use(
//   "/video",
//   express.static(path.join(__dirname, "./dist/kvd/assets/video"))
// );
// Апи к БД
// app.use('/createrowdb/:name/:type', require('./db/components/CreateOrUpdateBD/createRowDb'));
// app.use('/removerowdb/:name', require('./db/components/CreateOrUpdateBD/removeRowDb'));
// app.get('/update-mplus-score', require('./db/components/GuildDB/MythicPlusCreateOrUpdate/updateMPlusScore.js'));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Что-то пошло не так");
});
// --- APP USE --- ///

// Вывод всех строк из таблицы members
app.get("/api/guild-data", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM members");
    res.json(result.rows);
    console.log("Guild data received");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Вывод одного игрока, делает запрос к api raider io
app.get("/api/member/:name", async (req, res) => {
  const { name } = req.params;
  const data = await getPlayerMythicPlus(name);
  res.send(data);
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
