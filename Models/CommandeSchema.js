import mongoose from 'mongoose';

const { Schema } = mongoose;

// Définition du schéma pour MvtStock
const commandeSchema = new Schema(
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
      required: true,
      default:'unvalidate'
    },
    produit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produit',
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
  },
  { timestamps: true }
);


// Création du modèle pour MvtStock
const commande = mongoose.model('Commande', commandeSchema);

export default commande;
