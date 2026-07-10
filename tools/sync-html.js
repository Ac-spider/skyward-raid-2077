"use strict";
// 工程收敛:「空中突袭.html」不再手工维护,由 index.html 生成——改完 index.html(尤其脚本版本号)后跑一次:
//   node tools/sync-html.js
// 两个入口文件内容始终保持逐字节一致,不会再出现忘了同步版本号导致一边缓存不失效的问题。
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const src = path.join(root, "index.html");
const dst = path.join(root, "空中突袭.html");
fs.copyFileSync(src, dst);
console.log("synced: index.html -> 空中突袭.html");
