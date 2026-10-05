# Aurora Lens · 光影时刻

摄影辅助 Web 应用：日出日落、金调/蓝调时刻、能见度与拍摄环境、实时太阳/月亮位置与轨迹、月相、拍摄条件评分、未来 7 天时刻表。

## 运行

```bash
npm install
npm run dev
```

## 数据源

- 天气与能见度：[Open-Meteo](https://open-meteo.com)（免 API key）
- 城市搜索：Open-Meteo Geocoding（支持中文）
- 天体计算：[SunCalc](https://github.com/mourner/suncalc)（本地计算，无需网络）

## 调试

URL 加 `?t=HH:mm` 可冻结模拟时刻（如 `?t=19:30` 查看蓝调夜景背景与天体位置）。

## 结构

- `src/lib/astro.js` — 太阳/月亮位置、金调蓝调分档（高度角采样）、月相
- `src/lib/weather.js` — Open-Meteo 请求与拍摄条件评分
- `src/components/` — 玻璃卡片组件、动态天空背景、轨迹图
