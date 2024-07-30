import mongoose from 'mongoose';

const { Schema } = mongoose;

// Définition du schéma pour Seuil
const seuilSchema = new Schema({
  quantite: {
    type: Number,
    required: true,
  },
  produit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produit',
    required: true,
  }
},{ timestamps: true });

// Création du modèle pour Seuil
const Seuil = mongoose.model('Seuil', seuilSchema);

export default Seuil;
