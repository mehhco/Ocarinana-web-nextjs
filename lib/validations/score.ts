import { z } from "zod";

const noteValueSchema = z.enum(["1", "2", "3", "4", "5", "6", "7", "b7"]);
const durationSchema = z.enum(["1", "1/2", "1/4", "1/8", "1/16", "1/32"]);
const keySignatureSchema = z.enum(["C", "D", "E", "F", "G", "A", "B", "Bb", "Eb"]);
const timeSignatureSchema = z.enum(["2/4", "3/4", "4/4", "6/8", "9/8", "12/8"]);
const skinSchema = z.enum(["white", "light-beige", "light-blue"]);
const barlineTypeSchema = z.enum(["single", "double", "final", "repeat-start", "repeat-end"]);
const dynamicMarkSchema = z.enum(["p", "mp", "mf", "f"]);

export const scoreSettingsSchema = z.object({
  keySignature: keySignatureSchema.default("C"),
  timeSignature: timeSignatureSchema.default("4/4"),
  tempo: z.number().min(40).max(300).default(120),
  showTempo: z.boolean().optional().default(true),
  skin: skinSchema.default("white"),
  showLyrics: z.boolean().optional().default(false),
  showFingering: z.boolean().optional().default(false),
});

const noteSchema = z.object({
  id: z.string().min(1),
  type: z.literal("note"),
  value: noteValueSchema,
  duration: durationSchema,
  hasHighDot: z.boolean().optional(),
  hasLowDot: z.boolean().optional(),
  hasAugmentationDot: z.boolean().optional(),
  lyrics: z.string().optional(),
});

const restSchema = z.object({
  id: z.string().min(1),
  type: z.literal("rest"),
  value: z.literal("0"),
  duration: durationSchema,
  restGroup: z.enum(["full", "half"]).optional(),
});

const extensionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("extension"),
  value: z.literal("-"),
  duration: durationSchema,
});

const barlineSchema = z.object({
  id: z.string().min(1),
  type: z.literal("barline"),
  value: z.literal("|"),
  barlineType: barlineTypeSchema.optional(),
});

const scoreElementSchema = z.discriminatedUnion("type", [
  noteSchema,
  restSchema,
  extensionSchema,
  barlineSchema,
]);

const v2MeasureSchema = z.object({
  id: z.string().min(1),
  elements: z.array(scoreElementSchema).default([]),
});

const legacyMeasureSchema = z.array(z.any());
const measureSchema = z.union([v2MeasureSchema, legacyMeasureSchema]);

const beamSchema = z.object({
  id: z.string().min(1),
  startMeasureIndex: z.number().int().nonnegative(),
  startNoteIndex: z.number().int().nonnegative(),
  endMeasureIndex: z.number().int().nonnegative(),
  endNoteIndex: z.number().int().nonnegative(),
  level: z.number().int().min(1).max(3),
});

const tieSchema = z.object({
  id: z.string().min(1),
  startMeasureIndex: z.number().int().nonnegative(),
  startNoteIndex: z.number().int().nonnegative(),
  endMeasureIndex: z.number().int().nonnegative(),
  endNoteIndex: z.number().int().nonnegative(),
});

const lyricSchema = z.object({
  measureIndex: z.number().int().nonnegative(),
  noteIndex: z.number().int().nonnegative(),
  text: z.string(),
});

const expressionSchema = z.object({
  id: z.string().min(1),
  measureIndex: z.number().int().nonnegative(),
  noteIndex: z.number().int().nonnegative(),
  type: z.literal("dynamic"),
  value: dynamicMarkSchema,
});

export const scoreDocumentSchema = z.object({
  version: z.string().default("1.0"),
  scoreId: z.string().optional(),
  ownerUserId: z.string().optional(),
  title: z.string().min(1).max(200).default("Untitled score"),
  measures: z.array(measureSchema).default([[]]),
  ties: z.array(tieSchema).default([]),
  beams: z.array(beamSchema).default([]),
  expressions: z.array(expressionSchema).default([]),
  lyrics: z.array(lyricSchema).default([]),
  settings: scoreSettingsSchema.default({
    keySignature: "C",
    timeSignature: "4/4",
    tempo: 120,
    showTempo: true,
    skin: "white",
    showLyrics: false,
    showFingering: false,
  }),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const createScoreSchema = scoreDocumentSchema.partial({
  scoreId: true,
  ownerUserId: true,
  createdAt: true,
  updatedAt: true,
});

export const updateScoreSchema = scoreDocumentSchema;

export type ScoreDocument = z.infer<typeof scoreDocumentSchema>;
export type ScoreSettings = z.infer<typeof scoreSettingsSchema>;
export type CreateScoreInput = z.infer<typeof createScoreSchema>;
export type UpdateScoreInput = z.infer<typeof updateScoreSchema>;
