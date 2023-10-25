import { defineConfig } from "vitepress";
import Inspect from "vite-plugin-inspect";
import { readFileSync } from "fs";
import {
  FRONTEND_WEEKLY,
  HELLO_GITHUB,
  RUANYF_WEEKLY,
  GITHUB_TRENDING
} from "../../common/constant";
import { join } from "path";
const cacheDir = join(__dirname, "../../.cache");
const outDir = join(__dirname, "../../dist");
const routeConfig = [
  // 阮一峰科技周刊
  {
    baseRoute: `/${RUANYF_WEEKLY}/`,
    file: `${RUANYF_WEEKLY}/meta.json`
  },
  // 前端周刊
  {
    baseRoute: `/${FRONTEND_WEEKLY}/`,
    file: `${FRONTEND_WEEKLY}/meta.json`
  },
  // Hello Github 月刊
  {
    baseRoute: `/${HELLO_GITHUB}/`,
    file: `${HELLO_GITHUB}/meta.json`
  },
  {
    baseRoute: `/${GITHUB_TRENDING}/`,
    file: `${GITHUB_TRENDING}/meta.json`
  }
];
export function getSideData(path: string) {
  // 从配置中读取
  try {
    const meta = JSON.parse(
      readFileSync(join(cacheDir, path), { encoding: "utf8" }) as any
    );
    return { slide: meta.slide };
  } catch (error) {
    console.log("error:", error);
    return { slide: [] };
  }
}
const generateSidebar = (routeConfig: any[]) => {
  const sidebar = {};
  routeConfig.forEach((item) => {
    sidebar[item.baseRoute] = [...getSideData(item.file).slide];
  });
  return sidebar;
};
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
    sidebar: generateSidebar(routeConfig),
    search: {
      provider: "local"
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/jafshare/share-space" }
    ]
  },
  ignoreDeadLinks: true,
  markdown: { html: false },
  vite: {
    build: {
      // 解决 SearchPlugin build不执行构建索引的问题
      // issue: https://github.com/emersonbottero/vitepress-plugin-search/issues/58
      ssr: false
    },
    plugins: [Inspect()]
  }
});
