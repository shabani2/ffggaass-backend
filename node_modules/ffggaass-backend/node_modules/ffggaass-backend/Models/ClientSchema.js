// src/models/userModel.js

import mongoose from 'mongoose';


const clientSchema = new mongoose.Schema({
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
  adresse: {
    type: String,
    required: true,
  },
 
});

const Client = mongoose.model('Client', clientSchema);

export default Client;