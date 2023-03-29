declare interface Meta {
  slide: any[];
  // 创建时间
  createTime: number;
  // 用于判断是否变更
  md5: string;
}

declare interface DocRecord {
  text: string;
  filename: string;
  sourcePath: string;
  destPath: string;
  link: string;
  order?: number;
}
