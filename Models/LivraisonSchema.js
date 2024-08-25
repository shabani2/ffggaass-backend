import mongoose from 'mongoose';

const { Schema } = mongoose;

// Définition du schéma pour MvtStock
const livraisonSchema = new Schema(
  {   
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
      required: false,
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
const Livraison = mongoose.model('Livraison', livraisonSchema);

export default Livraison;
