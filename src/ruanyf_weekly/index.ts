/**
 * 针对 https://github.com/ruanyf/weekly 文档的单独处理
 */
import { join } from "node:path";
import type { DefaultTheme } from "vitepress";
import { readFile, writeJSON } from "fs-extra";
import { copy } from "../common/copy";
import { fetchGit } from "../common/fetch";
import { RUANYF_WEEKLY } from "../../common/constant";
const cacheDir = `./.cache/${RUANYF_WEEKLY}`;
/**
 * 解析 markdown 文档，
 * @param filePath
 */
async function parseMarkdown(
  filePath: string
): Promise<Record<string, Record<string, DocRecord[]>>> {
  const content = await readFile(filePath, "utf-8");
  // match: ## 2021
  const yearRE = /^## (20\d+) *$/;
  // match: **二月** 、 ** 三月**、
  const monthRE = /^(\*\*)? *(.+月) *(\*\*)?$/;
  // match: - 第 20 期：[不读大学的替代方案](docs/issue-20.md)
  const issueRE = /^- (第 *\d+ *期).+\[(.+)\]\((.+)\)$/;
  const lines = content.split("\n");
  let year;
  let month;
  const data: Record<string, Record<string, DocRecord[]>> = {};
  for (const line of lines) {
    // parse year
    const yearResult = yearRE.exec(line);
    if (yearResult) {
      year = yearResult[1];
      data[year] = {};
      continue;
    }
    // parse month
    const monthResult = monthRE.exec(line);
    if (monthResult) {
      month = monthResult[2];
      data[year as string][month] = [];
      continue;
    }
    // parse issue
    const issueResult = issueRE.exec(line);
    if (issueResult) {
      const issue = issueResult[1];
      const title = issueResult[2];
      const sourcePath = issueResult[3];
      const filename = sourcePath.replace("docs/", "");
      data[year as string][month as string].push({
        text: `${issue}: ${title}`,
        filename,
        sourcePath: join(cacheDir, sourcePath),
        destPath: join(`./docs/src/${RUANYF_WEEKLY}`, filename),
        link: `/${RUANYF_WEEKLY}/${filename.replace(".md", "")}`,
        order: -1
      });
    }
  }
  return data;
}

async function cloneDocs(docs: DocRecord[]) {
  for await (const doc of docs) {
    await copy(doc.sourcePath, doc.destPath, {
      transformContent: ({ content }) => {
        let transformedContent: string = content;
        const fileLinkRE =
          /http[s]?:\/\/www.ruanyifeng.com\/blog\/.*(issue-[0-9]+)\.html/g;
        // 处理 http://www.ruanyifeng.com/blog/ 地址的跳转, 避免跳转到旧页面
        transformedContent = transformedContent.replace(
          fileLinkRE,
          (val, filename) => {
            return `./${filename}`;
          }
        );
        const filename = doc.filename;
        // TODO 还有一些如 http://www.ruanyifeng.com/blog/2018/07/my-books.html、http://www.ruanyifeng.com/blog/2018/07/my-books.html 需要处理
        // 处理 issue-8 <span data-type="color" style="color:rgb(34, 34, 34)"> 未闭合的问题
        if (filename === "issue-8.md") {
          transformedContent = transformedContent.replace(/<span[^<>]+>/g, "");
        } else if (filename === "issue-82.md") {
          // 处理 issue-82 %EF%BC%9A 地址跳转问题
          transformedContent = transformedContent.replace("%EF%BC%9A", "");
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
  menuData: Record<string, Record<string, DocRecord[]>>
): DefaultTheme.Sidebar {
  const sideTree: DefaultTheme.Sidebar = [];
  for (const year in menuData) {
    const yearSide: DefaultTheme.SidebarItem = {
      text: year,
      collapsed: true,
      items: []
    };
    for (const month in menuData[year]) {
      const monthSide: DefaultTheme.SidebarItem = {
        text: month,
        collapsed: true,
        items: []
      };
      yearSide.items!.push(monthSide);
      for (const item of menuData[year][month]) {
        monthSide.items!.push(item);
      }
    }
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
  await fetchGit("https://github.com/ruanyf/weekly.git", cacheDir);
  // 解析目录
  const docRecords = await parseMarkdown(join(cacheDir, "README.md"));
  // 生成 meta 文件，供 vitepress 使用
  await writeJSON(
    join(cacheDir, "meta.json"),
    // TODO md5 gen
    { slide: generateSide(docRecords), md5: "test", createTime: Date.now() },
    { spaces: 2 }
  );
  // 遍历获取所有的 docs
  const docs: DocRecord[] = Object.keys(docRecords).reduce((prev, cur) => {
    prev.push(
      ...Object.keys(docRecords[cur]).reduce((p, c) => {
        (p as DocRecord[]).push(...docRecords[cur][c]);
        return p;
      }, [])
    );
    return prev;
  }, []);
  // 初始化文件
  await cloneDocs(docs);
}
