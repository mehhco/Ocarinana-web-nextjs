import { z } from "zod";

const noteValueSchema = z.enum(["1", "2", "3", "4", "5", "6", "7", "b7", "#6"]);
const durationSchema = z.enum(["1", "1/2", "1/4", "1/8", "1/16", "1/32"]);
const keySignatureSchema = z.enum(["C", "D", "E", "F", "G", "A", "B", "Bb", "Eb"]);
const timeSignatureSchema = z.enum(["2/4", "3/4", "4/4", "6/8", "9/8", "12/8"]);
const skinSchema = z.enum(["white", "light-beige", "light-blue"]);
const instrumentTypeSchema = z.enum(["12-hole", "6-hole"]);
const barlineTypeSchema = z.enum(["single", "double", "final", "repeat-start", "repeat-end"]);
const dynamicMarkSchema = z.enum(["p", "mp", "mf", "f"]);
const ornamentMarkSchema = z.enum(["upper-mordent", "lower-mordent"]);

export const scoreSettingsSchema = z.object({
  instrumentType: instrumentTypeSchema.default("12-hole"),
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
  line: z.union([z.literal(1), z.literal(2)]).optional().default(1),
  text: z.string(),
});

const expressionBaseSchema = z.object({
  id: z.string().min(1),
  measureIndex: z.number().int().nonnegative(),
  noteIndex: z.number().int().nonnegative(),
});

const dynamicExpressionSchema = expressionBaseSchema.extend({
  type: z.literal("dynamic"),
  value: dynamicMarkSchema,
});

const breathExpressionSchema = expressionBaseSchema.extend({
  type: z.literal("breath"),
  value: z.literal("breath"),
});

const ornamentExpressionSchema = expressionBaseSchema.extend({
  type: z.literal("ornament"),
  value: ornamentMarkSchema,
});

const expressionSchema = z.discriminatedUnion("type", [
  dynamicExpressionSchema,
  breathExpressionSchema,
  ornamentExpressionSchema,
]);

const scoreSectionSchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().min(1).max(12),
  anchor: z.object({
    measureId: z.string().min(1),
    beforeElementId: z.string().min(1).nullable(),
  }),
});

const scoreDocumentBaseSchema = z.object({
  version: z.string().default("1.0"),
  scoreId: z.string().optional(),
  ownerUserId: z.string().optional(),
  title: z.string().min(1).max(200).default("Untitled score"),
  producer: z.string().max(120).default("www.ocarinana.com"),
  lyricist: z.string().max(120).optional().default(""),
  composer: z.string().max(120).optional().default(""),
  additionalInfo: z.string().max(200).optional().default(""),
  measures: z.array(measureSchema).default([[]]),
  ties: z.array(tieSchema).default([]),
  beams: z.array(beamSchema).default([]),
  expressions: z.array(expressionSchema).default([]),
  lyrics: z.array(lyricSchema).default([]),
  sections: z.array(scoreSectionSchema).default([]),
  playbackOrder: z.array(z.string().min(1)).default([]),
  settings: scoreSettingsSchema.default({
    keySignature: "C",
    instrumentType: "12-hole",
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

function validateSectionReferences(
  data: z.infer<typeof scoreDocumentBaseSchema>,
  context: z.RefinementCtx
) {
  const measureById = new Map(
    data.measures.flatMap((measure) => (
      Array.isArray(measure) ? [] : [[measure.id, measure] as const]
    ))
  );
  const sectionIds = new Set<string>();
  const sectionLabels = new Set<string>();
  const sectionAnchors = new Set<string>();

  data.sections.forEach((section, index) => {
    const normalizedLabel = section.label.toLocaleLowerCase();
    const anchorKey = `${section.anchor.measureId}:${section.anchor.beforeElementId ?? '$end'}`;

    if (sectionIds.has(section.id)) {
      context.addIssue({
        code: 'custom',
        path: ['sections', index, 'id'],
        message: '段落 ID 不能重复',
      });
    }
    if (sectionLabels.has(normalizedLabel)) {
      context.addIssue({
        code: 'custom',
        path: ['sections', index, 'label'],
        message: '段落标签不能重复',
      });
    }
    if (sectionAnchors.has(anchorKey)) {
      context.addIssue({
        code: 'custom',
        path: ['sections', index, 'anchor'],
        message: '同一位置只能设置一个段落',
      });
    }

    const measure = measureById.get(section.anchor.measureId);
    if (!measure) {
      context.addIssue({
        code: 'custom',
        path: ['sections', index, 'anchor', 'measureId'],
        message: '段落锚定的小节不存在',
      });
    } else if (
      section.anchor.beforeElementId !== null &&
      !measure.elements.some((element) => element.id === section.anchor.beforeElementId)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['sections', index, 'anchor', 'beforeElementId'],
        message: '段落锚定的乐谱元素不存在',
      });
    }

    sectionIds.add(section.id);
    sectionLabels.add(normalizedLabel);
    sectionAnchors.add(anchorKey);
  });

  data.playbackOrder.forEach((sectionId, index) => {
    if (!sectionIds.has(sectionId)) {
      context.addIssue({
        code: 'custom',
        path: ['playbackOrder', index],
        message: '演奏顺序引用了不存在的段落',
      });
    }
  });
}

export const scoreDocumentSchema = scoreDocumentBaseSchema.superRefine(validateSectionReferences);

export const createScoreSchema = scoreDocumentBaseSchema.partial({
  scoreId: true,
  ownerUserId: true,
  createdAt: true,
  updatedAt: true,
}).superRefine(validateSectionReferences);

export const updateScoreSchema = scoreDocumentSchema;

export type ScoreDocument = z.infer<typeof scoreDocumentSchema>;
export type ScoreSettings = z.infer<typeof scoreSettingsSchema>;
export type CreateScoreInput = z.infer<typeof createScoreSchema>;
export type UpdateScoreInput = z.infer<typeof updateScoreSchema>;
