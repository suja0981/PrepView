import { InferSchemaType, Schema, Types, model } from "mongoose";

const reportSchema = new Schema(
  {
    interviewId: {
      type: Types.ObjectId,
      ref: "Interview",
      required: true,
      unique: true,
      index: true,
    },

    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },

    technicalScore: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },

    communicationScore: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },

    reasoningScore: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },

    strengths: {
      type: [String],
      default: [],
    },

    improvements: {
      type: [String],
      default: [],
    },

    summary: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export type Report = InferSchemaType<typeof reportSchema>;

export const ReportModel = model("Report", reportSchema);
