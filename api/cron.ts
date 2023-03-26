/**
 * 用于 vercel 定时执行的任务
 */
const https = require("node:https");
// @ts-nocheck
module.exports = function handler(req, res) {
  const apiReq = https.request(
    process.env.REGEN_URL as string,
    { method: "GET" },
    (apiRes) => {
      apiRes.setEncoding("utf8");
      apiRes.on("data", (res) => {
        console.log("recv data:", res);
      });
      apiRes.on("end", () => {
        res.send(`cron run ok`);
      });
    }
  );

  apiReq.on("error", (error) => {
    console.error(error);
    res.status(500).send("Internal Server Error");
  });
  apiReq.end();
};
