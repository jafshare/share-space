import schedule from "node-schedule";
import { logger } from "./common/logger";
import { run } from "./task";
const rule = new schedule.RecurrenceRule();
// 每 30分钟 执行一次更新
rule.minute = new schedule.Range(0, 59, 30);
const job = schedule.scheduleJob(rule, async (date) => {
  try {
    await run();
  } catch (error) {
    logger.error(`任务执行失败 ${error}`);
  }
});
