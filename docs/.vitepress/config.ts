import { DefaultTheme, defineConfig } from "vitepress";
import Inspect from "vite-plugin-inspect";
import { readJSONSync } from "fs-extra";
import {
  FRONTEND_WEEKLY,
  HELLO_GITHUB,
  RUANYF_WEEKLY
} from "../../common/constant";
import { join } from "path";
const cacheDir = join(__dirname, "../../.cache");
const outDir = join(__dirname, "../../dist");
/**
 * 获取 阮一峰科技周刊信息
 * @returns
 */
export function getRuanYFWeeklyData(): { slide: DefaultTheme.Sidebar } {
  // 从配置中读取
  try {
    const meta = readJSONSync(join(cacheDir, `${RUANYF_WEEKLY}/meta.json`));
    return { slide: meta.slide };
  } catch (error) {
    console.log("error:", error);
    return { slide: [] };
  }
}
/**
 * 获取 前端精读周刊
 * @returns
 */
export function getFrontendWeeklyData(): { slide: DefaultTheme.Sidebar } {
  // 从配置中读取
  try {
    const meta = readJSONSync(join(cacheDir, `${FRONTEND_WEEKLY}/meta.json`));
    return { slide: meta.slide };
  } catch (error) {
    console.log("error:", error);
    return { slide: [] };
  }
}
/**
 * 获取 HelloGitHub 的数据
 * @returns
 */
export function getHelloGithubData(): { slide: DefaultTheme.Sidebar } {
  // 从配置中读取
  try {
    const meta = readJSONSync(join(cacheDir, `${HELLO_GITHUB}/meta.json`));
    return { slide: meta.slide };
  } catch (error) {
    console.log("error:", error);
    return { slide: [] };
  }
}
const ruanyfWeeklyData = getRuanYFWeeklyData();
const frontWeeklyData = getFrontendWeeklyData();
const helloGithubData = getHelloGithubData();
// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Share-Space",
  description: "整合多个 github 开源文档、知识的聚合网站",
  lang: "zh-CN",
  lastUpdated: true,
  cleanUrls: true,
  // 调整文档根目录
  srcDir: "src",
  outDir: outDir,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [],

    sidebar: {
      [`/${RUANYF_WEEKLY}/`]: [...(ruanyfWeeklyData.slide as any)],
      [`/${FRONTEND_WEEKLY}/`]: [...(frontWeeklyData.slide as any)],
      [`/${HELLO_GITHUB}/`]: [...(helloGithubData.slide as any)]
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/jafshare/share-space" }
    ]
  },
  vite: {
    plugins: [Inspect()]
  }
});
