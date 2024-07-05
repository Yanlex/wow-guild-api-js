module.exports = {
  apps: [
    {
      name: "WoW Guild API",
      script: "./node_modules/.bin/nodemon",
      args: '--watch app.js --exec "npm run server"',
      env: {
        NODE_ENV: "development",
      },
      watch: true,
      ignore_watch: ["node_modules", "logs"],
      max_memory_restart: "1G",
    },
  ],
};
