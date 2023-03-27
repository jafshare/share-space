// @ts-expect-error
import spawnPromise from "spawn-please";
import { generateDoc } from "./ruanyf_weekly";
// import { generateDoc as frontendGenerateDoc } from "./frontend_weekly";
import { generateDoc as helloGithubGenerateDoc } from "./hello_github";
import { logger } from "./common/logger";
logger.info("start");
export async function run() {
  try {
    logger.info("开始更新文档");
    await Promise.all([generateDoc(), helloGithubGenerateDoc()]);
    logger.info("完成更新文档");
    // 这个文档问题比较多，暂时先不用
    // frontendGenerateDoc();
    logger.info("页面开始更新");
    // 增加 stdio = 'inherit' 参数,避免 pnpm 找不到等问题
    await spawnPromise("pnpm", ["run", "build"], "inherit");
    logger.info("页面结束更新");
  } catch (error) {
    logger.error(`页面更新失败 ${error}`);
  }
}
// 默认执行一次
run();
