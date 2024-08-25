import mongoose from 'mongoose';

const { Schema } = mongoose;

// Définition du schéma pour SituationLivraison
const situationVenteSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    pointVente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PointVente',
      required: true,
    },
    produit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produit',
      required: true,
    },
    quantiteTotale: {
      type: Number,
      required: true,
    },
    montantTotal: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true } // Pour ajouter les champs createdAt et updatedAt automatiquement
);

// Création du modèle pour SituationLivraison
const SituationVente = mongoose.model('SituationVente', situationVenteSchema);

export default SituationVente;
