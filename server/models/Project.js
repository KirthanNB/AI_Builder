import mongoose from 'mongoose';
import { isMongoConnected, JsonDB } from '../config/db.js';

const projectSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  version: { type: Number, default: 1 },
  status: { type: String, default: 'completed' },
  published: { type: Boolean, default: false },
  messages: { type: Array, default: [] },
  files: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const MongooseProject = mongoose.models.Project || mongoose.model('Project', projectSchema);

export class ProjectModel {
  static async findByUserId(userId) {
    if (isMongoConnected) {
      return await MongooseProject.find({ userId }).sort({ updatedAt: -1 });
    }
    const list = JsonDB.find('projects', { userId });
    return list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  static async findById(id) {
    if (isMongoConnected) {
      return await MongooseProject.findById(id);
    }
    return JsonDB.findById('projects', id);
  }

  static async create(projectData) {
    if (isMongoConnected) {
      const project = new MongooseProject(projectData);
      return await project.save();
    }
    return JsonDB.insert('projects', {
      version: 1,
      status: 'completed',
      published: false,
      messages: [],
      files: {},
      ...projectData
    });
  }

  static async updateById(id, updates) {
    if (isMongoConnected) {
      return await MongooseProject.findByIdAndUpdate(id, updates, { new: true });
    }
    return JsonDB.updateById('projects', id, updates);
  }

  static async deleteById(id) {
    if (isMongoConnected) {
      return await MongooseProject.findByIdAndDelete(id);
    }
    return JsonDB.deleteById('projects', id);
  }
}

