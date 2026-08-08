// prototype/lib/utils.ts — 1.7.0
// shadcn/ui 工具：合并 className（clsx + tailwind-merge）
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
