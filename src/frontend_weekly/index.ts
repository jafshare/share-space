/**
 * 针对 https://github.com/ascoders/weekly 文档的单独处理
 */
import { join } from "node:path";
import { readFile, writeJson } from "fs-extra";
import type { DefaultTheme } from "vitepress";
import fg from "fast-glob";
import { fetchGit } from "../common/fetch";
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
  const content = await readFile(filePath, { encoding: "utf-8" });
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
            filename,
            sourcePath: child.path,
            destPath: join(`./docs/src/${FRONTEND_WEEKLY}`, `${filename}.md`),
            link: `/${FRONTEND_WEEKLY}/${filename}`,
            order: parseInt(titleResult?.[2])
          } as DocRecord;
        } else {
          // 回退
          return {
            title: child.name,
            filename: child.name,
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
        const filename = doc.filename;
        if (filename === "6") {
          // 处理 6.精读《JavaScript 错误堆栈处理》.md 的 script 未闭合的问题
          transformedContent = transformedContent.replace(
            "<script>",
            "`<script>`"
          );
        } else if (filename === "25") {
          // 处理 25.精读《null >= 0?》.md的空资源引用
          transformedContent = transformedContent.replace(
            `<img src="assets/24/gt.jpeg" width="500" alt="logo" />`,
            ""
          );
        } else if (filename === "26") {
          // 处理 26.精读《加密媒体扩展》.md 的 video 标签问题
          const videoRE = /<video( \/)?>/g;
          transformedContent = transformedContent.replace(videoRE, (tag) => {
            return `\`${tag}\``;
          });
        } else if (filename === "58") {
          // 处理 58.精读《Typescript2.0 - 2.9》.md 的泛型问题
          transformedContent = transformedContent.replace(
            `* Readonly<T>。把对象 key 全部设置为只读，或者利用 \`2.8\` 的条件类型语法，实现递归设置只读。
* Partial<T>。把对象的 key 都设置为可选。
* Pick<T, K>。从对象类型 T 挑选一些属性 K，比如对象拥有 10 个 key，只需要将 K 设置为 \`"name" | "age"\` 就可以生成仅支持这两个 key 的新对象类型。
* Extract<T, U>。是 Pick 的底层 API，直到 \`2.8\` 版本才内置进来，可以认为 Pick 是挑选对象的某些 key，Extract 是挑选 key 中的 key。
* Record<K, U>。将对象某些属性转换成另一个类型。比较常见用在回调场景，回调函数返回的类型会覆盖对象每一个 key 的类型，此时类型系统需要 \`Record\` 接口才能完成推导。
* Exclude<T, U>。将 T 中的 U 类型排除，和 Extract 功能相反。
* Omit<T, K>（未内置）。从对象 T 中排除 key 是 K 的属性。可以利用内置类型方便推导出来：\`type Omit<T, K> = Pick<T, Exclude<keyof T, K>>\`
* NonNullable<T>。排除 \`T\` 的 \`null\` 与 \`undefined\` 的可能性。
* ReturnType<T>。获取函数 \`T\` 返回值的类型，这个类型意义很大。
* InstanceType<T>。获取一个构造函数类型的实例类型。`,
            `* \`Readonly<T>\`。把对象 key 全部设置为只读，或者利用 \`2.8\` 的条件类型语法，实现递归设置只读。
* \`Partial<T>\`。把对象的 key 都设置为可选。
* \`Pick<T, K>\`。从对象类型 T 挑选一些属性 K，比如对象拥有 10 个 key，只需要将 K 设置为 \`"name" | "age"\` 就可以生成仅支持这两个 key 的新对象类型。
* \`Extract<T, U>\`。是 Pick 的底层 API，直到 \`2.8\` 版本才内置进来，可以认为 Pick 是挑选对象的某些 key，Extract 是挑选 key 中的 key。
* \`Record<K, U>\`。将对象某些属性转换成另一个类型。比较常见用在回调场景，回调函数返回的类型会覆盖对象每一个 key 的类型，此时类型系统需要 \`Record\` 接口才能完成推导。
* \`Exclude<T, U>\`。将 T 中的 U 类型排除，和 Extract 功能相反。
* \`Omit<T, K>\`（未内置）。从对象 T 中排除 key 是 K 的属性。可以利用内置类型方便推导出来：\`type Omit<T, K> = Pick<T, Exclude<keyof T, K>>\`
* \`NonNullable<T>\`。排除 \`T\` 的 \`null\` 与 \`undefined\` 的可能性。
* \`ReturnType<T>\`。获取函数 \`T\` 返回值的类型，这个类型意义很大。
* \`InstanceType<T>\`。获取一个构造函数类型的实例类型。`
          );
        } else if (filename === "145") {
          // 处理 145.精读《React Router v6》未闭合的标签
          transformedContent = transformedContent
            .replace(
              "### <Switch> 更名为 <Routes>",
              "### `<Switch>` 更名为 `<Routes>`"
            )
            .replace("### <Route> 升级", "### `<Route>` 升级");
        } else if (filename === "197") {
          // 处理 197.精读《低代码逻辑编排》中的插值导致的报错，解决方案参考 https://vitepress.dev/guide/using-vue
          transformedContent = transformedContent.replace(
            "`{{msg.payload}}`",
            "<span v-pre>`{{msg.payload}}`</span>"
          );
        } else if (filename === "217") {
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
        link: menu.link,
        sourcePath: menu.sourcePath,
        destPath: menu.destPath,
        filename: menu.filename,
        order: menu.order
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
  await fetchGit("git@github.com:ascoders/weekly.git", cacheDir);
  // 解析目录
  const docRecords = await parseMarkdown(join(cacheDir, "readme.md"));
  // 生成 meta 文件，供 vitepress 使用
  await writeJson(
    join(cacheDir, "meta.json"),
    // TODO md5 gen
    { slide: generateSide(docRecords), md5: "test", createTime: Date.now() }
  );
  // 遍历获取所有的 docs
  const docs: DocRecord[] = Object.keys(docRecords).reduce((prev, cur) => {
    // @ts-expect-error
    prev.push(...docRecords[cur]);
    return prev;
  }, []);
  // 初始化文件
  cloneDocs(docs);
}
