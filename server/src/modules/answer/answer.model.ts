import { InferSchemaType, Schema, Types, model } from "mongoose";

const answerSchema = new Schema(
  {
    interviewId: {
      type: Types.ObjectId,
      ref: "Interview",
      required: true,
      index: true,
    },

    questionId: {
      type: Types.ObjectId,
      ref: "Question",
      required: true,
    },

    answer: {
      type: String,
      required: true,
      trim: true,
    },

    responseTime: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export type Answer = InferSchemaType<typeof answerSchema>;

export const AnswerModel = model("Answer", answerSchema);
