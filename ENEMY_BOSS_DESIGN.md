# 全新敌机与 BOSS 设计案

本文档用于后续扩展《空中突袭》的普通敌机、精英局面和 BOSS。设计目标是保持当前轻量 Canvas 架构: 先用配置和少量 `Enemy` / `Boss` 行为扩展验证玩法，再补图片素材；图片缺失时仍可用 Canvas 兜底。

## 设计原则

- 每个新单位只引入一个核心压力点，让玩家能在 1 秒内读懂它危险在哪里。
- 所有高伤害行为必须有预警: 线、圈、倒计时闪烁或明显蓄力动作。
- 新敌机优先制造走位、击杀优先级和炸弹使用时机，不靠纯粹堆血。
- Boss 阶段要有节奏差异: 第一阶段教机制，第二阶段组合机制，第三阶段压缩安全区但保留可躲空间。
- 所有机制都应能在无尽模式中单独抽取为事件或 Boss 词缀。

## 新敌机总览

| Key | 中文名 | 定位 | 首次建议出现 | 核心玩法 |
| --- | --- | --- | --- | --- |
| `beacon` | 信标机 | 目标标记 | 世界 3 后半 | 标记玩家位置，延迟呼叫一束低宽度锁定弹雨 |
| `mineLayer` | 布雷机 | 区域封锁 | 世界 4 | 周期投放慢速浮雷，限制横向逃生路线 |
| `phaseWing` | 相位翼 | 位移压迫 | 世界 4 后半 | 预警后横向闪现到另一航道并发射短扇形弹 |
| `mirrorDrone` | 折镜无人机 | 子弹角度变化 | 世界 5 | 被击中后短暂反射一枚慢速侧向弹，不反射激光 |
| `tether` | 牵引机 | 软控制 | 世界 5 | 靠近时轻微拖拽玩家，逼迫优先击杀或用炸弹解围 |
| `warden` | 监押机 | 编队核心 | 无尽 180 秒后 | 为附近敌机提供护甲层，死亡后护甲消失 |
| `harvester` | 收割机 | 风险奖励 | 无尽事件 | 尝试吸走掉落道具，击杀后返还强化补给 |

## 普通敌机设计

### `beacon` 信标机

- 外观: 深蓝小型侦察机，机腹有黄色信标灯，轮廓窄而长。
- 行为: 进入屏幕后不立刻开火，每隔 2.8 秒在玩家当前位置放置一个红色小准星；0.75 秒后从屏幕上方沿准星 x 坐标落下一列 3 发慢速弹。
- 反制: 看到准星后横移即可躲开；击杀信标机可取消未触发的准星。
- 数值草案: `hp 6`, `speed 95`, `radius 21`, `score 520`, `markDelay 0.75`, `markShots 3`, `bulletSpeed 300`, `damage 8`。
- 实现提示: 在 `Enemy.update` 中增加 `_beaconTimer` 和 `game.spawnDelayedColumn(x, delay, count)`；若先做最小版，可直接在延迟结束时用 `spawnEnemyBullet` 生成竖直子弹。

### `mineLayer` 布雷机

- 外观: 橙黑色厚壳运输机，机腹有两个圆形投弹舱。
- 行为: 慢速下落，周期投放浮雷；浮雷会缓慢下沉并在玩家接近时闪烁，0.45 秒后爆成 8 向低速弹。
- 反制: 提前清掉布雷机；浮雷爆炸前有闪烁窗口，玩家可离开半径。
- 数值草案: `hp 13`, `speed 68`, `radius 27`, `score 760`, `mineInterval 2.2`, `mineRadius 18`, `triggerRadius 70`, `ringCount 8`, `ringSpeed 170`, `damage 9`。
- 实现提示: 可以先复用 `detonator` 的死亡环弹逻辑，把浮雷当作 `EnemyBullet` 的特殊慢速弹；完整实现再加轻量 `Mine` 对象池。

### `phaseWing` 相位翼

- 外观: 紫白色双翼截击机，左右翼像折叠刀片，机体边缘有相位残影。
- 行为: 进入中上屏后短暂停顿，显示目标航道虚影，0.55 秒后横向闪现到该位置，并向下发射 5 发短扇形弹。
- 反制: 虚影出现后不要站在其下方；闪现后有 0.4 秒硬直，适合爆发输出。
- 数值草案: `hp 8`, `speed 120`, `radius 22`, `score 680`, `blinkDelay 0.55`, `blinkRange 170`, `fireInterval 2.4`, `shots 5`, `damage 8`。
- 实现提示: 只改 `Enemy.applyMove` 和 `drawRoleAura` 就能做第一版；用半透明轮廓画出目标点。

