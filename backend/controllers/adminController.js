// backend/controllers/adminController.js
import Application from "../models/Application.js";
import TuitionPost from "../models/TuitionPost.js";
import User from "../models/User.js";
import mongoose from "mongoose";

export const getPendingUsers = async (_req, res) => {
  const users = await User.find({ status: "PENDING_VERIFICATION" }).select("-password");
  res.json(users);
};

export const verifyUser = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // "VERIFIED" or "REJECTED"
  if (!["VERIFIED", "REJECTED"].includes(status))
    return res.status(400).json({ message: "Invalid status" });
  const user = await User.findByIdAndUpdate(id, { status }, { new: true }).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

export const deleteApplicationByAdmin = async (req, res) => {
  const { applicationId } = req.params;
  const app = await Application.findById(applicationId);
  if (!app) return res.status(404).json({ message: "Not found" });
  if (app.status !== "REJECTED")
    return res.status(400).json({ message: "Only REJECTED apps can be deleted by admin" });
  await Application.deleteOne({ _id: app._id });
  res.json({ message: "Application deleted" });
};

export const deletePostByAdmin = async (req, res) => {
  const { postId } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const post = await TuitionPost.findById(postId).session(session);
    if (!post) throw new Error("Post not found");

    await Application.deleteMany({ post: postId }).session(session);
    await TuitionPost.deleteOne({ _id: postId }).session(session);

    await session.commitTransaction();
    session.endSession();
    res.json({ message: "Post and related applications deleted" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: err.message });
  }
};
