import { InferSchemaType, Schema, Types, model } from "mongoose";

const evaluationSchema = new Schema(
  {
    answerId: {
      type: Types.ObjectId,
      ref: "Answer",
      required: true,
      unique: true,
    },

    interviewId: {
      type: Types.ObjectId,
      ref: "Interview",
      required: true,
      index: true,
    },
    technicalAccuracy: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },

    reasoning: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },

    communication: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },

    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },

    feedback: {
      type: String,
      required: true,
    },

    weakTopics: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export type Evaluation = InferSchemaType<typeof evaluationSchema>;

export const EvaluationModel = model("Evaluation", evaluationSchema);