### `mirrorDrone` 折镜无人机

- 外观: 银青色菱形无人机，中央有棱镜核心，体型小但亮度高。
- 行为: 每次受到普通子弹伤害后，如果反射冷却结束，就向左右随机一侧发射一枚慢速横向弹；激光、炸弹和导弹不触发反射。
- 反制: 用激光/导弹快速处理；或者站位避开侧向弹路线。
- 数值草案: `hp 7`, `speed 105`, `radius 20`, `score 650`, `reflectCd 0.9`, `reflectSpeed 230`, `damage 7`。
- 实现提示: 在敌机受伤路径传入伤害来源会更干净；最小版可只在 `Enemy.damage` 内按冷却反射，不区分来源。

### `tether` 牵引机

- 外观: 青绿色圆盘机，机体两侧有电磁线圈。
- 行为: 不主动开火；当玩家进入 `pullRadius` 后出现牵引线，玩家位移会被轻微拉向牵引机。
- 反制: 牵引强度低，不会直接杀人；玩家可以继续移动或用炸弹清掉。
- 数值草案: `hp 14`, `speed 62`, `radius 26`, `score 820`, `pullRadius 260`, `pullStrength 95`。
- 实现提示: 当前已有 `jamFactor` 这类区域影响，可在 `game` 增加 `pullVectorAt(player.x, player.y)`，再在玩家移动合成时叠加一个很小的向量。

### `warden` 监押机

- 外观: 蓝灰色重型护卫机，四角有护盾投射器。
- 行为: 给半径内最多 4 个非 Boss 敌机加一层薄护甲；护甲优先吸收伤害，监押机死亡后护甲立即解除。
- 反制: 优先集火监押机；也可以用炸弹快速破盾。
- 数值草案: `hp 18`, `speed 58`, `radius 30`, `score 920`, `guardRadius 155`, `guardShield 8`, `maxTargets 4`。
- 实现提示: 可复用 `shieldCarrier` 的护盾显示样式，但护盾来源标记为 `guardedBy`，避免和精英护盾混淆。

### `harvester` 收割机

- 外观: 暗金色高速掠夺机，机头朝下，底部有吸附爪。
- 行为: 优先飞向最近掉落道具；接触道具后将其吸收并进入 1 秒逃离状态。逃离前击杀会返还被吸收道具，并额外掉落一枚芯片或治疗。
- 反制: 玩家需要决定先捡道具还是先击杀它；无尽模式中可制造短促的风险奖励。
- 数值草案: `hp 10`, `speed 155`, `radius 23`, `score 720`, `stealRadius 210`, `escapeSpeed 230`, `bonusDropChance 0.35`。
- 实现提示: 只建议用于无尽事件，不放进普通主线高密度波次，避免移动目标过多导致阅读压力过大。

## 新 BOSS 总览

| 序号建议 | 名称 | 主题 | 关键机制 | 推荐世界/模式 |
| --- | --- | --- | --- | --- |
| 8 | 棱镜审判者 | 光束与折射 | 预警光束、折射侧弹、安全航道切换 | 世界 6-3 |
| 9 | 铁幕空母 | 召唤与护甲 | 护卫编队、护甲窗、甲板弱点 | 世界 7-3 |
| 10 | 引潮核心 | 牵引与区域 | 重力环、潮汐横移、中心吸引 | 世界 8-3 |
| 无尽专属 | 失控原型机 | 随机拼装 | 抽取两个旧 Boss 技能加一个新词缀 | 无尽 240 秒后 |

## BOSS 设计

### Boss 8: 棱镜审判者

- 外观: 银白六棱舰体，中心棱镜核心，左右有两片悬浮反射翼。
- 登场台词: `所有航线，都将被光校准。`
- 移动: `sweep` 横扫，但每次换向前短暂停顿，给玩家预判空间。
- 核心机制: 镭射不只瞄准玩家，也会在第二阶段开始后触发一次横向折射弹。折射弹速度慢、伤害低，用于切断回头路。

阶段设计:

| 血量 | 节奏 | 攻击组合 |
| --- | --- | --- |
| 100%-70% | 教学 | 瞄准镭射 + 5 发下压扇形弹 |
| 70%-35% | 组合 | 镭射后左右各放 3 枚慢速侧弹 + 稀疏墙弹 |
| 35%-0% | 压缩 | 双预警镭射交替 + 2 臂螺旋，安全区仍保留 90px 以上 |

