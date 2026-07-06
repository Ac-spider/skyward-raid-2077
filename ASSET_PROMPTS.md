# 《空中突袭 2077》图片素材批量生图文档

这份文档用于一次性生成或重画游戏图片素材。当前游戏是竖屏 Canvas 空战，逻辑画布为 `540x960`，比例 `9:16`。背景建议生成 `1080x1920`，角色/敌机/Boss 建议生成透明 PNG。

请把每张图按本文的文件名保存到 `assets/images/` 对应目录。游戏目前可通过 `src/assets.js` 登记图片资源；如果图片缺失，仍会回退到 Canvas 绘制。

## 给生图会话的执行规则

1. 严格按“生成任务清单”逐张生成图片。
2. 除非生成工具需要确认，否则不要输出解释、设计说明、长列表或额外文本。
3. 每张图只包含一个主体；背景图除外。
4. 玩家飞机机头朝上；常规敌机和 Boss 机头朝下；自爆机 `kamikaze` 是从屏幕后方追撞的例外，机头朝上。
5. 飞机、敌机、Boss 使用透明背景 PNG；如果工具不支持透明，就使用纯绿背景 `#00ff00`，不要阴影。
6. 透明素材主体居中，完整可见，四周保留约 20% 留白，发光和尾焰不要碰到图片边缘。
7. 背景是俯视竖屏卷轴，不要做横版地平线、驾驶舱视角、第一人称视角。
8. 画面必须适合游戏实装：轮廓清晰、颜色区分明显、中心战斗区域不要过度杂乱。

## 通用风格后缀

可以追加到每条提示词末尾：

```text
top-down vertical scrolling sci-fi arcade shooter game art, readable silhouettes, polished semi-realistic 2D digital painting, clean shapes, crisp edges, luminous energy accents, metal panels, high contrast, production-ready game asset, no text, no logo, no UI
```

## 通用负面提示词

```text
text, logo, watermark, UI, label, numbers, letters, cockpit view, side view, first person view, perspective photo, photorealistic aircraft photo, human pilot, runway, realistic airport, blurry, noisy, low resolution, cropped subject, cut off wings, messy silhouette, busy background behind sprite, cast shadow, multiple separate ships in one sprite, accidental asymmetry, extra wings, extra engines, glow touching canvas edge
```

## 尺寸与文件规格

- 背景 `base`: `1080x1920`, 不透明 PNG/JPG 均可，最好 PNG。
- 背景 `mid`: `1080x1920`, 透明 PNG，中景视差层。
- 背景 `fg`: `1080x1920`, 透明 PNG，前景速度线/粒子层。
- 玩家飞机: `512x512`, 透明 PNG。
- 普通敌机: `256x256`, 透明 PNG。
- Boss: `1024x1024`, 透明 PNG；如果工具成本高，可用 `768x768`。
- 可选特效: `256x256` 或 spritesheet，透明 PNG。

## 生成任务清单

### A. 背景: 5 个世界，每个世界 3 层

#### `assets/images/backgrounds/world-01-base.png`

```text
top-down vertical scrolling sci-fi shooter background, futuristic coastal megacity above deep ocean, early morning blue atmosphere, distant harbor platforms, offshore defense towers, subtle neon cyan route lights, readable central flight lane, no strong horizon line, vertically loopable 9:16 composition, 1080x1920, polished 2D game background, no text, no UI
```

#### `assets/images/backgrounds/world-01-mid.png`

```text
transparent PNG parallax layer for a vertical shooter, floating offshore platforms, small cloud wisps, faint bridge segments, cyan holographic runway blocks, sparse midground objects, top-down view, vertically loopable, 1080x1920, no text, no UI
```

#### `assets/images/backgrounds/world-01-fg.png`

```text
transparent PNG foreground speed layer, thin rain-like speed streaks, small blue light particles, subtle mist trails, vertical motion feeling, sparse and readable, 1080x1920, no text, no UI
```

#### `assets/images/backgrounds/world-02-base.png`

