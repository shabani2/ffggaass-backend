import mongoose from 'mongoose';

const { Schema } = mongoose;

// Définition du schéma pour MvtStock
const venteSchema = new Schema(
  {   
    quantite: {
      type: Number,
      required: true,
    },
    montant: {
      type: Number,
      required: true,
    }, 
    produit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produit',
      required: true,
    },
    pointVente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PointVente',
      required: true,
    },
  },
  { timestamps: true }
);

// Création du modèle pour MvtStock
const Vente = mongoose.model('Vente', venteSchema);

export default Vente;