数值草案:

```js
{
  name: "棱镜审判者",
  hp: 1900,
  radius: 72,
  score: 32000,
  damage: 14,
  shape: "hex",
  movement: "sweep",
  moveSpeed: 1.35,
  moveRange: 190
}
```

### Boss 9: 铁幕空母

- 外观: 深灰巨型航母舰，宽体甲板，左右有无人机弹射舱。
- 登场台词: `舰载群，展开铁幕。`
- 移动: `figure8` 小幅移动，主要威胁来自召唤和护甲窗口。
- 核心机制: Boss 周期性召唤两架护卫机；当护卫机存活时，Boss 获得 35% 减伤。护卫机死亡后 Boss 暴露 2.5 秒甲板弱点。

阶段设计:

| 血量 | 节奏 | 攻击组合 |
| --- | --- | --- |
| 100%-75% | 教学 | 少量 `medium` 护卫 + 6 发扇形弹 |
| 75%-40% | 压力 | `gunner` / `warden` 护卫轮换 + 墙弹 |
| 40%-0% | 爆发 | 护卫间隔缩短，Boss 使用环弹 + 瞄准弹，但阶段切换会清弹补给 |

反制:

- 优先击杀护卫，进入弱点窗口后爆发打 Boss。
- 炸弹可以同时清护卫和弹幕，但不要让炸弹成为唯一解。

数值草案:

```js
{
  name: "铁幕空母",
  hp: 2300,
  radius: 82,
  score: 38000,
  damage: 13,
  shape: "octagon",
  movement: "figure8",
  moveSpeed: 1.0,
  moveRange: 135
}
```

### Boss 10: 引潮核心

- 外观: 黑蓝色圆环舰体，中间是旋转重力核心，外圈有三段装甲环。
- 登场台词: `靠近核心，或被天空抛弃。`
- 移动: `dart` 短距离突进，但突进前有大范围圆形预警。
- 核心机制: 周期释放重力潮汐。潮汐不是强控，而是改变玩家横向惯性: 先向中心轻拉，再向外轻推，让玩家需要提前站位。

阶段设计:

| 血量 | 节奏 | 攻击组合 |
| --- | --- | --- |
| 100%-68% | 教学 | 重力环预警 + 慢速环弹 |
| 68%-32% | 走位 | 中心牵引 + 墙弹，墙弹安全口跟随玩家上一秒位置 |
| 32%-0% | 决战 | 外推潮汐 + 镭射航道 + 3 臂低速螺旋 |

反制:

- 潮汐强度应低于 `tether` 多机叠加的危险程度，重点是改变节奏，不是夺走控制权。
- 重力环释放前 0.8 秒需要明显的圆形预警。

数值草案:

```js
{
  name: "引潮核心",
  hp: 2600,
  radius: 78,
  score: 45000,
  damage: 15,
  shape: "star",
  movement: "dart",
  moveSpeed: 1.15,
  moveRange: 160
}
```

### 无尽专属 Boss: 失控原型机

- 外观: 非对称拼装舰，颜色由本轮词缀决定。
- 登场台词: `原型限制解除。`
- 生成规则: 从已击败 Boss 技能池抽取 2 个基础技能，再抽取 1 个新词缀。
- 目标: 让无尽后期 Boss 有变化，但不需要写大量独立 Boss。

可选新词缀:

| 词缀 | 效果 | 读法 |
| --- | --- | --- |
| `gravity` 引潮 | 每 7 秒释放一次轻牵引环 | Boss 外环出现蓝色旋转线 |
| `carrier` 空母 | 周期召唤 2 架普通护卫 | HUD 显示护卫倒计时 |
| `prismBurst` 棱爆 | 镭射结束后散出 6 枚慢速侧弹 | 镭射预警线两侧闪烁 |
| `weakDeck` 甲板 | 每 9 秒暴露弱点，弱点期间承伤提高 | Boss 中心变黄并显示弱点条 |

## 关卡投放建议

### 主线

- 世界 3 后半: 少量 `beacon`，用于教玩家看地面/航道预警。
- 世界 4: `mineLayer` 和 `phaseWing` 分开出现，不在同一波首次教学。
- 世界 5: `mirrorDrone` 与 `tether` 只在低密度波次出现，避免干扰机、支援机和牵引同时叠加。
- 世界 6: 引入 `warden`，配合 Boss 8 的棱镜主题。
- 世界 7: 引入 `harvester` 的剧情变体，但正式高收益版本留给无尽。