```text
top-down vertical scrolling sci-fi shooter background, desert canyon military zone, orange sandstorm haze, buried futuristic ruins, armored outposts, radar stations, warm amber light, readable central flight lane, no strong horizon line, vertically loopable 9:16 composition, 1080x1920, polished 2D game background, no text, no UI
```

#### `assets/images/backgrounds/world-02-mid.png`

```text
transparent PNG parallax layer, desert dust clouds, half-buried metal platforms, small radar dishes, drifting sand ribbons, sparse canyon fragments, top-down vertical shooter layer, vertically loopable, 1080x1920, no text, no UI
```

#### `assets/images/backgrounds/world-02-fg.png`

```text
transparent PNG foreground speed layer, fast sand particles, amber speed streaks, tiny debris fragments, sparse enough for gameplay readability, vertical scrolling shooter, 1080x1920, no text, no UI
```

#### `assets/images/backgrounds/world-03-base.png`

```text
top-down vertical scrolling sci-fi shooter background, high altitude night battle above a futuristic city, dark indigo sky, distant city lights far below, purple blue storm clouds, orbital defense grid fragments, readable central lane, no strong horizon line, vertically loopable 9:16 composition, 1080x1920, polished 2D game background, no text, no UI
```

#### `assets/images/backgrounds/world-03-mid.png`

```text
transparent PNG parallax layer, purple storm clouds, distant drone silhouettes, soft neon grid fragments, thin orbital structures, sparse top-down vertical shooter objects, vertically loopable, 1080x1920, no text, no UI
```

#### `assets/images/backgrounds/world-03-fg.png`

```text
transparent PNG foreground speed layer, blue violet speed streaks, tiny electric sparks, small glowing particles, sparse and crisp, vertical motion feeling, 1080x1920, no text, no UI
```

#### `assets/images/backgrounds/world-04-base.png`

```text
top-down vertical scrolling sci-fi shooter background, forbidden abyss biomechanical fortress, dark crimson atmosphere, black red clouds, alien metal trenches, toxic green energy fissures, ominous but readable central flight lane, no strong horizon line, vertically loopable 9:16 composition, 1080x1920, polished 2D game background, no text, no UI
```

#### `assets/images/backgrounds/world-04-mid.png`

```text
transparent PNG parallax layer, jagged alien metal plates, red fog bands, green energy vents, floating biomechanical fragments, sparse top-down vertical shooter objects, vertically loopable, 1080x1920, no text, no UI
```

#### `assets/images/backgrounds/world-04-fg.png`

```text
transparent PNG foreground speed layer, crimson speed streaks, toxic green embers, small black debris, sparse and readable, vertical scrolling shooter, 1080x1920, no text, no UI
```

#### `assets/images/backgrounds/world-05-base.png`

```text
top-down vertical scrolling sci-fi shooter background, cosmic void corridor, deep black purple space, warped neon pathways, distant stars, geometric energy gates, mysterious final zone, readable central lane, no strong horizon line, vertically loopable 9:16 composition, 1080x1920, polished 2D game background, no text, no UI
```

#### `assets/images/backgrounds/world-05-mid.png`

```text
transparent PNG parallax layer, floating purple geometric gate pieces, translucent nebula ribbons, distant asteroid silhouettes, angular void architecture fragments, sparse top-down vertical shooter objects, vertically loopable, 1080x1920, no text, no UI
```

#### `assets/images/backgrounds/world-05-fg.png`

```text
transparent PNG foreground speed layer, violet speed lines, star particles, small glowing shards, sparse high contrast particles, vertical motion feeling, 1080x1920, no text, no UI
```

### B. 玩家飞机: 4 架

#### `assets/images/ships/player-balanced.png`

```text
top-down player spaceship sprite, nose pointing up, balanced delta wing fighter, blue white armor, single glowing cyan cockpit, compact readable arcade shooter silhouette, small side wing drone attachment points, polished sci-fi metal panels, transparent background, centered, full body visible, 512x512, no text, no UI
```

#### `assets/images/ships/player-attacker.png`

```text
top-down player spaceship sprite, nose pointing up, aggressive twin-engine attack fighter, red armor, sharp split wings, visible weapon pods, glowing orange thrusters, sleek high damage silhouette, polished sci-fi metal panels, transparent background, centered, full body visible, 512x512, no text, no UI
```

