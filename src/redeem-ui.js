"use strict";

/* =====================================================================
 * RG9) 兑换码——游戏内弹窗(替代 window.prompt),风格沿用联机浮窗那套"玻璃质感+渐变描边"视觉,
 *   但做成居中弹窗而不是贴边浮窗(兑换码是一次性强互动,不需要像联机面板那样常驻可收起)。
 * ===================================================================== */
const RedeemUI = {
  _ui: null,
  init() {
    const stage = document.getElementById("stage");
    if (!stage) return;
    const overlay = document.createElement("div");
    overlay.className = "redeem-overlay hidden";
    overlay.innerHTML = `
      <div class="redeem-panel">
        <div class="redeem-head">
          <div class="redeem-title">兑换码</div>
          <button class="redeem-close" type="button" data-redeem-close>✕</button>
        </div>
        <div class="redeem-body">
          <input class="redeem-input" type="text" data-redeem-input placeholder="输入兑换码" autocomplete="off" maxlength="40">
          <div class="redeem-msg" data-redeem-msg></div>
          <button class="redeem-confirm" type="button" data-redeem-confirm>兑换</button>
        </div>
      </div>`;
    stage.appendChild(overlay);
    this._ui = {
      overlay,
      input: overlay.querySelector("[data-redeem-input]"),
      msg: overlay.querySelector("[data-redeem-msg]"),
    };
    overlay.querySelector("[data-redeem-close]").addEventListener("click", () => this.close());
    overlay.addEventListener("click", (e) => { if (e.target === overlay) this.close(); });   // 点遮罩空白处关闭,不动面板内的输入
    overlay.querySelector("[data-redeem-confirm]").addEventListener("click", () => this.submit());
    this._ui.input.addEventListener("keydown", (e) => { if (e.key === "Enter") this.submit(); });
  },
  open() {
    if (!this._ui) return;
    this._ui.overlay.classList.remove("hidden");
    this._ui.msg.textContent = ""; this._ui.msg.className = "redeem-msg";
    this._ui.input.value = "";
    setTimeout(() => this._ui.input.focus(), 30);
  },
  close() {
    if (!this._ui) return;
    this._ui.overlay.classList.add("hidden");
  },
  submit() {
    if (!this._ui || typeof game === "undefined") return;
    const ok = game.redeemGearCode(this._ui.input.value);
    this._ui.msg.textContent = ok ? "兑换成功!已获得一整套魂能装备" : "兑换码无效";
    this._ui.msg.className = "redeem-msg " + (ok ? "redeem-ok" : "redeem-fail");
    if (ok) this._ui.input.value = "";
  },
};
window.RedeemUI = RedeemUI;
window.addEventListener("DOMContentLoaded", () => RedeemUI.init());
