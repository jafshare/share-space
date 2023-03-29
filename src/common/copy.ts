import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync
} from "node:fs";
import path from "node:path";
import {
  ensureFile,
  ensureFileSync,
  exists,
  readFile,
  readdir,
  stat,
  writeFile
} from "fs-extra";
/**
 * 拷贝文件，如果 提供了目录，则批量拷贝目录下的所有文件，并提供 transform 用于单独处理特殊文件
 * @param src
 * @param dest
 * @param transform
 */
export function copySync(
  src: string,
  dest: string,
  options?: {
    transformContent?: (data: {
      content: string;
      src: string;
      dest: string;
    }) => string;
    transformDestPath?: (data: { src: string; dest: string }) => string;
  }
) {
  const srcStat = statSync(src);
  // 如果时文件夹则需要依次遍历
  if (srcStat.isDirectory()) {
    // 判断 dest 必须为目录
    if (existsSync(dest)) {
      const destStat = statSync(dest);
      if (!destStat.isDirectory()) throw new Error("dest必须为一个目录");
    }
    const children = readdirSync(src);
    children.forEach((child) => {
      const childPath = path.join(src, child);
      const destPath = path.join(dest, child);
      copySync(childPath, destPath, options);
    });
  } else {
    const content = readFileSync(src, { encoding: "utf-8" });
    const finalDest = options?.transformDestPath
      ? options.transformDestPath({ src, dest })
      : dest;
    // 保证文件有效
    ensureFileSync(finalDest);
    writeFileSync(
      finalDest,
      options?.transformContent
        ? options.transformContent({ content, src, dest })
        : content
    );
  }
}
/**
 * 拷贝文件(异步版本)，如果 提供了目录，则批量拷贝目录下的所有文件，并提供 transform 用于单独处理特殊文件
 * @param src
 * @param dest
 * @param transform
 */
export async function copy(
  src: string,
  dest: string,
  options?: {
    transformContent?: (data: {
      content: string;
      src: string;
      dest: string;
    }) => string;
    transformDestPath?: (data: { src: string; dest: string }) => string;
  }
) {
  const srcStat = await stat(src);
  // 如果时文件夹则需要依次遍历
  if (srcStat.isDirectory()) {
    // 判断 dest 必须为目录
    if (await exists(dest)) {
      const destStat = await stat(dest);
      if (!destStat.isDirectory()) throw new Error("dest必须为一个目录");
    }
    const children = await readdir(src);
    for await (const child of children) {
      const childPath = path.join(src, child);
      const destPath = path.join(dest, child);
      copySync(childPath, destPath, options);
    }
  } else {
    const content = await readFile(src, { encoding: "utf-8" });
    const finalDest = options?.transformDestPath
      ? options.transformDestPath({ src, dest })
      : dest;
    // 保证文件有效
    await ensureFile(finalDest);
    await writeFile(
      finalDest,
      options?.transformContent
        ? options.transformContent({ content, src, dest })
        : content
    );
  }
}
