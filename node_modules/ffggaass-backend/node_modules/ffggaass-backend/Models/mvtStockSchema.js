import mongoose from 'mongoose';

const { Schema } = mongoose;

// Définition du schéma pour MvtStock
const mvtStockSchema = new Schema(
  {
    operation: {
      type: String,
      enum: ['vente', 'livraison'],
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
    statut: {
      type: String,
      enum: ['validate', 'unvalidate'],
      required: true,
      default:'unvalidate'
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
const MvtStock = mongoose.model('MvtStock', mvtStockSchema);

export default MvtStock;
