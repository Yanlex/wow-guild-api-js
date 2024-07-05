const axios = require("axios");

// Ручки на запрос к сторонней апишке
async function getGuildData() {
  try {
    const response = await axios.get(
      "https://raider.io/api/v1/guilds/profile?region=eu&realm=howling-fjord&name=%D0%9A%D0%BB%D1%8E%D1%87%D0%B8%D0%BA%20%D0%B2%20%D0%B4%D1%83%D1%80%D0%BA%D1%83&fields=members"
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

async function getPlayerMythicPlus(name) {
  try {
    const response = await axios.get(
      `https://raider.io/api/v1/characters/profile?region=eu&realm=howling-fjord&name=${name}&fields=mythic_plus_scores_by_season%3Acurrent`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

async function getPlayerGuild(name) {
  try {
    const response = await axios.get(
      `https://raider.io/api/v1/characters/profile?region=eu&realm=howling-fjord&name=${name}&fields=guild`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

module.exports = { getPlayerMythicPlus, getGuildData, getPlayerGuild };
