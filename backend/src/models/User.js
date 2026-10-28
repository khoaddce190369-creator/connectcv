'use strict';
const db = require('../config/db');

class UserModel {
  static findById(id) {
    const users = db.get('users');
    return users.find(u => u.id === id) || null;
  }

  static findByEmail(email) {
    if (!email) return null;
    const users = db.get('users');
    return users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  static create({ id, username, email, password_hash = null, isPro = false, role = 'Student', avatar = '', aiCredits = 10 }) {
    const newUser = {
      id: id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      username: username || email?.split('@')[0] || 'ConnectCV User',
      email: email ? email.toLowerCase() : '',
      password_hash,
      isPro: !!isPro,
      role: role || 'Student',
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
      aiCredits: aiCredits !== undefined ? aiCredits : 10,
      createdAt: new Date().toISOString()
    };
    db.insert('users', newUser);
    return newUser;
  }

  static update(id, updates) {
    return db.update('users', u => u.id === id, updates);
  }

  static findAll() {
    return (db.get('users') || []).map(u => UserModel.toPublicJSON(u));
  }

  static delete(id) {
    return db.delete('users', u => u.id === id);
  }

  static toPublicJSON(user) {
    if (!user) return null;
    const { password_hash, ...publicData } = user;
    return publicData;
  }
}

module.exports = UserModel;
