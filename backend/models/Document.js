import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["STUDENT_ID", "EDU_DOC", "PARENT_NID"], required: true },
    url: { type: String, required: true },
    filename: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { timestamps: true }
);

const Document = mongoose.model("Document", documentSchema);
export default Document;
