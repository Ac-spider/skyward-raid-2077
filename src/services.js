"use strict";

/* =====================================================================
 * 1.5) 音效钩子(WebAudio 合成)
 * ===================================================================== */
const Sound = {
  enabled: true, volume: 1, ctx: null, noiseBuf: null,
  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    this.ctx = new AC();
    const n = Math.floor(this.ctx.sampleRate * 0.5), buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    this.noiseBuf = buf;
  },
  resume() { this.init(); if (this.ctx && this.ctx.state === "suspended") this.ctx.resume(); },
  tone(freq, dur, type, gain, glideTo) {
    if (!this.enabled || !this.ctx || this.volume <= 0) return;
    const t = this.ctx.currentTime, o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type || "square"; o.frequency.setValueAtTime(freq, t);
    if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
    g.gain.setValueAtTime(gain * this.volume, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.ctx.destination); o.start(t); o.stop(t + dur);
  },
  noise(dur, gain, fromFreq) {
    if (!this.enabled || !this.ctx || this.volume <= 0) return;
    const t = this.ctx.currentTime, s = this.ctx.createBufferSource(), g = this.ctx.createGain(), f = this.ctx.createBiquadFilter();
    s.buffer = this.noiseBuf; f.type = "lowpass"; f.frequency.setValueAtTime(fromFreq || 1500, t); f.frequency.exponentialRampToValueAtTime(200, t + dur);
    g.gain.setValueAtTime(gain * this.volume, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(this.ctx.destination); s.start(t); s.stop(t + dur);
  },
  shoot()      { this.tone(880, 0.03, "square", 0.012); },
  // GG:按敌机体型分级的爆炸音色 —— 小的短促尖锐,大的低沉更有分量
  explosion(tier) {
    if (tier === "large") { this.noise(0.42, 0.32, 900); this.tone(90, 0.35, "sawtooth", 0.16, 40); }
    else if (tier === "medium") { this.noise(0.32, 0.27, 1200); this.tone(130, 0.22, "sawtooth", 0.14, 50); }
    else this.noise(0.2, 0.2, 1900);
  },
  hit()        { this.tone(160, 0.15, "sawtooth", 0.18, 70); },
  powerup()    { this.tone(520, 0.08, "square", 0.14); this.tone(780, 0.10, "square", 0.12); },
  bomb()       { this.noise(0.5, 0.4, 2600); this.tone(120, 0.5, "sawtooth", 0.2, 40); },
  bossDefeat() { this.noise(0.7, 0.35, 1800); this.tone(300, 0.7, "square", 0.2, 60); },
  start()      { this.tone(440, 0.08, "square", 0.12); this.tone(660, 0.10, "square", 0.12); },
};

/* =====================================================================
 * 1.52) BGM(M)—— WebAudio 合成的循环音乐,由主循环按 dt 步进,仅在对局时发声
 * ===================================================================== */
