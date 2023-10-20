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
        let transformedContent = content;
        if (doc.filename === "2023-10.md") {
          transformedContent = transformedContent.replace(
            "Simple HTML5 Charts using the <canvas> tag",
            "Simple HTML5 Charts using the `<canvas>` tag"
          );
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
  await fetchGit(
    "https://github.com/jafshare/GithubTrending.git#main",
    cacheDir
  );
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
