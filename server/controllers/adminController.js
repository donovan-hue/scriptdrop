// Stub completo de adminController. Reemplaza/mergea con el existente.
let User, Post, Report;
try { User = require('../models/User'); } catch {}
try { Post = require('../models/Post'); } catch {}
try { Report = require('../models/Report'); } catch {}

exports.getStats = async (req, res) => {
  try {
    const [users, posts, reports] = await Promise.all([
      User ? User.countDocuments() : 0,
      Post ? Post.countDocuments() : 0,
      Report ? Report.countDocuments({ status: 'pending' }) : 0,
    ]);
    res.json({ users, posts, pendingReports: reports, ts: Date.now() });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.listUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50, q = '' } = req.query;
    const filter = q ? { $or: [{ username: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }] } : {};
    const users = await User.find(filter).select('-password').limit(+limit).skip((+page - 1) * +limit);
    res.json({ users, page: +page });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.banUser = async (req, res) => {
  try {
    const u = await User.findByIdAndUpdate(req.params.id, { banned: true, bannedAt: new Date() }, { new: true });
    res.json(u);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.unbanUser = async (req, res) => {
  try {
    const u = await User.findByIdAndUpdate(req.params.id, { banned: false, bannedAt: null }, { new: true });
    res.json(u);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.listPosts = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const posts = await Post.find().sort({ createdAt: -1 }).limit(+limit).skip((+page - 1) * +limit);
    res.json({ posts });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deletePost = async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.listReports = async (req, res) => {
  try {
    const reports = Report ? await Report.find().sort({ createdAt: -1 }).limit(100) : [];
    res.json({ reports });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.resolveReport = async (req, res) => {
  try {
    const r = await Report.findByIdAndUpdate(req.params.id, { status: 'resolved', resolvedAt: new Date() }, { new: true });
    res.json(r);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
