import { DefaultTheme, defineConfig } from "vitepress";
import Inspect from "vite-plugin-inspect";
import { readJSONSync } from "fs-extra";
import { RUANYF_WEEKLY } from "../../common/constant";
/**
 * 获取 阮一峰科技周刊信息
 * @returns
 */
export function getRuanYFWeeklyData(): { slide: DefaultTheme.Sidebar } {
  // 从配置中读取
  try {
    const meta = readJSONSync(`./cache/${RUANYF_WEEKLY}/meta.json`);
    return { slide: meta.slide };
  } catch (error) {
    console.log("error:", error);
    return { slide: [] };
  }
}
const ruanyfWeeklyData = getRuanYFWeeklyData();
// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Share-Space",
  description: "整合多个 github 开源文档、知识的聚合网站",
  lang: "zh-CN",
  lastUpdated: true,
  cleanUrls: true,
  // 调整文档根目录
  srcDir: "src",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [],

    sidebar: [...(ruanyfWeeklyData.slide as any)],

    socialLinks: [
      { icon: "github", link: "https://github.com/jafshare/share-space" }
    ]
  },
  vite: {
    plugins: [Inspect()]
  }
});