#### `assets/images/ships/player-defender.png`

```text
top-down player spaceship sprite, nose pointing up, heavy armored defender fighter, teal green armor, broad shield-like wings, thick plating, reinforced nose, sturdy bulky silhouette, subtle shield emitter details, transparent background, centered, full body visible, 512x512, no text, no UI
```

#### `assets/images/ships/player-scout.png`

```text
top-down player spaceship sprite, nose pointing up, fast scout interceptor, yellow gold accents, narrow dart shape, sleek small silhouette, stealth panels, sharp nose, compact thrusters, transparent background, centered, full body visible, 512x512, no text, no UI
```

### C. 普通敌机: 13 类

#### `assets/images/enemies/enemy-small.png`

```text
top-down enemy spaceship sprite, nose pointing down, small fast drone fighter, red armor, simple sharp triangular silhouette, one glowing red core, light interceptor design, transparent background, centered, full body visible, 256x256, no text, no UI
```

#### `assets/images/enemies/enemy-medium.png`

```text
top-down enemy spaceship sprite, nose pointing down, medium assault fighter, orange armor, twin tail fins, central dark cockpit core, readable arcade shooter silhouette, compact wing cannons, transparent background, centered, full body visible, 256x256, no text, no UI
```

#### `assets/images/enemies/enemy-large.png`

```text
top-down enemy spaceship sprite, nose pointing down, large heavy bomber, pink magenta armor, wide body, side pods, thick metal plating, visible armor seams, heavy but still readable silhouette, transparent background, centered, full body visible, 256x256, no text, no UI
```

#### `assets/images/enemies/enemy-gunner.png`

```text
top-down enemy gunner aircraft sprite, nose pointing down, blue violet armored gunship, boxy heavy hull, two visible forward cannons, white glowing reactor core, riveted armor plates, compact arcade shooter silhouette, transparent background, centered, full body visible, 256x256, no text, no UI
```

#### `assets/images/enemies/enemy-splitter.png`

```text
top-down enemy splitter drone sprite, nose pointing down, green cyan modular aircraft, three connected circular pods, segmented mechanical body, central connector bar, looks like it can split into smaller drones, transparent background, centered, full body visible, 256x256, no text, no UI
```

#### `assets/images/enemies/enemy-sniper.png`

```text
top-down enemy sniper aircraft sprite, nose pointing down, magenta precision fighter, long narrow barrel mounted on centerline, thin angular body, glowing targeting lens, dangerous clean silhouette, transparent background, centered, full body visible, 256x256, no text, no UI
```

#### `assets/images/enemies/enemy-detonator.png`

```text
top-down enemy mine drone sprite, circular detonator aircraft, yellow black hazard armor, mechanical explosive shell, cross-shaped warning pattern as graphic marking, compact round silhouette, no letters, transparent background, centered, full body visible, 256x256, no text, no UI
```

#### `assets/images/enemies/enemy-phantom.png`

```text
top-down enemy phantom interceptor sprite, nose pointing down, cyan armor, narrow body, blade-like side wings, slightly translucent energy edges, fast stealth silhouette, sharp readable outline, transparent background, centered, full body visible, 256x256, no text, no UI
```

#### `assets/images/enemies/enemy-carrier.png`

```text
top-down enemy mini carrier aircraft sprite, nose pointing down, purple armored carrier, thick hull, side launch bays, small drone ports, heavy but clearly smaller than a boss, glowing pale violet core, transparent background, centered, full body visible, 256x256, no text, no UI
```

#### `assets/images/enemies/enemy-shield-carrier.png`

```text
top-down enemy shield carrier sprite, nose pointing down, cyan blue armored transport, shield projector panels on the hull, broad protective silhouette, glowing pale blue core, built-in shield emitter details but no large outer bubble, transparent background, centered, full body visible, 256x256, no text, no UI
```

#### `assets/images/enemies/enemy-jammer.png`

```text
top-down enemy electronic warfare jammer aircraft sprite, nose pointing down, teal cyan diamond-shaped hull, antenna fins, concentric signal emitter details on the body, glowing electronic core, compact readable silhouette, no large external aura, transparent background, centered, full body visible, 256x256, no text, no UI
```

