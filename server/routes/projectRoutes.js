import express from 'express';
import { ProjectModel } from '../models/Project.js';
import { UserModel } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { generateProjectFiles, updateProjectWithChat } from '../services/aiService.js';

const router = express.Router();

// Public route to view published website (no auth required)
router.get('/public/:id', async (req, res) => {
  try {
    const project = await ProjectModel.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    if (!project.published) {
      return res.status(403).json({ error: 'This website is private or has not been published yet.' });
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve public website.' });
  }
});

// Protect all routes below with authentication
router.use(requireAuth);

// Get all projects for current user
router.get('/', async (req, res) => {
  try {
    const projects = await ProjectModel.findByUserId(req.user._id);
    res.json(projects);
  } catch (err) {
    console.error('Fetch projects error:', err);
    res.status(500).json({ error: 'Failed to load projects.' });
  }
});

// Create a new project using AI
router.post('/', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return res.status(400).json({ error: 'Please enter a description for your website.' });
    }

    // Check user credits
    const user = await UserModel.findById(req.user._id);
    if (!user || (user.credits !== undefined && user.credits <= 0)) {
      return res.status(403).json({
        error: 'You have exhausted your generation credits. Please upgrade your plan to continue building!',
        needsUpgrade: true
      });
    }

    // Generate files via AI service
    const generated = await generateProjectFiles(prompt.trim());
    const projName = generated.appName || prompt.trim().slice(0, 24);

    const newProject = await ProjectModel.create({
      userId: req.user._id,
      name: projName,
      description: prompt.trim(),
      version: 1,
      status: 'completed',
      published: false,
      messages: [
        {
          role: 'user',
          content: prompt.trim(),
          timestamp: new Date().toISOString(),
        },
        {
          role: 'assistant',
          content: `I have generated your complete, production-grade website for "${prompt.trim()}". You can preview it live, customize it via chat, or edit the source code directly!`,
          timestamp: new Date().toISOString(),
        }
      ],
      files: generated.files,
    });

    // Deduct 1 credit
    if (user.credits > 0) {
      await UserModel.updateById(user._id, { credits: user.credits - 1 });
    }

    res.status(201).json(newProject);
  } catch (err) {
    console.error('Project creation error:', err);
    res.status(500).json({ error: 'Failed to generate project. Please try again.' });
  }
});

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = await ProjectModel.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Check ownership
    if (project.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve project.' });
  }
});

// AI Chat iteration on project
router.post('/:id/chat', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return res.status(400).json({ error: 'Please enter instructions for the AI.' });
    }

    const project = await ProjectModel.findById(req.params.id);
    if (!project || project.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Check credits
    const user = await UserModel.findById(req.user._id);
    if (!user || (user.credits !== undefined && user.credits <= 0)) {
      return res.status(403).json({
        error: 'You have exhausted your generation credits. Please upgrade to continue!',
        needsUpgrade: true
      });
    }

    // Call AI chat update
    const { updatedFiles, explanation } = await updateProjectWithChat(project, prompt.trim());

    const updatedMessages = [
      ...(project.messages || []),
      { role: 'user', content: prompt.trim(), timestamp: new Date().toISOString() },
      { role: 'assistant', content: explanation, timestamp: new Date().toISOString() }
    ];

    const updated = await ProjectModel.updateById(project._id, {
      files: updatedFiles,
      messages: updatedMessages,
      version: (project.version || 1) + 1,
    });

    // Deduct 1 credit
    if (user.credits > 0) {
      await UserModel.updateById(user._id, { credits: user.credits - 1 });
    }

    res.json(updated);
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Failed to update project.' });
  }
});

// Save manual file edits
router.put('/:id/files', async (req, res) => {
  try {
    const { files } = req.body;
    if (!files || typeof files !== 'object') {
      return res.status(400).json({ error: 'Invalid file payload.' });
    }

    const project = await ProjectModel.findById(req.params.id);
    if (!project || project.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const updated = await ProjectModel.updateById(project._id, { files });
    res.json({ success: true, project: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save file changes.' });
  }
});

// Toggle publish status
router.post('/:id/publish', async (req, res) => {
  try {
    const project = await ProjectModel.findById(req.params.id);
    if (!project || project.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const newPublishState = !project.published;
    const updated = await ProjectModel.updateById(project._id, { published: newPublishState });
    res.json({ published: newPublishState, project: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update publication status.' });
  }
});

// Delete project
router.delete('/:id', async (req, res) => {
  try {
    const project = await ProjectModel.findById(req.params.id);
    if (!project || project.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    await ProjectModel.deleteById(project._id);
    res.json({ message: 'Project deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete project.' });
  }
});

export default router;

