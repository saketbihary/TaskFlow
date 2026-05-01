/**
 * Project Routes
 * GET    /api/projects           - Get projects (admin: all, member: own)
 * POST   /api/projects           - Create project (ADMIN only)
 * GET    /api/projects/:id       - Get single project
 * PUT    /api/projects/:id       - Update project (ADMIN only)
 * DELETE /api/projects/:id       - Delete project (ADMIN only)
 * POST   /api/projects/:id/members     - Add member (ADMIN only)
 * DELETE /api/projects/:id/members/:uid - Remove member (ADMIN only)
 */

const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);

/**
 * @route   GET /api/projects
 * @desc    Get all projects (admin) or user's projects (member)
 */
router.get('/', async (req, res) => {
  try {
    let query;
    if (req.user.role === 'ADMIN') {
      query = Project.find();
    } else {
      // Member only sees projects they belong to
      query = Project.find({ members: req.user._id });
    }
    const projects = await query
      .populate('createdBy', 'name email')
      .populate('members', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ projects });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch projects', error: err.message });
  }
});

/**
 * @route   POST /api/projects
 * @desc    Create a new project (Admin only)
 */
router.post('/', restrictTo('ADMIN'), async (req, res) => {
  try {
    const { name, description, members, status } = req.body;
    if (!name) return res.status(400).json({ message: 'Project name is required' });

    const project = await Project.create({
      name,
      description,
      members: members || [],
      status,
      createdBy: req.user._id,
    });

    await project.populate('createdBy', 'name email');
    await project.populate('members', 'name email role');

    res.status(201).json({ message: 'Project created', project });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create project', error: err.message });
  }
});

/**
 * @route   GET /api/projects/:id
 * @desc    Get single project with tasks
 */
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Members can only access their own projects
    if (
      req.user.role !== 'ADMIN' &&
      !project.members.some((m) => m._id.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Access denied to this project' });
    }

    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch project', error: err.message });
  }
});

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project (Admin only)
 */
router.put('/:id', restrictTo('ADMIN'), async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, status },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project updated', project });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update project', error: err.message });
  }
});

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project and all its tasks (Admin only)
 */
router.delete('/:id', restrictTo('ADMIN'), async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Also delete all tasks in this project
    await Task.deleteMany({ project: req.params.id });

    res.json({ message: 'Project and associated tasks deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete project', error: err.message });
  }
});

/**
 * @route   POST /api/projects/:id/members
 * @desc    Add member to project (Admin only)
 */
router.post('/:id/members', restrictTo('ADMIN'), async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.members.includes(userId)) {
      return res.status(400).json({ message: 'User already in project' });
    }

    project.members.push(userId);
    await project.save();
    await project.populate('members', 'name email role');

    res.json({ message: 'Member added', project });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add member', error: err.message });
  }
});

/**
 * @route   DELETE /api/projects/:id/members/:userId
 * @desc    Remove member from project (Admin only)
 */
router.delete('/:id/members/:userId', restrictTo('ADMIN'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    project.members = project.members.filter(
      (m) => m.toString() !== req.params.userId
    );
    await project.save();
    await project.populate('members', 'name email role');

    res.json({ message: 'Member removed', project });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove member', error: err.message });
  }
});

module.exports = router;
