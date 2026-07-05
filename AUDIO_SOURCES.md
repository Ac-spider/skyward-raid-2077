# Audio Sources

当前版本使用一首外部 MP3 做循环 BGM；射击、爆炸、道具等即时音效仍使用 `src/services.js` 里的 WebAudio 合成。

后续替换为素材时，只使用许可清楚的来源，并在本文件记录:

| File | Source URL | Author | License | Notes |
| --- | --- | --- | --- | --- |
| `assets/audio/above-the-sprawl.mp3` | User-provided local file: `C:/Users/liu_j/Downloads/Above_the_Sprawl.mp3` | Unknown | User-provided; confirm before public release | Main menu and gameplay BGM |

推荐优先级:

1. Kenney audio assets: 通常适合游戏原型，优先选 CC0 标注资源。
2. Freesound: 只下载 CC0 或项目许可明确兼容的素材。
3. OpenGameArt: 逐个资源检查 license，不按站点整体假设。
4. Pixabay sound effects: 检查当前 Pixabay Content License，记录下载页。

素材落地规则:

- 放在 `assets/audio/`。
- 文件名用小写英文和连字符，如 `laser-shot-01.ogg`。
- 同一个效果保留 2-4 个短变体即可，避免音频目录膨胀。
- 每个文件都必须在上表记录来源和许可。
