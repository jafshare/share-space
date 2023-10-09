/**
 * 针对 https://github.com/jafshare/GithubTrending 文档的单独处理
 */
import { basename, join } from "node:path";
import { readdir, writeJSON } from "fs-extra";
import type { DefaultTheme } from "vitepress";
import fg from "fast-glob";
import { fetchGit } from "../common/fetch";
import { copy } from "../common/copy";
import { GITHUB_TRENDING } from "../../common/constant";
const cacheDir = `./.cache/${GITHUB_TRENDING}`;

// 解析文件夹获取期号
export async function parseDir(
  dirPath: string
): Promise<Record<string, DocRecord[]>> {
  const years = await readdir(dirPath);
  const data: Record<string, DocRecord[]> = {};
  for await (const year of years) {
    const mdPaths = await fg("*.md", {
      cwd: join(dirPath, year),
      absolute: true
    });
    const docs: DocRecord[] = [];
    mdPaths.forEach((sourcePath) => {
      const filename = basename(sourcePath);
      const destPath = join(`./docs/src/${GITHUB_TRENDING}/${year}`, filename);
      docs.push({
        text: `${filename.replace(".md", "")}`,
        filename,
        link: `/${GITHUB_TRENDING}/${year}/${filename.replace(".md", "")}`,
        sourcePath,
        destPath,
        order: -1
      });
    });
    docs.reverse();
    data[year] = docs;
  }
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
function generateSide(
  menuData: Record<string, DocRecord[]>
): DefaultTheme.Sidebar {
  const sideTree: DefaultTheme.Sidebar = [];
  for (const year in menuData) {
    const yearSide: DefaultTheme.SidebarItem = {
      text: year,
      collapsed: true,
      items: menuData[year]
    };
    sideTree.push(yearSide);
  }
  sideTree.reverse();
  return sideTree;
}

/**
 * 生成文档资源
 */
export async function generateDoc() {
  // 拉取仓库
  await fetchGit("https://github.com/jafshare/GithubTrending.git", cacheDir);
  // 解析目录
  const docRecords = await parseDir(join(cacheDir, "archived"));
  // 生成 meta 文件，供 vitepress 使用
  await writeJSON(
    join(cacheDir, "meta.json"),
    // TODO md5 gen
    { slide: generateSide(docRecords), md5: "test", createTime: Date.now() },
    { spaces: 2 }
  );
  // 遍历获取所有的 docs
  const docs: DocRecord[] = Object.keys(docRecords).reduce((prev, cur) => {
    // @ts-expect-error
    prev.push(...docRecords[cur]);
    return prev;
  }, []);
  // 初始化文件
  await cloneDocs(docs);
}
