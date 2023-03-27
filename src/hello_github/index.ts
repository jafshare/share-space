/**
 * 针对 https://github.com/521xueweihan/HelloGitHub 文档的单独处理
 */
import fs from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import type { DefaultTheme } from "vitepress";
import { copySync } from "../common/copy";
import { fetchGit } from "../common/fetch";
import { HELLO_GITHUB } from "../../common/constant";
const cacheDir = `./.cache/${HELLO_GITHUB}`;

// 遍历文件夹
export async function traverseFold(dirPath: string) {
  const fileStat = await stat(dirPath);
  const res: string[] = [];
  if (fileStat.isFile()) {
    res.push(dirPath);
  } else {
    const children = await readdir(dirPath);
    for (const child of children) {
      res.push(...(await traverseFold(join(dirPath, child))));
    }
  }
  return res;
}
// 解析文件夹获取期号
export async function parseDir(dirPath: string) {
  // 获取所有的文件
  const mdPaths = await (
    await traverseFold(dirPath)
  ).filter((str) => !str.endsWith("contributors.md"));
  const issueRE = /(HelloGitHub(\d+))\.md$/;
  const data: { title: string; docPath: string }[] = mdPaths.map((str) => {
    const issueResult = issueRE.exec(str);
    const docPath = str.replace(/\\/g, "/");
    if (issueResult) {
      return {
        title: `《HelloGitHub》第${issueResult[2]}期`,
        docPath
      };
    }
    // 做一下回退处理
    return {
      title: docPath,
      docPath
    };
  });
  return data;
}
function cloneDocs() {
  copySync(join(cacheDir, "content"), `./docs/src/${HELLO_GITHUB}`, {
    transformContent: ({ content, src, dest }) => {
      let transformedContent: string = content;
      // 处理不规范的 img 自闭合标签
      const closeRE = /<((img)[^<>]*)> *<\/(img)>/g;
      transformedContent = transformedContent.replace(
        closeRE,
        (_, tagContent) => {
          // 将标签转为自闭合标签，避免报错
          return `<${tagContent} />`;
        }
      );
      // 对内部链接进行转换，避免跳转到旧网站
      const inlineLinkRE =
        /https:\/\/github.com\/521xueweihan\/HelloGitHub\/blob\/master\/content\/(HelloGitHub\d+).md/g;
      transformedContent = transformedContent.replace(
        inlineLinkRE,
        (_, filename) => {
          return `./${filename}`;
        }
      );
      // 处理 HelloGitHub73 的 <results> 解析报错
      if (src.endsWith("HelloGitHub73.md")) {
        const resultsRE = /<results>/g;
        transformedContent = transformedContent.replace(resultsRE, "");
      }
      return transformedContent;
    }
  });
}

/**
 * 生成菜单
 * @returns
 */
function generateSide(menuData: any[]): DefaultTheme.Sidebar {
  const sideTree: DefaultTheme.Sidebar = menuData.map((item) => {
    return {
      text: item.title,
      link: `${item.docPath.replace(
        `.cache/${HELLO_GITHUB}/content`,
        `/${HELLO_GITHUB}`
      )}`
    };
  });
  return sideTree;
}

/**
 * 生成文档资源
 */
export async function generateDoc() {
  // 拉取仓库
  await fetchGit("git@github.com:521xueweihan/HelloGitHub.git", cacheDir);

  // 解析目录
  const menuData = await parseDir(join(cacheDir, "content"));
  menuData.reverse();
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
