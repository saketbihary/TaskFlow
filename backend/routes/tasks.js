/**
 * Task Routes
 * GET    /api/tasks              - Get tasks (admin: all, member: own)
 * POST   /api/tasks              - Create task (Admin only)
 * GET    /api/tasks/:id          - Get single task
 * PUT    /api/tasks/:id          - Update task (admin: all fields, member: status only)
 * DELETE /api/tasks/:id          - Delete task (Admin only)
 * GET    /api/tasks/stats        - Get dashboard stats
 */

const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);

/**
 * @route   GET /api/tasks/stats
 * @desc    Get task statistics for dashboard
 */
router.get('/stats', async (req, res) => {
  try {
    let matchQuery = {};
    if (req.user.role === 'MEMBER') {
      matchQuery.assignedTo = req.user._id;
    }

    const now = new Date();
    const [total, completed, inProgress, todo] = await Promise.all([
      Task.countDocuments(matchQuery),
      Task.countDocuments({ ...matchQuery, status: 'Done' }),
      Task.countDocuments({ ...matchQuery, status: 'In-Progress' }),
      Task.countDocuments({ ...matchQuery, status: 'Todo' }),
    ]);

    const overdue = await Task.countDocuments({
      ...matchQuery,
      status: { $ne: 'Done' },
      dueDate: { $lt: now },
    });

    res.json({ stats: { total, completed, inProgress, todo, overdue } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats', error: err.message });
  }
});

/**
 * @route   GET /api/tasks
 * @desc    Get tasks with optional filters
 * @query   status, project, assignedTo
 */
router.get('/', async (req, res) => {
  try {
    const { status, project, assignedTo } = req.query;
    const filter = {};

    // Member can only see their assigned tasks
    if (req.user.role === 'MEMBER') {
      filter.assignedTo = req.user._id;
    } else if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    if (status) filter.status = status;
    if (project) filter.project = project;

    const tasks = await Task.find(filter)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1, createdAt: -1 });

    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks', error: err.message });
  }
});

/**
 * @route   POST /api/tasks
 * @desc    Create a new task (Admin only)
 */
router.post('/', restrictTo('ADMIN'), async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, project, assignedTo } = req.body;

    if (!title || !dueDate || !project || !assignedTo) {
      return res.status(400).json({
        message: 'Title, due date, project, and assigned user are required',
      });
    }

    // Verify project exists
    const proj = await Project.findById(project);
    if (!proj) return res.status(404).json({ message: 'Project not found' });

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      project,
      assignedTo,
      createdBy: req.user._id,
    });

    await task.populate('project', 'name');
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.status(201).json({ message: 'Task created', task });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create task', error: err.message });
  }
});

/**
 * @route   GET /api/tasks/:id
 * @desc    Get single task
 */
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Member can only view their own tasks
    if (
      req.user.role === 'MEMBER' &&
      task.assignedTo._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied to this task' });
    }

    res.json({ task });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch task', error: err.message });
  }
});

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task
 *          Admin: can update all fields
 *          Member: can only update status of their own tasks
 */
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role === 'MEMBER') {
      // Members can only update status of their own tasks
      if (task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied to this task' });
      }
      const { status } = req.body;
      if (!status) return res.status(400).json({ message: 'Status is required' });
      task.status = status;
    } else {
      // Admin can update all fields
      const { title, description, status, priority, dueDate, project, assignedTo } = req.body;
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (dueDate) task.dueDate = dueDate;
      if (project) task.project = project;
      if (assignedTo) task.assignedTo = assignedTo;
    }

    await task.save();
    await task.populate('project', 'name');
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.json({ message: 'Task updated', task });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update task', error: err.message });
  }
});

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete task (Admin only)
 */
router.delete('/:id', restrictTo('ADMIN'), async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task', error: err.message });
  }
});

module.exports = router;
