import schedule from "node-schedule";
import log4js from "log4js";
import spawn from "cross-spawn";
import { generateDoc } from "./ruanyf_weekly";
// import { generateDoc as frontendGenerateDoc } from "./frontend_weekly";
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
const logger = log4js.getLogger();
logger.info("start");
async function run() {
  try {
    logger.info("开始更新文档");
    await generateDoc();
    logger.info("完成更新文档");
    // 这个文档问题比较多，暂时先不用
    // frontendGenerateDoc();
  } catch (error) {
    logger.error(`页面更新失败 ${error}`);
  }
}
// 默认执行一次
run();

const rule = new schedule.RecurrenceRule();
// 每 30分钟 执行一次更新
rule.minute = new schedule.Range(0, 59, 30);
const job = schedule.scheduleJob(rule, async (date) => {
  try {
    await run();
    spawn("pnpm run docs:build");
  } catch (error) {
    logger.error(`任务执行失败 ${error}`);
  }
});
