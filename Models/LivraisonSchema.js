import mongoose from 'mongoose';
import StockVariation from './stockVariationSchema.js';

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


livraisonSchema.post('save', async function (doc) {
  let stockVariation = await StockVariation.findOne({ 
    produit: doc.produit, 
    pointVente: doc.pointVente 
  });

  if (stockVariation) {
    stockVariation.quantiteLivre += doc.quantite;
  } else {
    stockVariation = await StockVariation.create({
      produit: doc.produit,
      pointVente: doc.pointVente,
      quantiteLivre: doc.quantite,
      quantiteVendu: 0,
    });
  }

  await stockVariation.save();
});
// Création du modèle pour MvtStock
const Livraison = mongoose.model('Livraison', livraisonSchema);

export default Livraison;
