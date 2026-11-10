import mongoose from 'mongoose';
import { isMongoConnected, JsonDB } from '../config/db.js';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  credits: { type: Number, default: 20 },
  plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
  avatar: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const MongooseUser = mongoose.models.User || mongoose.model('User', userSchema);

export class UserModel {
  static async findByEmail(email) {
    if (isMongoConnected) {
      return await MongooseUser.findOne({ email });
    }
    return JsonDB.findOne('users', { email });
  }

  static async findById(id) {
    if (isMongoConnected) {
      return await MongooseUser.findById(id);
    }
    return JsonDB.findById('users', id);
  }

  static async create(userData) {
    if (isMongoConnected) {
      const user = new MongooseUser(userData);
      return await user.save();
    }
    return JsonDB.insert('users', {
      credits: 20,
      plan: 'free',
      ...userData
    });
  }

  static async updateById(id, updates) {
    if (isMongoConnected) {
      return await MongooseUser.findByIdAndUpdate(id, updates, { new: true });
    }
    return JsonDB.updateById('users', id, updates);
  }
}

