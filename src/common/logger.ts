import log4js from "log4js";
log4js.configure({
  appenders: {
    task: {
      type: "file",
      filename: "task.log",
      maxLogSize: 10 * 1024 * 1024,
      backups: 3
    },
    console: {
      type: "console"
    }
  },
  categories: { default: { appenders: ["task", "console"], level: "debug" } },
  pm2: true
});
export const logger = log4js.getLogger();
