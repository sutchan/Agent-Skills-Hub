// app/components/HeroNet.tsx v1.14.51 — Hero 节点网（确定性 SSR 渲染）
// 对齐 prototype 04-interactions.js renderHeroNodes：按分类计数生成环绕核心的节点网，
// 半径随技能数非线性放大、连线带 SMIL 流动点。改用确定性角度布局（替代原型随机分布），
// 使服务端渲染与客户端首屏 DOM 完全一致——消除水合不匹配与布局抖动（CLS）。
// 节点交互（hover 高亮卡片 / click 切分类）经父级 <svg> 事件委托处理，本组件纯渲染无副作用。

import { catHue } from "../lib/catHue";

const HERO_W = 800;
const HERO_H = 240;
const CORE_X = HERO_W * 0.75;
const CORE_Y = HERO_H / 2;

export interface HeroCatCount {
  cat: string;
  count: number;
}

export function HeroNet({ cats }: { cats: HeroCatCount[] }) {
  const n = cats.length;
  const vals = cats.map((c) => c.count);
  const min = vals.length ? Math.min(...vals) : 0;
  const max = vals.length ? Math.max(...vals) : 0;
  const nodes = cats.map((c, i) => {
    // 确定性角度均匀分布，避免随机导致 SSR/CSR 不一致
    const ang = (i / Math.max(1, n)) * Math.PI * 2 - Math.PI / 2;
    const rad = 110 + (i % 3) * 18;
    const x = CORE_X + Math.cos(ang) * rad;
    const y = CORE_Y + Math.sin(ang) * rad;
    const t = max > min ? (c.count - min) / (max - min) : 0.5;
    const r = 6 + Math.pow(t, 1.4) * 14; // 半径 ~6~20 随计数非线性
    return { cat: c.cat, count: c.count, x, y, r, i };
  });

  return (
    <svg
      className="hero-net"
      id="heroNet"
      viewBox={`0 0 ${HERO_W} ${HERO_H}`}
      preserveAspectRatio="xMidYMid slice"
      overflow="visible"
      aria-hidden="true"
    >
      <g id="netLines" stroke="hsl(var(--line))" strokeWidth={1.4} opacity={0.6}>
        {nodes.map((p) => (
          <line key={`l-${p.i}`} className="net-line" x1={CORE_X} y1={CORE_Y} x2={p.x} y2={p.y} />
        ))}
        {nodes.map((p, i) => (
          <circle key={`d-${p.i}`} className="net-dot" r={2.2}>
            <animateMotion
              dur={`${(4 + (i % 5) * 0.7).toFixed(1)}s`}
              repeatCount="indefinite"
              path={`M${CORE_X} ${CORE_Y} L${p.x.toFixed(1)} ${p.y.toFixed(1)}`}
            />
          </circle>
        ))}
      </g>
      <circle className="hub-glow" cx={CORE_X} cy={CORE_Y} r={42} fill="hsl(var(--node) / .18)" />
      <g id="netNodes" fill="hsl(var(--node))">
        {nodes.map((p) => (
          <circle
            key={`n-${p.i}`}
            className="hub-node"
            cx={p.x}
            cy={p.y}
            r={p.r}
            data-cat={p.cat}
            role="button"
            tabIndex={0}
            aria-label={`${p.cat} ${p.count}`}
            style={{ animationDelay: `${-(5.5 * p.i / Math.max(1, n)).toFixed(2)}s` }}
          />
        ))}
      </g>
      <circle className="hub-node hub-core" cx={CORE_X} cy={CORE_Y} r={16} fill="hsl(var(--primary))" />
    </svg>
  );
}
