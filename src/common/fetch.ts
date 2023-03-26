import { join } from "node:path";
import gitly from "gitly";
/**
 * 从 git 仓库 clone
 * @param repo
 * @param dest
 * @returns
 */
export async function fetchGit(repo: string, dest: string) {
  return gitly(repo, dest, {
    throw: true,
    temp: join(__dirname, "../../.cache")
  });
}
