/**
 * Database Seed Script
 * Creates demo admin, member, projects, and tasks
 * Run: node seed.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/team-task-manager';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@taskflow.com',
      password: 'admin123',
      role: 'ADMIN',
    });
    console.log('👑 Admin created:', admin.email);

    // Create Members
    const member1 = await User.create({
      name: 'Alice Johnson',
      email: 'member@taskflow.com',
      password: 'member123',
      role: 'MEMBER',
    });

    const member2 = await User.create({
      name: 'Bob Smith',
      email: 'bob@taskflow.com',
      password: 'member123',
      role: 'MEMBER',
    });

    const member3 = await User.create({
      name: 'Carol Davis',
      email: 'carol@taskflow.com',
      password: 'member123',
      role: 'MEMBER',
    });
    console.log('👥 Members created');

    // Create Projects
    const project1 = await Project.create({
      name: 'Website Redesign',
      description: 'Complete overhaul of the company website with modern UI',
      createdBy: admin._id,
      members: [member1._id, member2._id],
      status: 'Active',
    });

    const project2 = await Project.create({
      name: 'Mobile App v2',
      description: 'New version of the mobile application with improved features',
      createdBy: admin._id,
      members: [member2._id, member3._id],
      status: 'Active',
    });

    const project3 = await Project.create({
      name: 'Marketing Campaign',
      description: 'Q1 digital marketing campaign planning and execution',
      createdBy: admin._id,
      members: [member1._id, member3._id],
      status: 'On Hold',
    });
    console.log('📁 Projects created');

    // Helper: dates
    const future = (days) => new Date(Date.now() + days * 86400000);
    const past = (days) => new Date(Date.now() - days * 86400000);

    // Create Tasks
    await Task.insertMany([
      {
        title: 'Design new homepage mockup',
        description: 'Create wireframes and high-fidelity mockups for the new homepage',
        status: 'Done',
        priority: 'High',
        dueDate: past(5),
        project: project1._id,
        assignedTo: member1._id,
        createdBy: admin._id,
      },
      {
        title: 'Implement responsive navigation',
        description: 'Build the responsive navigation component based on approved designs',
        status: 'In-Progress',
        priority: 'High',
        dueDate: future(3),
        project: project1._id,
        assignedTo: member2._id,
        createdBy: admin._id,
      },
      {
        title: 'SEO optimization',
        description: 'Optimize meta tags, structured data, and page speed',
        status: 'Todo',
        priority: 'Medium',
        dueDate: future(10),
        project: project1._id,
        assignedTo: member1._id,
        createdBy: admin._id,
      },
      {
        title: 'Fix login bug on Android',
        description: 'Users report login fails on Android 12 devices',
        status: 'In-Progress',
        priority: 'High',
        dueDate: past(2), // overdue!
        project: project2._id,
        assignedTo: member2._id,
        createdBy: admin._id,
      },
      {
        title: 'Add push notifications',
        description: 'Implement FCM push notifications for task assignments',
        status: 'Todo',
        priority: 'Medium',
        dueDate: future(14),
        project: project2._id,
        assignedTo: member3._id,
        createdBy: admin._id,
      },
      {
        title: 'Write social media copy',
        description: 'Draft copy for all social media channels for Q1 campaign',
        status: 'Todo',
        priority: 'Low',
        dueDate: future(7),
        project: project3._id,
        assignedTo: member3._id,
        createdBy: admin._id,
      },
      {
        title: 'Create campaign landing page',
        description: 'Design and develop the landing page for the marketing campaign',
        status: 'Todo',
        priority: 'Medium',
        dueDate: past(1), // overdue!
        project: project3._id,
        assignedTo: member1._id,
        createdBy: admin._id,
      },
    ]);
    console.log('✅ Tasks created (including overdue tasks for demo)');

    console.log('\n════════════════════════════════');
    console.log('🎉 Seed complete! Demo credentials:');
    console.log('────────────────────────────────');
    console.log('👑 Admin:  admin@taskflow.com / admin123');
    console.log('👤 Member: member@taskflow.com / member123');
    console.log('👤 Member: bob@taskflow.com / member123');
    console.log('👤 Member: carol@taskflow.com / member123');
    console.log('════════════════════════════════\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
