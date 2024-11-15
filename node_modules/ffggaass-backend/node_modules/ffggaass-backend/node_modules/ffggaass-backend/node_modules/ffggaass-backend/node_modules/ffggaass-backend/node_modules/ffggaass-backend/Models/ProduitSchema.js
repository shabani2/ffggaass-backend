import mongoose from 'mongoose';

const { Schema } = mongoose;

// Définition du schéma pour Produit
const produitSchema = new Schema({
  nom: {
    type: String,
    required: true,
  },
  prix: {
    type: Number,
    required: true,
  },
  prixVente: {
    type: Number,
    default:0    
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
},{ timestamps: true });

// Création du modèle pour Produit
const Produit = mongoose.model('Produit', produitSchema);

export default Produit;
