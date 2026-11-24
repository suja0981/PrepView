import { InferSchemaType, Schema, model } from "mongoose";

const questionBankSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["technical", "behavioral", "system_design", "mixed"],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    roles: {
      type: [String],
      default: [],
    },
    techStacks: {
      type: [String],
      default: [],
    },
    source: {
      type: String,
      enum: ["curated", "generated"],
      default: "curated",
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    avgEvalScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

questionBankSchema.index({ type: 1, difficulty: 1 });
questionBankSchema.index({ topic: 1 });
questionBankSchema.index({ roles: 1 });
questionBankSchema.index({ techStacks: 1 });
questionBankSchema.index({ avgEvalScore: -1, usageCount: 1 });

export type BankQuestion = InferSchemaType<typeof questionBankSchema>;
export const QuestionBankModel = model("QuestionBank", questionBankSchema);
