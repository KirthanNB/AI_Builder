import mongoose from 'mongoose';
import { isMongoConnected, JsonDB } from '../config/db.js';

const transactionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  orderId: { type: String, required: true },
  paymentId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  plan: { type: String, required: true },
  creditsAdded: { type: Number, required: true },
  status: { type: String, default: 'successful' },
  createdAt: { type: Date, default: Date.now }
});

const MongooseTransaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

export class TransactionModel {
  static async findByUserId(userId) {
    if (isMongoConnected) {
      return await MongooseTransaction.find({ userId }).sort({ createdAt: -1 });
    }
    const list = JsonDB.find('transactions', { userId });
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  static async create(data) {
    if (isMongoConnected) {
      const tx = new MongooseTransaction(data);
      return await tx.save();
    }
    return JsonDB.insert('transactions', {
      status: 'successful',
      ...data
    });
  }
}

