"use strict";

const RivalInterference = {
  types: {
    ambush: { name: "伏击航道", sub: "额外敌机切入", weight: 3 },
    crossfire: { name: "交叉火线", sub: "侧向弹幕压迫", weight: 2 },
    elite: { name: "精英抢线", sub: "强化敌机提前入场", weight: 2 },
  },
  create(target) {
    if (!target || !target.seed) return null;
    const events = this.plan(target);
    return { target, events, cursor: 0, fired: [], points: events.reduce((sum, e) => sum + e.points, 0) };
  },
  plan(target) {
    const splits = Challenge.cleanSplits(target.splits);
    const marks = splits.length ? splits.map(s => s.t + 8) : [35, 70, 105];
    const rng = Challenge.rng([target.seed, target.ship || "balanced", target.sig || "", target.score || 0, "rival-v1"].join("|"));
    const types = Object.keys(this.types);
    const score = Math.max(0, Number(target.score) || 0);
    const basePoints = clamp(Math.ceil(score / 1200), 1, 4);
    return marks.slice(0, 3).map((t, i) => {
      const type = types[Math.floor(rng() * types.length) % types.length];
      const points = Math.max(1, basePoints + (splits[i] && splits[i].score > score * 0.35 ? 1 : 0));
      return { t, type, points, fired: false, label: this.types[type].name, sub: this.types[type].sub };
    });
  },
  next(state, time) {
    if (!state || state.cursor >= state.events.length) return null;
    const event = state.events[state.cursor];
    if (time < event.t) return null;
    state.cursor++;
    event.fired = true;
    state.fired.push({ t: Math.floor(time), type: event.type, points: event.points });
    return event;
  },
  summary(state) {
    if (!state) return null;
    const events = state.fired.map(e => Object.assign({}, e, { label: (this.types[e.type] && this.types[e.type].name) || e.type }));
    const typeCounts = {};
    events.forEach(e => { typeCounts[e.type] = (typeCounts[e.type] || 0) + 1; });
    return { total: state.events.length, fired: events.length, points: state.points, events, typeCounts };
  },
};