### 无尽

- 120 秒后: `beacon` 进入普通池，低权重。
- 160 秒后: `mineLayer` 进入事件池，不进入普通高频池。
- 180 秒后: `warden` 进入精英/护卫池。
- 210 秒后: `tether` 进入特殊事件池。
- 240 秒后: 失控原型机可替换普通无尽 Boss。

## 美术提示词草案

### 普通敌机

```text
top-down enemy beacon aircraft sprite, nose pointing down, dark navy scout drone, narrow body, bright yellow signal lamp under the hull, small antenna fins, readable arcade shooter silhouette, transparent background, centered, full body visible, 256x256, no text, no UI
```

```text
top-down enemy mine layer aircraft sprite, nose pointing down, orange black armored bomber drone, two round bomb bays under the hull, hazard stripe markings as graphic shapes, compact heavy silhouette, transparent background, centered, full body visible, 256x256, no text, no UI
```

```text
top-down enemy phase wing interceptor sprite, nose pointing down, purple white blade-wing fighter, folded knife-like side wings, faint phase energy edges, sharp fast silhouette, transparent background, centered, full body visible, 256x256, no text, no UI
```

```text
top-down enemy mirror drone sprite, nose pointing down, silver cyan diamond-shaped drone, central prism core, polished reflective armor plates, bright readable outline, transparent background, centered, full body visible, 256x256, no text, no UI
```

```text
top-down enemy tether aircraft sprite, nose pointing down, teal green electromagnetic saucer fighter, two coil emitters on the sides, circular compact hull, glowing energy cables implied by small emitter details, transparent background, centered, full body visible, 256x256, no text, no UI
```

```text
top-down enemy warden aircraft sprite, nose pointing down, blue gray heavy guard drone, four shield projector corners, reinforced square hull, pale blue armor glow, protective silhouette, transparent background, centered, full body visible, 256x256, no text, no UI
```

```text
top-down enemy harvester aircraft sprite, nose pointing down, dark gold fast raider drone, claw-like collector under the hull, sleek predatory body, small cargo pod, readable arcade shooter silhouette, transparent background, centered, full body visible, 256x256, no text, no UI
```

### BOSS

```text
top-down boss spaceship sprite, nose pointing down, prism judge warship, silver white hexagonal hull, huge central crystal prism core, two floating reflector wings, elegant dangerous arcade shooter boss silhouette, transparent background, centered, full body visible, 1024x1024, no text, no UI
```

```text
top-down boss spaceship sprite, nose pointing down, iron curtain carrier flagship, dark gray massive aircraft carrier hull, wide armored deck, side drone launch bays, heavy plating, glowing command bridge core, transparent background, centered, full body visible, 1024x1024, no text, no UI
```

```text
top-down boss spaceship sprite, nose pointing down, gravity tide core warship, black blue circular ring hull, rotating gravity reactor in the center, three segmented outer armor rings, cosmic blue energy, ominous readable boss silhouette, transparent background, centered, full body visible, 1024x1024, no text, no UI
```

```text
top-down boss spaceship sprite, nose pointing down, unstable prototype warship, asymmetrical modular hull, mixed armor plates from multiple boss designs, exposed experimental reactor, dangerous unfinished military prototype, transparent background, centered, full body visible, 1024x1024, no text, no UI
```

## 最小实现顺序

1. 先实现 `beacon`、`mineLayer`、Boss 8，因为它们主要复用现有预警、弹幕和镭射体系。
2. 再实现 `phaseWing`、`warden`、Boss 9，补足位移和护卫优先级。
3. 最后实现 `tether`、`harvester`、Boss 10 和失控原型机，因为它们会触碰玩家移动、掉落道具或无尽 Boss 生成规则。
4. 每加一种新敌机，先在单个固定波次验证，再加入无尽池。
5. 新素材接入时同步更新 `ASSET_PROMPTS.md` 和 `src/assets.js`，保持缺失兜底。

## 验证清单

- 新敌机首次出现时，同屏机制不超过 2 种。
- 高伤害攻击都有 0.45 秒以上预警。
- Boss 第三阶段安全通道宽度不低于玩家直径的 2.2 倍。
- 普通难度下，新 Boss 单场战斗时间目标为 75-110 秒。
- 简单难度下，牵引、浮雷和折射弹不能形成硬封锁。
- 无尽模式中，新机制事件一次只启用一种主压力。
