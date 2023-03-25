/**
 * 针对 https://github.com/ascoders/weekly 文档的单独处理
 */
import fs from "node:fs";
import { join } from "node:path";
import type { DefaultTheme } from "vitepress";
import { copySync } from "../common/copy";
import { fetchGit } from "../common/fetch";
import { FRONTEND_WEEKLY } from "../../common/constant";
const cacheDir = `./cache/${FRONTEND_WEEKLY}`;

/**
 * 解析 markdown 文档，
 * @param filePath
 */
function parseMarkdown(filePath: string) {
  const content = fs.readFileSync(filePath, "utf-8");
  // match: ### 前沿技术
  const menuGroupRE = /^### (.+) *$/;
  // match: <a href="./前沿技术/1.%E7%B2%BE%E8%AF%BB%E3%80%8Ajs%20%E6%A8%A1%E5%9D%97%E5%8C%96%E5%8F%91%E5%B1%95%E3%80%8B.md">1.精读《js 模块化发展》</a>
  const menuRE = /<a href="(.+)">(.+)<\/a>/;
  const lines = content.split("\n");
  let menuGroup;
  const data: Record<string, { title: string; docPath: string }[]> = {};
  for (const line of lines) {
    // parse menuGroup
    const menuGroupResult = menuGroupRE.exec(line);
    if (menuGroupResult) {
      menuGroup = menuGroupResult[1];
      data[menuGroup] = [];
      continue;
    }
    // parse menu
    const menuResult = menuRE.exec(line);
    // 排除前几行的链接解析
    if (menuResult && menuGroup) {
      const title = menuResult[2];
      const docPath = menuResult[1];
      data[menuGroup as string].push({
        title,
        docPath
      });
    }
  }
  return data;
}

function cloneDocs() {
  copySync(cacheDir, `./docs/src/${FRONTEND_WEEKLY}`, {
    transformDestPath: (dest) => {
      // 处理文件名编码问题 21.精读《Web fonts when you need them, when you don’t》.md
      if (dest.includes("21.精读《Web fonts")) {
        return dest.replace(
          /21.精读《Web fonts.+$/,
          "21.精读《Web fonts: when you need them, when you don’t》.md"
        );
      } else if (dest.includes("25.精读《null")) {
        // 处理文件名编码问题 25.精读《null = 0》.md
        return dest.replace(
          /25.精读《null.+$/,
          "25.%E7%B2%BE%E8%AF%BB%E3%80%8Anull%20%3E%3D%200%3F%E3%80%8B.md"
        );
      }
      return dest;
    },
    transformContent: ({ content, src, dest }) => {
      let transformedContent: string = content;
      // 处理 6.精读《JavaScript 错误堆栈处理》.md 的 script 未闭合的问题
      if (dest.endsWith("6.精读《JavaScript 错误堆栈处理》.md")) {
        transformedContent = content.replace("<script>", "`<script>`");
      }
      return transformedContent;
    }
  });
}

/**
 * 生成菜单
 * @returns
 */
function generateSide(menuData: Record<string, any>): DefaultTheme.Sidebar {
  const sideTree: DefaultTheme.Sidebar = [];
  for (const group in menuData) {
    const groupMenu: DefaultTheme.SidebarItem = {
      text: group,
      collapsed: true,
      items: []
    };
    for (const menu of menuData[group]) {
      groupMenu.items!.push({
        text: menu.title,
        link: `/${FRONTEND_WEEKLY}/${menu.docPath.replace("./", "")}`
      });
    }
    sideTree.push(groupMenu);
  }
  return sideTree;
}

/**
 * 生成文档资源
 */
export async function generateDoc() {
  // 拉取仓库
  await fetchGit("git@github.com:ascoders/weekly.git", cacheDir);
  // 解析目录
  const menuData = parseMarkdown(join(cacheDir, "readme.md"));
  // 生成 meta 文件，供 vitepress 使用
  fs.writeFileSync(
    join(cacheDir, "meta.json"),
    JSON.stringify(
      // TODO md5 gen
      { slide: generateSide(menuData), md5: "test", createTime: Date.now() },
      null,
      2
    )
  );
  // 初始化文件
  cloneDocs();
}
