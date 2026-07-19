import { InferSchemaType, Schema, Types, model } from "mongoose";

const interviewSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    role: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["technical", "behavioral"],
      default: "technical",
    },
    mode: {
      type: String,
      enum: ["voice", "text"],
      default: "voice",
    },
    company: {
      type: String,
      trim: true,
      default: null,
    },
    techStacks: {
      type: String,
      trim: true,
      default: null,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },

    questionsAsked: {
      type: Number,
      default: 0,
    },

    startedAt: {
      type: Date,
    },

    endedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export type Interview = InferSchemaType<typeof interviewSchema>;

export const InterviewModel = model("Interview", interviewSchema);
