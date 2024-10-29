// src/models/userModel.js

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
//import bcryptjs from 'bcryptjs'
import PointVente from './PointVenteSchema.js';

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
  },
  postnom: {
    type: String,
    required: true,
  },
  prenom: {
    type: String,
    required: true,
  },
  numero: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['Vendeur', 'Admin', 'SuperAdmin'],
    required: true,
  },
  pointVente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PointVente',
    required: function () {
      return this.role === 'Vendeur';
    },
  },
});


//methode pour comparer le pwd fourni a celui de la bd par bcrypt
userSchema.methods.matchPassword = async function (enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password)
}

// Middleware pour crypter le mot de passe avant de sauvegarder le document
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