// UU:BGM 重做 —— 原来 lead 用方波、几乎没有起音过渡、BOSS 战还把音符密度和速度一起翻倍,
// 听起来就是又急又冲的"滴滴滴"报警声。这次把音色换软、加了起音渐入和低通滤波去掉数码毛刺、
// 音符时值拉长做legato(而不是一个个孤立的短促音块),BOSS 的紧张感改由"低音更沉+周期性持续低音铺底"来营造,
// 而不是单纯地提速加密——听觉上更接近"紧张的配乐"而不是"闹钟"。
const Music = {
  playing: false, step: 0, timer: 0, stepDur: 0.18, gain: 0.09,
  enabled: true, volume: 0.8,   // JJ:独立于 Sound 的音乐开关/音量(共用同一个 Sound.ctx 这个 AudioContext,但音量/开关分开)
  // W2:世界1-3独立根音,世界4复用世界1(原有设计不变);世界5起改用第4个根音——如果只是简单取模(5-1)%3 又会绕回世界2,
  //   听不出"新世界"的差异,所以下面 update() 里对 world>=5 单独给了固定的第4档,不再走纯取模。
  roots: [220.0, 174.6, 196.0, 246.9],
  endlessRoot: 164.8,   // X3:无尽模式专属根音(比世界1-5都更低更沉),不跟着 game.world 每40秒切换背景一起变,给无尽一个统一、更有"终章感"的基调
  bass: [0, 0, 7, 0, 5, 5, 3, 7],                       // 相对根音半音级
  lead: [12, 15, 19, 22, 19, 15, 17, 12],
  bossBass: [0, 3, 0, 3, 5, 3, 7, 5],   // BOSS 战低音型音程更紧张(小三度),但节奏不再加密
  play() { this.playing = true; this.step = 0; this.timer = 0; },
  stop() { this.playing = false; },
  update(dt) {
    if (!this.playing || !this.enabled || this.volume <= 0 || !Sound.ctx || game.state !== "playing") return;
    const boss = !!game.boss, tense = boss || game.endless;   // X3:无尽模式全程当"紧张态"处理(低音型+持续铺底),不只是撞到BOSS才有终章感
    // X4:无尽模式的"紧张强度"随存活时间缓慢爬升(5分钟/300秒封顶),而不是从进无尽的第一秒就和后面一样强——
    //   只加音量/音色的浓度,不碰节奏/速度(碰速度就是重蹈 v2.9 之前"加速=报警声"的坑,见 memory 里的教训)。
    //   刻意不让它超过真正BOSS战的强度(boss 分支数值不变),BOSS战依然是全场最紧张的时刻。
    const ei = game.endless ? clamp(game._endlessT / 300, 0, 1) : 0;
    const stepDur = this.stepDur * (boss ? 0.92 : 1);   // UU:只轻微提速(之前 0.72 太急),避免报警感
    this.timer -= dt;
    if (this.timer > 0) return;
    this.timer += stepDur;
    const wi = game.world <= 4 ? (game.world - 1) % 3 : 3, root = game.endless ? this.endlessRoot : this.roots[wi], i = this.step % 8;
    const bassArr = tense ? this.bossBass : this.bass;
    this._note(root / 2 * Math.pow(2, bassArr[i] / 12), stepDur * 1.5, "triangle", this.gain * (boss ? 1.1 : (game.endless ? 1 + ei * 0.15 : 1)), 1100);
    if (i % 2 === 0) this._note(root * Math.pow(2, this.lead[i] / 12), stepDur * 1.3, "triangle", this.gain * (boss ? 0.5 : (game.endless ? 0.40 + ei * 0.10 : 0.42)), 2400);
    // UU:BOSS战紧张感靠"每循环一次的持续低音铺底"而不是靠加速加密——氛围感,不刺耳
    // X3:无尽模式全程都铺这层持续低音(音量比BOSS战略低,避免一直很吵),而不是只有撞上BOSS的35秒才有,让整局无尽都有终章般的氛围感
    if (tense && i === 0) this._note(root / 4, stepDur * 7.5, "sine", boss ? 0.06 : (0.03 + ei * 0.025), 480);
    this.step++;
  },
  // UU:加了柔和起音(15ms 线性渐入,消掉数码"咔"声)+ 低通滤波(滤掉刺耳的高频毛刺,音色更圆润)
  _note(freq, dur, type, gain, cutoff) {
    const c = Sound.ctx, t = c.currentTime, o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    f.type = "lowpass"; f.frequency.setValueAtTime(cutoff || 2200, t);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain * this.volume, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f).connect(g).connect(c.destination); o.start(t); o.stop(t + dur);
  },
};

/* =====================================================================
 * 1.55) 震动反馈钩子(navigator.vibrate;仅部分手机支持,不支持自动无视)
 *       想调震感强度就改各函数的时长/节奏数组。V 键可开关。
 * ===================================================================== */