#### `assets/images/enemies/enemy-support.png`

```text
top-down enemy support repair drone sprite, nose pointing down, green medical repair aircraft, round compact hull, plus-shaped repair module as a symbol not text, small repair emitters, friendly-looking but still enemy military design, transparent background, centered, full body visible, 256x256, no text, no UI
```

#### `assets/images/enemies/enemy-kamikaze.png`

```text
top-down enemy kamikaze interceptor sprite, nose pointing up because it attacks from behind, compact red self-destruct aircraft, sharp triangular dart hull, white hazard cross marking as a graphic symbol, explosive reactor core, aggressive rear-chase silhouette, no letters, transparent background, centered, full body visible, 256x256, no text, no UI
```

### D. Boss: 7 架

#### `assets/images/bosses/boss-01-guard.png`

```text
top-down boss spaceship sprite, nose pointing down, fortress guard flagship, purple magenta delta hull, heavy armor plates, side cannons, glowing red core, broad intimidating arcade shooter boss silhouette, transparent background, centered, full body visible, 1024x1024, no text, no UI
```

#### `assets/images/bosses/boss-02-rotorblade.png`

```text
top-down boss spaceship sprite, nose pointing down, cross-shaped rotating blade warship, blue cyan armor, four blade wings arranged like a mechanical shuriken, glowing central reactor, sharp dangerous silhouette, visible armor seams, transparent background, centered, full body visible, 1024x1024, no text, no UI
```

#### `assets/images/bosses/boss-03-bomber.png`

```text
top-down boss spaceship sprite, nose pointing down, massive hexagonal bomber fortress, orange armor, missile bays, heavy plating, industrial military design, multiple bomb doors, glowing red core, transparent background, centered, full body visible, 1024x1024, no text, no UI
```

#### `assets/images/bosses/boss-04-twin-core-fortress.png`

```text
top-down boss spaceship sprite, nose pointing down, twin-core assault fortress, pink magenta armored delta hull, two synchronized glowing reactors, paired side cannons, layered armor plates, aggressive symmetrical silhouette, transparent background, centered, full body visible, 1024x1024, no text, no UI
```

#### `assets/images/bosses/boss-05-sky-fortress.png`

```text
top-down boss spaceship sprite, nose pointing down, huge sky fortress flagship, red pink hexagonal armored hull, many turret sockets, laser emitter ports, reinforced command core, final military stronghold silhouette, transparent background, centered, full body visible, 1024x1024, no text, no UI
```

#### `assets/images/bosses/boss-06-abyss-king.png`

```text
top-down boss spaceship sprite, nose pointing down, abyss king biomechanical star-shaped warship, black dark metal armor with toxic green energy, alien metal ribs, organic mechanical plates, glowing green reactor, ominous sharp silhouette, transparent background, centered, full body visible, 1024x1024, no text, no UI
```

#### `assets/images/bosses/boss-07-void-devourer.png`

```text
top-down final boss spaceship sprite, nose pointing down, octagonal void devourer fortress, black purple armor, cosmic energy core, geometric armor plates, gravity well reactor, sinister elegant final boss silhouette, transparent background, centered, full body visible, 1024x1024, no text, no UI
```

### E. 可选补充特效

这些不是第一优先级，因为代码里已有 Canvas 特效兜底。若要生成，建议后续单独做。

#### `assets/images/effects/player-missile.png`

```text
top-down missile game sprite, nose pointing up, small silver missile, orange engine flame, crisp arcade shooter projectile, transparent background, centered, full body visible, 256x256, no text, no UI
```

#### `assets/images/effects/laser-impact.png`

```text
transparent PNG game VFX sprite, blue white laser impact burst, circular sparks, crisp energy particles, bright center fading outward, centered, no background, 256x256, no text, no UI
```

#### `assets/images/effects/explosion-sheet.png`

```text
sprite sheet, 4 columns 4 rows, arcade sci-fi explosion animation, orange yellow fireball with dark smoke, transparent background, consistent centered frames, clean alpha edge, no text, no UI
```

