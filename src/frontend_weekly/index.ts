/**
 * 针对 https://github.com/ascoders/weekly 文档的单独处理
 */
import fs from "node:fs";
import { join } from "node:path";
import type { DefaultTheme } from "vitepress";
import fg from "fast-glob";
import { copySync } from "../common/copy";
import { FRONTEND_WEEKLY } from "../../common/constant";
const cacheDir = `./.cache/${FRONTEND_WEEKLY}`;

/**
 * 解析 markdown 文档，
 * @param filePath
 */
async function parseMarkdown(
  filePath: string
): Promise<Record<string, DocRecord[]>> {
  const content = fs.readFileSync(filePath, "utf-8");
  // match: ### 前沿技术
  const menuGroupRE = /^### (.+) *$/;
  const lines = content.split("\n");
  const data: Record<string, DocRecord[]> = {};
  for (const line of lines) {
    // parse menuGroup
    const menuGroupResult = menuGroupRE.exec(line);
    if (menuGroupResult) {
      data[menuGroupResult[1]] = [];
    }
  }
  // 由于文档文件名有中文编码有问题需要通过遍历文件夹获取
  for (const groupName in data) {
    const children = await fg(["*.md"], {
      cwd: join(cacheDir, groupName),
      objectMode: true,
      onlyFiles: true,
      absolute: true
    });
    data[groupName].push(
      ...children.map((child) => {
        const titleRE = /^((\d+).+)\.md$/;
        const titleResult = titleRE.exec(child.name);
        if (titleResult) {
          const filename = titleResult?.[2];
          return {
            title: titleResult?.[1],
            sourcePath: child.path,
            destPath: join(`./docs/src/${FRONTEND_WEEKLY}`, `${filename}.md`),
            link: `/${FRONTEND_WEEKLY}/${filename}`,
            order: parseInt(titleResult?.[2])
          } as DocRecord;
        } else {
          // 回退
          return {
            title: child.name,
            sourcePath: child.path,
            destPath: join(`./docs/src/${FRONTEND_WEEKLY}`, child.name),
            link: `/${FRONTEND_WEEKLY}/${child.name}`
          };
        }
      })
    );
    // 排序
    data[groupName].sort((a, b) => {
      if (a.order && b.order) {
        return a.order - b.order;
      }
      return 1;
    });
  }
  return data;
}

async function cloneDocs(docs: DocRecord[]) {
  for await (const doc of docs) {
    await copySync(doc.sourcePath, doc.destPath, {
      transformContent: ({ content, src, dest }) => {
        let transformedContent: string = content;
        // 内部链接跳转(比如217)
        const inlineLinkRE =
          /https:\/\/github.com\/ascoders\/weekly\/blob\/master\/([^\/]+\/)*(\d+)\..+.md/g;
        transformedContent = transformedContent.replace(
          inlineLinkRE,
          (_, __, name) => {
            return `./${name}`;
          }
        );
        console.log(">>>>tag:", dest);
        if (dest.endsWith("6.md")) {
          // 处理 6.精读《JavaScript 错误堆栈处理》.md 的 script 未闭合的问题
          transformedContent = transformedContent.replace(
            "<script>",
            "`<script>`"
          );
        } else if (dest.endsWith("25.md")) {
          // 处理 25.精读《null >= 0?》.md的空资源引用
          transformedContent = transformedContent.replace(
            `<img src="assets/24/gt.jpeg" width="500" alt="logo" />`,
            ""
          );
        } else if (dest.endsWith("26.md")) {
          console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
          // 处理 26.精读《加密媒体扩展》.md 的 video 标签问题
          const videoRE = /<video( \/)?>/g;
          transformedContent = transformedContent.replace(videoRE, (tag) => {
            return `\`${tag}\``;
          });
        } else if (dest.endsWith("145.md")) {
          // 处理 145.精读《React Router v6》未闭合的标签
          transformedContent = transformedContent
            .replace(
              "### <Switch> 更名为 <Routes>",
              "### `<Switch>` 更名为 `<Routes>`"
            )
            .replace("### <Route> 升级", "### `<Route>` 升级");
        } else if (dest.endsWith("217.md")) {
          // 处理 217.精读《15 大 LOD 表达式 - 下》.md 在 vitepress 下的插值语法错误
          transformedContent = transformedContent.replace(
            "| { include : max([Date]) } |",
            "| { `include : max([Date])` } |"
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
  for (const group in menuData) {
    const groupMenu: DefaultTheme.SidebarItem = {
      text: group,
      collapsed: true,
      items: []
    };
    for (const menu of menuData[group]) {
      groupMenu.items!.push({
        text: menu.title,
        link: menu.link
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
  // TODO 拉取仓库
  // await fetchGit("git@github.com:ascoders/weekly.git", cacheDir);
  // 解析目录
  const docRecords = await parseMarkdown(join(cacheDir, "readme.md"));
  // 生成 meta 文件，供 vitepress 使用
  fs.writeFileSync(
    join(cacheDir, "meta.json"),
    JSON.stringify(
      // TODO md5 gen
      { slide: generateSide(docRecords), md5: "test", createTime: Date.now() },
      null,
      2
    )
  );
  const docs: DocRecord[] = Object.keys(docRecords).reduce((prev, cur) => {
    // @ts-expect-error
    prev.push(...docRecords[cur]);
    return prev;
  }, []);
  // 初始化文件
  cloneDocs(docs);
}
