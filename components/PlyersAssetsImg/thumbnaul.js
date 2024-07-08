const { Pool } = require("pg");
const https = require("https");
const path = require("path");

const INTERVAL_DELAY = 220; // интервал чтобы не превысить количество запросов к апи

require("dotenv").config();

hostPostgres = process.env.DOCKER_POSTGRES_CONTAINER_ADDRESS;
userPostgres = process.env.DOCKER_POSTGRES_USERNAME;
passwordPostgres = process.env.DOCKER_POSTGRES_PASSWORD;
portPostgres = process.env.DOCKER_POSTGRES_PORT;
databasePostgres = process.env.DOCKER_POSTGRES_DATABASE;

const pool = new Pool({
  user: userPostgres,
  host: hostPostgres,
  database: databasePostgres,
  password: passwordPostgres,
  port: portPostgres,
});

// Добавляем ссылку на аватарки
async function updateMembersWithThumbnails() {
  try {
    const res = await pool.query("SELECT name AS character_name FROM members");
    const rows = res.rows;

    for (let i = 0; i < rows.length; i++) {
      const name = rows[i].character_name;

      // Проверяем, содержит ли имя цифры
      if (/[\d]/.test(name)) {
        console.log(`Пропускаем имя ${name}, так как оно содержит цифры.`);
        continue; // Пропускаем текущую итерацию цикла
      }

      const url = `https://raider.io/api/v1/characters/profile?region=eu&realm=howling-fjord&name=${name}&fields=mythic_plus_scores_by_season%3Acurrent`;

      https
        .get(url, (res) => {
          let data = "";

          res.on("data", (chunk) => {
            data += chunk;
          });

          res.on("end", () => {
            const result = JSON.parse(data);
            const thumbnail = result.thumbnail_url;

            pool.query(
              "UPDATE members SET thumbnail_url = $1 WHERE name = $2",
              [thumbnail, name],
              (err) => {
                if (err) {
                  console.error(name, err.message);
                } else {
                  console.log(
                    `Строка с ником ${name} успешно обновлена thumbnail_url`
                  );
                }
              }
            );
          });
        })
        .on("error", (err) => {
          console.error(err.message);
        });

      await new Promise((resolve) => setTimeout(resolve, INTERVAL_DELAY));
    }
  } catch (err) {
    console.error(err.message);
  }
}

// В файле databaseOperations.js

module.exports.updateMembersWithThumbnails = updateMembersWithThumbnails;
