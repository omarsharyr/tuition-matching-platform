// backend/controllers/studentController.js
import TuitionPost from "../models/TuitionPost.js";

export const createPost = async (req, res) => {
  const { classLevel, subjects = [], location, schedule, payment } = req.body;
  const post = await TuitionPost.create({
    student: req.user._id,
    classLevel, subjects, location, schedule, payment,
  });
  res.status(201).json(post);
};

export const myPosts = async (req, res) => {
  const posts = await TuitionPost.find({ student: req.user._id }).sort("-createdAt");
  res.json(posts);
};

export const updatePost = async (req, res) => {
  const { id } = req.params;
  const post = await TuitionPost.findOneAndUpdate(
    { _id: id, student: req.user._id },
    req.body,
    { new: true }
  );
  if (!post) return res.status(404).json({ message: "Post not found" });
  res.json(post);
};

export const deletePost = async (req, res) => {
  const { id } = req.params;
  const post = await TuitionPost.findOneAndDelete({ _id: id, student: req.user._id });
  if (!post) return res.status(404).json({ message: "Post not found" });
  res.json({ message: "Deleted" });
};

export const browsePosts = async (req, res) => {
  const { subject, location, classLevel, q } = req.query;
  const filter = { isActive: true };
  if (subject) filter.subjects = subject;
  if (location) filter.location = new RegExp(location, "i");
  if (classLevel) filter.classLevel = classLevel;
  if (q) filter.$text = { $search: q };
  const posts = await TuitionPost.find(filter).sort("-createdAt");
  res.json(posts);
};
