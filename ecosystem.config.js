module.exports = {
  apps: [
    {
      name: "doc-cron",
      script: "./dist/cron.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G"
    }
  ]
};
