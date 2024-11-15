// src/models/pointVenteModel.js

import mongoose from 'mongoose';

const pointVenteSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
  },
  emplacement: {
    type: String,
    required: true,
  },
},{ timestamps: true });

const PointVente = mongoose.model('PointVente', pointVenteSchema);

export default PointVente;
