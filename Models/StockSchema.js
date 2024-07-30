import mongoose from 'mongoose';

const { Schema } = mongoose;

// Définition du schéma pour Stock
const stockSchema = new Schema(
  {
    operation: {
      type: String,
      enum: ['livraison', 'vente'],
      required: true,
    },
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

// Création du modèle pour Stock
const Stock = mongoose.model('Stock', stockSchema);

export default Stock;
