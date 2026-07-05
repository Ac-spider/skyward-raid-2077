"use strict";

/* =====================================================================
 * 2) 画布 & 自适应
 * ===================================================================== */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
// EE:高分屏适配 —— backing store 按 devicePixelRatio(封顶2,避免低端机因像素过多掉帧)放大,
// 再用 ctx.scale 抵消,这样后面所有绘制代码仍按 540×960 逻辑坐标写,不用改一行。
const DPR = Math.min(window.devicePixelRatio || 1, 2);
canvas.width = CONFIG.WIDTH * DPR; canvas.height = CONFIG.HEIGHT * DPR;
ctx.scale(DPR, DPR);
function fitToScreen() {
  const ratio = CONFIG.WIDTH / CONFIG.HEIGHT;
  let h = window.innerHeight * 0.98, w = h * ratio;
  if (w > window.innerWidth) { w = window.innerWidth; h = w / ratio; }
  const stage = document.getElementById("stage");
  stage.style.width = w + "px"; stage.style.height = h + "px";
  canvas.style.width = w + "px"; canvas.style.height = h + "px";
}
window.addEventListener("resize", fitToScreen); fitToScreen();
function toLogic(cx, cy) {
  const r = canvas.getBoundingClientRect();
  return { x: (cx - r.left) / r.width * CONFIG.WIDTH, y: (cy - r.top) / r.height * CONFIG.HEIGHT };
}
