// 路径: prototype/lib/skills.js 版本: 1.5.0
// 读取构建脚本生成的 skills 数据，供页面使用。
import data from "../data/skills.json";

/**
 * @typedef {Object} Skill
 * @property {string} name       技能英文名（目录名）
 * @property {string} zh_desc    中文描述
 * @property {string} en_desc    英文描述
 * @property {string} category   所属分类
 * @property {boolean} has_scripts
 * @property {boolean} has_references
 * @property {boolean} has_assets
 * @property {string} dir        目录路径
 */

/**
 * 返回完整站点数据。
 * @returns {{ meta: Object, categories: Array, skills: Skill[] }}
 */
export function getSiteData() {
  return data;
}
