/**
 * 针对 https://github.com/521xueweihan/HelloGitHub 文档的单独处理
 */
import { join } from "node:path";
import { writeJSON } from "fs-extra";
import type { DefaultTheme } from "vitepress";
import fg from "fast-glob";
import { copy } from "../common/copy";
import { fetchGit } from "../common/fetch";
import { HELLO_GITHUB } from "../../common/constant";
const cacheDir = `./.cache/${HELLO_GITHUB}`;

// 解析文件夹获取期号
export async function parseDir(dirPath: string): Promise<DocRecord[]> {
  // 获取所有的文件, 只匹配 HelloGitHub1.md 、HelloGitHub2.md的文件
  const mdPaths = await fg("HelloGitHub*.md", { cwd: dirPath, absolute: true });
  const issueRE = /(HelloGitHub(\d+)\.md)$/;
  const data: DocRecord[] = [];
  mdPaths.forEach((sourcePath) => {
    const issueResult = issueRE.exec(sourcePath);
    if (issueResult) {
      const issue = issueResult[2];
      const filename = issueResult[1];
      const destPath = join(`./docs/src/${HELLO_GITHUB}`, filename);
      data.push({
        text: `《HelloGitHub》第${issue}期`,
        filename,
        link: `/${HELLO_GITHUB}/${filename}`,
        sourcePath,
        destPath,
        order: -1
      });
    }
  });
  data.reverse();
  return data;
}
async function cloneDocs(docs: DocRecord[]) {
  for await (const doc of docs) {
    await copy(doc.sourcePath, doc.destPath, {
      transformContent: ({ content }) => {
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
        const filename = doc.filename;
        // 处理 HelloGitHub73 的 <results> 解析报错
        if (filename === "HelloGitHub73.md") {
          const resultsRE = /<results>/g;
          transformedContent = transformedContent.replace(resultsRE, "");
        }
        return transformedContent;
      }
    });
  }
}

/**
 * 生成菜单
 * @returns
 */
function generateSide(menuData: DocRecord[]): DefaultTheme.Sidebar {
  return menuData;
}

/**
 * 生成文档资源
 */
export async function generateDoc() {
  // 拉取仓库
  await fetchGit("git@github.com:521xueweihan/HelloGitHub.git", cacheDir);

  // 解析目录
  const docRecords = await parseDir(join(cacheDir, "content"));
  // 生成 meta 文件，供 vitepress 使用
  await writeJSON(
    join(cacheDir, "meta.json"),
    // TODO md5 gen
    { slide: generateSide(docRecords), md5: "test", createTime: Date.now() },
    { spaces: 2 }
  );
  // 初始化文件
  await cloneDocs(docRecords);
}