## 建议生成顺序

如果要一次性全量生成，按上面的 A 到 D 顺序即可。

如果要节省时间，优先生成当前缺口：

1. `enemy-gunner.png`
2. `enemy-splitter.png`
3. `enemy-sniper.png`
4. `enemy-detonator.png`
5. `enemy-phantom.png`
6. `enemy-carrier.png`
7. `enemy-shield-carrier.png`
8. `enemy-jammer.png`
9. `enemy-support.png`
10. `enemy-kamikaze.png`
11. `boss-02-rotorblade.png`
12. `boss-03-bomber.png`
13. `boss-04-twin-core-fortress.png`
14. `boss-05-sky-fortress.png`
15. `boss-06-abyss-king.png`
16. `boss-07-void-devourer.png`

## 生成后接入参考

生成文件放好后，可在 `src/assets.js` 的 manifest 中登记：

```js
manifest: {
  player: {
    balanced: "assets/images/ships/player-balanced.png",
    attacker: "assets/images/ships/player-attacker.png",
    defender: "assets/images/ships/player-defender.png",
    scout: "assets/images/ships/player-scout.png",
  },
  enemy: {
    small: "assets/images/enemies/enemy-small.png",
    medium: "assets/images/enemies/enemy-medium.png",
    large: "assets/images/enemies/enemy-large.png",
    gunner: "assets/images/enemies/enemy-gunner.png",
    splitter: "assets/images/enemies/enemy-splitter.png",
    sniper: "assets/images/enemies/enemy-sniper.png",
    detonator: "assets/images/enemies/enemy-detonator.png",
    phantom: "assets/images/enemies/enemy-phantom.png",
    carrier: "assets/images/enemies/enemy-carrier.png",
    shieldCarrier: "assets/images/enemies/enemy-shield-carrier.png",
    jammer: "assets/images/enemies/enemy-jammer.png",
    support: "assets/images/enemies/enemy-support.png",
    kamikaze: "assets/images/enemies/enemy-kamikaze.png",
  },
  boss: {
    0: "assets/images/bosses/boss-01-guard.png",
    1: "assets/images/bosses/boss-02-rotorblade.png",
    2: "assets/images/bosses/boss-03-bomber.png",
    3: "assets/images/bosses/boss-04-twin-core-fortress.png",
    4: "assets/images/bosses/boss-05-sky-fortress.png",
    5: "assets/images/bosses/boss-06-abyss-king.png",
    6: "assets/images/bosses/boss-07-void-devourer.png",
  },
  background: {
    1: {
      base: "assets/images/backgrounds/world-01-base.png",
      mid: "assets/images/backgrounds/world-01-mid.png",
      fg: "assets/images/backgrounds/world-01-fg.png",
    },
    2: {
      base: "assets/images/backgrounds/world-02-base.png",
      mid: "assets/images/backgrounds/world-02-mid.png",
      fg: "assets/images/backgrounds/world-02-fg.png",
    },
    3: {
      base: "assets/images/backgrounds/world-03-base.png",
      mid: "assets/images/backgrounds/world-03-mid.png",
      fg: "assets/images/backgrounds/world-03-fg.png",
    },
    4: {
      base: "assets/images/backgrounds/world-04-base.png",
      mid: "assets/images/backgrounds/world-04-mid.png",
      fg: "assets/images/backgrounds/world-04-fg.png",
    },
    5: {
      base: "assets/images/backgrounds/world-05-base.png",
      mid: "assets/images/backgrounds/world-05-mid.png",
      fg: "assets/images/backgrounds/world-05-fg.png",
    },
  },
}
```

## 发给另一个会话的最短提示词

```text
请打开并严格执行 D:\SJTU\AI\Vibe_coding\飞机1\ASSET_PROMPTS.md。只按文档“生成任务清单”生成图片资源，使用文档里的文件名、尺寸、透明背景规则和负面提示词。不要输出解释、清单复述、设计说明或额外文本；如果必须回复，只回复生成结果文件。优先全量生成 A-D；若资源有限，只生成文档“当前缺口”列表。
```
