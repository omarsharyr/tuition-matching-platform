// backend/controllers/applicationController.js
import Application from "../models/Application.js";
import TuitionPost from "../models/TuitionPost.js";
import Chat from "../models/Chat.js";

export const applyToPost = async (req, res) => {
  const { postId, pitch } = req.body;
  const post = await TuitionPost.findById(postId);
  if (!post || !post.isActive) return res.status(400).json({ message: "Invalid post" });
  if (String(post.student) === String(req.user._id))
    return res.status(400).json({ message: "Cannot apply to your own post" });

  const app = await Application.create({ post: postId, tutor: req.user._id, pitch });
  res.status(201).json(app);
};

export const tutorApplications = async (req, res) => {
  const apps = await Application.find({ tutor: req.user._id }).populate("post");
  res.json(apps);
};

export const applicationsForPost = async (req, res) => {
  const { postId } = req.params;
  const apps = await Application.find({ post: postId }).populate("tutor");
  res.json(apps);
};

export const shortlist = async (req, res) => {
  const { id } = req.params;
  const app = await Application.findById(id).populate("post");
  if (!app) return res.status(404).json({ message: "Not found" });
  if (String(app.post.student) !== String(req.user._id))
    return res.status(403).json({ message: "Not owner" });
  app.status = "shortlisted";
  await app.save();
  res.json(app);
};

export const reject = async (req, res) => {
  const { id } = req.params;
  const app = await Application.findById(id).populate("post");
  if (!app) return res.status(404).json({ message: "Not found" });
  if (String(app.post.student) !== String(req.user._id))
    return res.status(403).json({ message: "Not owner" });
  app.status = "rejected";
  await app.save();
  res.json(app);
};

export const select = async (req, res) => {
  const { id } = req.params;
  const app = await Application.findById(id).populate("post");
  if (!app) return res.status(404).json({ message: "Not found" });
  if (String(app.post.student) !== String(req.user._id))
    return res.status(403).json({ message: "Not owner" });

  app.status = "accepted";
  await app.save();

  // Open chat if not exists
  const exists = await Chat.findOne({ application: app._id });
  if (!exists) {
    await Chat.create({
      members: [app.post.student, app.tutor],
      application: app._id,
      locked: false,
      messages: [],
    });
  }
  res.json(app);
};
