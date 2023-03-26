import spawn from "cross-spawn";
import { generateDoc } from "./ruanyf_weekly";
// import { generateDoc as frontendGenerateDoc } from "./frontend_weekly";
import { logger } from "./common/logger";
logger.info("start");
export async function run() {
  try {
    logger.info("开始更新文档");
    await generateDoc();
    logger.info("完成更新文档");
    // 这个文档问题比较多，暂时先不用
    // frontendGenerateDoc();
    logger.info("页面开始更新");
    spawn("pnpm run build");
    logger.info("页面结束更新");
  } catch (error) {
    logger.error(`页面更新失败 ${error}`);
  }
}
// 默认执行一次
run();
