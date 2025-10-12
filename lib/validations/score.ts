import { z } from "zod";

/**
 * 乐谱文档验证 Schema
 */

// 基础设置验证
export const scoreSettingsSchema = z.object({
  keySignature: z.enum(['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Bb', 'Eb']),
  timeSignature: z.enum(['2/4', '3/4', '4/4', '6/8', '9/8', '12/8']),
  tempo: z.number().min(40).max(300),
  skin: z.enum(['white', 'light-beige', 'light-blue']),
  showLyrics: z.boolean(),
  showFingering: z.boolean(),
});

// 完整乐谱文档验证
export const scoreDocumentSchema = z.object({
  version: z.string(),
  scoreId: z.string().optional(),
  ownerUserId: z.string().optional(),
  title: z.string().min(1).max(200),
  measures: z.array(z.array(z.any())),  // 音符数据（结构复杂，暂时用 any）
  ties: z.array(z.any()),                // 连音线数据
  lyrics: z.array(z.any()),              // 歌词数据
  settings: scoreSettingsSchema,
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// 创建乐谱请求验证
export const createScoreSchema = scoreDocumentSchema.partial({
  scoreId: true,
  ownerUserId: true,
  createdAt: true,
  updatedAt: true,
});

// 更新乐谱请求验证
export const updateScoreSchema = scoreDocumentSchema;

// 类型导出
export type ScoreDocument = z.infer<typeof scoreDocumentSchema>;
export type ScoreSettings = z.infer<typeof scoreSettingsSchema>;
export type CreateScoreInput = z.infer<typeof createScoreSchema>;
export type UpdateScoreInput = z.infer<typeof updateScoreSchema>;

