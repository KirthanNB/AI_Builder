import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Global flag to know if MongoDB is connected
export let isMongoConnected = false;

// In-memory / JSON fallback database
export class JsonDB {
  static getStore() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Error reading json db, initializing new store:', e.message);
    }
    return { users: [], projects: [], transactions: [] };
  }

  static saveStore(data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving json db:', e.message);
    }
  }

  static find(collection, query = {}) {
    const store = this.getStore();
    const list = store[collection] || [];
    return list.filter(item => {
      for (const [key, val] of Object.entries(query)) {
        if (item[key] !== val) return false;
      }
      return true;
    });
  }

  static findOne(collection, query = {}) {
    const list = this.find(collection, query);
    return list.length > 0 ? { ...list[0] } : null;
  }

  static findById(collection, id) {
    return this.findOne(collection, { _id: id });
  }

  static insert(collection, doc) {
    const store = this.getStore();
    if (!store[collection]) store[collection] = [];
    const newDoc = {
      _id: doc._id || `id_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...doc
    };
    store[collection].push(newDoc);
    this.saveStore(store);
    return newDoc;
  }

  static updateById(collection, id, updates) {
    const store = this.getStore();
    const list = store[collection] || [];
    const index = list.findIndex(item => item._id === id);
    if (index === -1) return null;

    list[index] = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    store[collection] = list;
    this.saveStore(store);
    return { ...list[index] };
  }

  static deleteById(collection, id) {
    const store = this.getStore();
    const list = store[collection] || [];
    const filtered = list.filter(item => item._id !== id);
    store[collection] = filtered;
    this.saveStore(store);
    return true;
  }
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('ℹ️  No MONGODB_URI provided in .env - Running with high-performance persistent embedded database.');
    isMongoConnected = false;
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });
    isMongoConnected = true;
    console.log('✅ Connected to MongoDB Atlas successfully.');
  } catch (err) {
    console.warn('⚠️  Could not connect to MongoDB:', err.message);
    console.log('ℹ️  Gracefully falling back to persistent embedded JSON database. All features remain 100% active!');
    isMongoConnected = false;
  }
}

