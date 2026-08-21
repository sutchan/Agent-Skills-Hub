// app/components/SkillDialog.tsx v1.14.72 — 技能详情弹窗（对齐 prototype .overlay/.dialog/.sheet）
// 桌面端用居中 Dialog，移动端（≤640px）自动改用底部 Sheet 抽屉；内容体复用 SkillDetail。
import { useEffect, useState } from "react";
import type { Skill } from "@/lib/types";
import { Dialog } from "./ui/dialog";
import { Sheet } from "./ui/sheet";
import { SkillDetail } from "./skill-detail";

interface Props {
  skill: Skill | null;
  lang: "zh" | "en";
  toast: (msg: string) => void;
  onClose: () => void;
}

export function SkillDialog({ skill, lang, toast, onClose }: Props) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  if (!skill) return null;

  if (isMobile) {
    return (
      <Sheet open onClose={onClose} labelledBy="dialogTitle">
        <SkillDetail skill={skill} lang={lang} toast={toast} onClose={onClose} />
      </Sheet>
    );
  }
  return (
    <Dialog open onClose={onClose} labelledBy="dialogTitle">
      <SkillDetail skill={skill} lang={lang} toast={toast} onClose={onClose} />
    </Dialog>
  );
}
