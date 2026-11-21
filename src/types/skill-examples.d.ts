// src/types/skill-examples.d.ts v1.16.26 — 技能示例依赖的宽松模块声明
//
// skills/ 下的 .ts/.tsx 是技能文档中的参考示例（模板/片段），依赖的第三方包
// 不属于本应用依赖，也从不参与站点构建。本地 tsconfig 已 exclude skills，
// 但 Vercel 构建链存在全仓 tsc 扫描（include **/*.ts，无 skills 排除），
// 会把这些示例当成应用源码并报 TS2307。本声明同时被「应用 tsconfig 的
// src/**/*.ts」与「全仓扫描的 **/*.ts」命中，使两条路径均可干净通过。
//
// 若将来应用真正引入下列包，请删除对应声明以恢复真实类型检查。
declare module '@clerk/nextjs';
declare module '@clerk/nextjs/server';
declare module 'remotion';
declare module '@maptiler/sdk';
declare module '@turf/turf';
// 这两个模块在示例中只以 `import type { ... }` 使用，必须导出同名类型，
// 否则 shorthand 声明会被当成 namespace 而报 TS2709。
declare module '~/threads/thread-manager' {
  export type ThreadManager = any;
}
declare module '~/threads/types' {
  export type LaceEventType = any;
  export type LaceEvent = any;
}
