import mongoose from "mongoose";

const AnalysisSchema = new mongoose.Schema(
  {
    userId: { type: String, index: true },
    problemName: String,
    code: String,
    language: String,
    syntaxErrors: String,
    timeComplexity: String,
    spaceComplexity: String,
    explanation: String,
    improvements: String,
  },
  { timestamps: true }
);

export default mongoose.models.Analysis ||
  mongoose.model("Analysis", AnalysisSchema);
