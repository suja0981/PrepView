import { InferSchemaType, Schema, Types, model } from "mongoose";

const questionSchema = new Schema(
  {
    interviewId: {
      type: Types.ObjectId,
      ref: "Interview",
      required: true,
      index: true,
    },

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

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },

    order: {
      type: Number,
      required: true,
    },

    isFollowUp: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export type Question = InferSchemaType<typeof questionSchema>;

export const QuestionModel = model("Question", questionSchema);
