import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Share-Space",
  description: "整合多个 github 开源文档、知识的聚合网站",
  // 调整文档根目录
  srcDir: "src",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Examples", link: "/markdown-examples" }
    ],

    sidebar: [
      {
        text: "Examples",
        items: [
          { text: "Markdown Examples", link: "/markdown-examples" },
          { text: "Runtime API Examples", link: "/api-examples" }
        ]
      }
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/vuejs/vitepress" }
    ]
  }
});
