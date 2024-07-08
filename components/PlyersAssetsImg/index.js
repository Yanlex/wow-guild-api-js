const { Client } = require("pg");
const fs = require("fs");
const fetch = require("node-fetch");
const path = require("path");
require("dotenv").config();

hostPostgres = process.env.DOCKER_POSTGRES_CONTAINER_ADDRESS;
userPostgres = process.env.DOCKER_POSTGRES_USERNAME;
passwordPostgres = process.env.DOCKER_POSTGRES_PASSWORD;
portPostgres = process.env.DOCKER_POSTGRES_PORT;
databasePostgres = process.env.DOCKER_POSTGRES_DATABASE;

const client = new Client({
  user: userPostgres,
  host: hostPostgres,
  database: databasePostgres,
  password: passwordPostgres,
  port: portPostgres,
});

// Загрузка изображений в папку assets/img
function downloadImages() {
  const imageFolderPath = path.resolve(__dirname, "../../assets/img");

  if (!fs.existsSync(imageFolderPath)) {
    fs.mkdirSync(imageFolderPath);
  }

  client
    .connect()
    .then(() =>
      client.query("SELECT name AS character_name, thumbnail_url FROM members")
    )
    .then((res) => {
      res.rows.forEach(async (row, index) => {
        let imageUrl = row.thumbnail_url;

        // Ensure the URL is absolute
        if (
          !imageUrl.startsWith("http://") &&
          !imageUrl.startsWith("https://")
        ) {
          imageUrl = "https://" + imageUrl; // Adjusted to https, change if necessary
        }

        const fileName = row.character_name + ".jpg";

        // Если в имени цифры - скипаем т.к это особенность и в RIO не обрабатывается
        if (/[\d]/.test(fileName)) {
          console.log("Skipping file due to digit in name:", fileName);
          return;
        }

        const imagePath = path.join(imageFolderPath, fileName);
        // Аватарка уже лежит в папке, скипаем
        if (fs.existsSync(imagePath)) {
          console.log("File already exists:", imagePath);
          return;
        }

        // Загружаем изображение с сайта worldofwarcraft
        try {
          const response = await fetch(imageUrl);
          const buffer = await response.buffer();

          fs.writeFile(imagePath, buffer, (err) => {
            if (err) {
              console.error("Error writing file:", err);
            } else {
              console.log("Image saved:", imagePath);
            }
          });
        } catch (error) {
          console.log("Error fetching image:", error);
        }
      });
    })
    .catch((err) => console.error("Error executing query", err.stack))
    .finally(() => client.end());
}

module.exports = downloadImages;