const Haptics = {
  enabled: true,
  buzz(pattern) { if (this.enabled && typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(pattern); },
  hit()        { this.buzz(60); },
  bomb()       { this.buzz([0, 45, 30, 45]); },
  bossDefeat() { this.buzz([0, 90, 40, 130]); },
  powerup()    { this.buzz(20); },
};

/* =====================================================================
 * 1.57) 设置(localStorage 持久化:音量 / 音效 / 震动 / 上次难度)
 * ===================================================================== */
const Settings = {
  key: "kzts_settings",
  // JJ:音效/音乐拆成独立音量+独立开关(原来共用一个 volume,音乐音效没法分别调)
  data: { sfxVolume: 0.8, musicVolume: 0.7, sound: true, music: true, haptics: true, diff: "normal", ship: "balanced", autoNext: true, hideWings: false, seenTutorial: false, controlMode: "drag" },
  load() {
    try {
      const s = JSON.parse(localStorage.getItem(this.key));
      if (s) {
        // JJ:旧存档只有单一 volume 字段,迁移到新的 sfxVolume/musicVolume,避免老玩家音量突然被清零
        if (s.volume != null && s.sfxVolume == null) s.sfxVolume = s.volume;
        if (s.volume != null && s.musicVolume == null) s.musicVolume = s.volume;
        Object.assign(this.data, s);
      }
    } catch (e) {}
    this.apply();
  },
  save() { try { localStorage.setItem(this.key, JSON.stringify(this.data)); } catch (e) {} },
  apply() { Sound.enabled = this.data.sound; Sound.volume = this.data.sfxVolume; Music.enabled = this.data.music; Music.volume = this.data.musicVolume; Haptics.enabled = this.data.haptics; },
  set(k, v) { this.data[k] = v; this.apply(); this.save(); },
};

/* =====================================================================
 * 1.58) 关卡进度(localStorage:每关是否通关 / 最高分 / 通关难度)
 * ===================================================================== */
const Progress = {
  key: "kzts_progress", data: {},
  load() { try { this.data = JSON.parse(localStorage.getItem(this.key)) || {}; } catch (e) { this.data = {}; } },
  save() { try { localStorage.setItem(this.key, JSON.stringify(this.data)); } catch (e) {} },
  // 星数 = 最高通关难度 rank(简单1/普通2/困难3);高难度过关不会被低难度降级
  record(id, score, diffKey, rank) {
    const p = this.data[id] || { best: 0, diffRank: 0, diff: null, cleared: false };
    p.cleared = true;
    if (score > p.best) p.best = score;
    if (rank > (p.diffRank || 0)) { p.diffRank = rank; p.diff = diffKey; }
    this.data[id] = p; this.save();
  },
  entry(id) { return this.data[id] || null; },
  isCleared(id) { const p = this.data[id]; return !!(p && p.cleared); },
  clearAll() { this.data = {}; this.save(); },
};

/* =====================================================================
 * 1.6) 分数排行(localStorage,file:// 不可用时回退内存)
 *      Q:按关卡 id 分开存放,排行榜只显示当前关卡的排行情况。
 * ===================================================================== */
const Leaderboard = {
  key: "kzts_scores", max: 5, _mem: {},
  loadAll() { try { return JSON.parse(localStorage.getItem(this.key)) || {}; } catch (e) { return this._mem; } },
  saveAll(all) { try { localStorage.setItem(this.key, JSON.stringify(all)); } catch (e) { this._mem = all; } },
  load(id) { return this.loadAll()[id] || []; },
  submit(id, score) {
    const all = this.loadAll(), l = all[id] || [];
    l.push({ score: score, date: new Date().toISOString().slice(0, 10) });
    l.sort((a, b) => b.score - a.score);
    const top = l.slice(0, this.max); all[id] = top; this.saveAll(all); return top;
  },
  clearAll() { try { localStorage.removeItem(this.key); } catch (e) {} this._mem = {}; },
};

// F:无尽模式独立排行榜
const EndlessBoard = {
  key: "kzts_endless", max: 5, _mem: [],
  load() { try { return JSON.parse(localStorage.getItem(this.key)) || []; } catch (e) { return this._mem; } },
  saveList(list) { try { localStorage.setItem(this.key, JSON.stringify(list)); } catch (e) { this._mem = list; } },
  submit(score) { const l = this.load(); l.push({ score, date: new Date().toISOString().slice(0, 10) }); l.sort((a, b) => b.score - a.score); const top = l.slice(0, this.max); this.saveList(top); return top; },
  clearAll() { try { localStorage.removeItem(this.key); } catch (e) {} this._mem = []; },
};

// OO:成就系统 —— 定义 + 持久化。check* 系列在对应结算/事件点调用,内部自己判断解锁条件、去重、弹提示。
const ACHIEVEMENTS = [
  { id: "first_clear",  icon: "🏅", name: "初露锋芒", desc: "通关任意一关" },
  { id: "all_clear",    icon: "👑", name: "全线告捷", desc: "通关全部关卡" },
  { id: "no_hit",       icon: "🛡", name: "完美无伤", desc: "满血通关一关" },
  { id: "no_bomb",      icon: "💎", name: "轻装上阵", desc: "不用炸弹通关一关" },
  { id: "combo_30",     icon: "🔥", name: "连击大师", desc: "单局连击达到 30" },
  { id: "boss_slayer",  icon: "⚔", name: "屠龙勇士", desc: "累计击败 20 次 BOSS" },
  { id: "endless_5min", icon: "⏱", name: "持久战士", desc: "无尽模式存活 5 分钟" },
  { id: "all_ships",    icon: "🛩", name: "全机长征", desc: "体验过全部机型" },
  { id: "void_slayer",  icon: "🌀", name: "虚空终结者", desc: "击败最终 BOSS「虚空吞噬者」" },
];
const Achievements = {
  key: "kzts_achievements",
  data: { unlocked: {}, bossKills: 0, shipsUsed: [] },
  load() { try { const s = JSON.parse(localStorage.getItem(this.key)); if (s) Object.assign(this.data, s); } catch (e) {} },
  save() { try { localStorage.setItem(this.key, JSON.stringify(this.data)); } catch (e) {} },
  isUnlocked(id) { return !!this.data.unlocked[id]; },
  clearAll() { try { localStorage.removeItem(this.key); } catch (e) {} this.data = { unlocked: {}, bossKills: 0, shipsUsed: [] }; },
  unlock(id) {
    if (this.data.unlocked[id]) return;
    this.data.unlocked[id] = true; this.save();
    const def = ACHIEVEMENTS.find(a => a.id === id);
    if (def) { game.banner("🏆 成就达成", def.name); Sound.powerup(); }
  },
  trackShipUse(key) {
    if (!this.data.shipsUsed.includes(key)) { this.data.shipsUsed.push(key); this.save(); }
    if (CONFIG.shipOrder.every(k => this.data.shipsUsed.includes(k))) this.unlock("all_ships");
  },
  trackBossKill(defIndex) { this.data.bossKills++; this.save(); if (this.data.bossKills >= 20) this.unlock("boss_slayer"); if (defIndex === 6) this.unlock("void_slayer"); },
  checkLevelClear({ hpRatio, bombsUsed, maxCombo }) {
    this.unlock("first_clear");
    if (hpRatio >= 0.999) this.unlock("no_hit");
    if (bombsUsed === 0) this.unlock("no_bomb");
    if (maxCombo >= 30) this.unlock("combo_30");
    if (Object.values(Progress.data).filter(p => p.cleared).length >= LEVELS.length) this.unlock("all_clear");
  },
  checkEndlessEnd({ time, maxCombo }) {
    if (time >= 300) this.unlock("endless_5min");
    if (maxCombo >= 30) this.unlock("combo_30");
  },
};

// PP:存档导入导出 —— 单文件双击运行没有后端也没有文件下载习惯,用 window.prompt 展示/读取 JSON 文本最省事,
// 复制粘贴即可备份/换设备,零依赖不用引入任何下载/剪贴板 API。
const SaveData = {
  keys: ["kzts_settings", "kzts_progress", "kzts_scores", "kzts_endless", "kzts_achievements"],
  exportAll() {
    const out = { _game: "skywardRaid2077", _v: 1 };
    for (const k of this.keys) { const v = localStorage.getItem(k); if (v != null) out[k] = v; }
    return JSON.stringify(out);
  },
  importAll(jsonStr) {
    let obj;
    try { obj = JSON.parse(jsonStr); } catch (e) { return false; }
    if (!obj || typeof obj !== "object" || obj._game !== "skywardRaid2077") return false;
    for (const k of this.keys) { if (obj[k] != null) { try { localStorage.setItem(k, obj[k]); } catch (e) {} } }
    Settings.load(); Progress.load(); Achievements.load();
    game.diff = CONFIG.difficulties[Settings.data.diff] || CONFIG.difficulties.normal;
    game.ship = CONFIG.ships[Settings.data.ship] || CONFIG.ships.balanced;
    return true;
  },
};
