import mongoose from 'mongoose';
import StockVariation from './stockVariationSchema.js';

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

venteSchema.pre('save', async function (next) {
  // Cherche la variation de stock pour le produit et le point de vente spécifiques
  const stockVariation = await StockVariation.findOne({ 
    produit: this.produit, 
    pointVente: this.pointVente 
  });

  if (!stockVariation) {
    // Si aucune variation de stock n'existe, lever une erreur
    return next(new Error('Aucune livraison trouvée pour ce produit dans ce point de vente.'));
  }

  // Vérifie si la quantité demandée est supérieure au solde disponible
  const soldeDisponible = stockVariation.quantiteLivre - stockVariation.quantiteVendu;
  if (this.quantite > soldeDisponible) {
    return next(new Error(`Quantité insuffisante en stock. Quantité disponible : ${soldeDisponible}`));
  }

  next();
});

venteSchema.post('save', async function (doc) {
  let stockVariation = await StockVariation.findOne({ 
    produit: doc.produit, 
    pointVente: doc.pointVente 
  });

  if (stockVariation) {
    stockVariation.quantiteVendu += doc.quantite;
  } else {
    stockVariation = await StockVariation.create({
      produit: doc.produit,
      pointVente: doc.pointVente,
      quantiteLivre: 0,
      quantiteVendu: doc.quantite,
    });
  }

  await stockVariation.save();
});


// Création du modèle pour MvtStock
const Vente = mongoose.model('Vente', venteSchema);

export default Vente;