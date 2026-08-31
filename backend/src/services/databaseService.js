import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, isFirebaseInitialized } from '../config/firebase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const defaultData = {
  users: [],
  attendance: [],
  leaves: [],
  audit_logs: [],
  settings: {
    shiftStartTime: '09:00',
    shiftEndTime: '17:00',
    graceMinutes: 30,
    minHalfDayHours: 4.0,
    fullDayMinHours: 7.0,
    standardHours: 8.0,
    lateDeductionThreshold: 3
  }
};

class DatabaseService {
  constructor() {
    this.isFirebase = isFirebaseInitialized && db !== null;
    if (!this.isFirebase) {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
      }
    }
  }

  _readLocal() {
    try {
      if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
        return defaultData;
      }
      const content = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(content);
    } catch (err) {
      console.error('Error reading local db:', err);
      return defaultData;
    }
  }

  _writeLocal(data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.error('Error writing local db:', err);
    }
  }

  async getCollection(collectionName) {
    if (this.isFirebase) {
      const snapshot = await db.collection(collectionName).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    const data = this._readLocal();
    return data[collectionName] || [];
  }

  async findById(collectionName, id) {
    if (this.isFirebase) {
      const doc = await db.collection(collectionName).doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    }
    const data = this._readLocal();
    const list = data[collectionName] || [];
    return list.find(item => item.id === id) || null;
  }

  async findOne(collectionName, predicate) {
    const list = await this.getCollection(collectionName);
    return list.find(predicate) || null;
  }

  async find(collectionName, predicate) {
    const list = await this.getCollection(collectionName);
    if (!predicate) return list;
    return list.filter(predicate);
  }

  async create(collectionName, item) {
    const newItem = {
      ...item,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (this.isFirebase) {
      if (item.id) {
        await db.collection(collectionName).doc(item.id).set(newItem);
        return newItem;
      }
      const ref = await db.collection(collectionName).add(newItem);
      newItem.id = ref.id;
      return newItem;
    }

    const data = this._readLocal();
    if (!data[collectionName]) data[collectionName] = [];
    if (!newItem.id) {
      newItem.id = 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    data[collectionName].push(newItem);
    this._writeLocal(data);
    return newItem;
  }

  async update(collectionName, id, updates) {
    const updatedFields = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (this.isFirebase) {
      await db.collection(collectionName).doc(id).set(updatedFields, { merge: true });
      return this.findById(collectionName, id);
    }

    const data = this._readLocal();
    const list = data[collectionName] || [];
    const index = list.findIndex(item => item.id === id);
    if (index === -1) return null;

    list[index] = {
      ...list[index],
      ...updatedFields
    };
    data[collectionName] = list;
    this._writeLocal(data);
    return list[index];
  }

  async delete(collectionName, id) {
    if (this.isFirebase) {
      await db.collection(collectionName).doc(id).delete();
      return true;
    }
    const data = this._readLocal();
    if (!data[collectionName]) return false;
    data[collectionName] = data[collectionName].filter(item => item.id !== id);
    this._writeLocal(data);
    return true;
  }

  async getSettings() {
    if (this.isFirebase) {
      const doc = await db.collection('settings').doc('general').get();
      if (doc.exists) return doc.data();
      return defaultData.settings;
    }
    const data = this._readLocal();
    return data.settings || defaultData.settings;
  }

  async updateSettings(settings) {
    if (this.isFirebase) {
      await db.collection('settings').doc('general').set(settings, { merge: true });
      return settings;
    }
    const data = this._readLocal();
    data.settings = { ...data.settings, ...settings };
    this._writeLocal(data);
    return data.settings;
  }
}

export const dbService = new DatabaseService();
