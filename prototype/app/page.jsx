// 路径: prototype/app/page.jsx 版本: 1.5.0
// 服务端组件：构建时读取 skills 数据并交给客户端展示组件。
import { getSiteData } from "@/lib/skills";
import Showcase from "./Showcase";

export default function Page() {
  const data = getSiteData();
  return <Showcase data={data} />;
}
