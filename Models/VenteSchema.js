import mongoose from 'mongoose';
import StockVariation from './stockVariationSchema.js';

const { Schema } = mongoose;

// Définition du schéma pour Vente
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
  try {
    // Cherche la variation de stock pour le produit et le point de vente spécifiques
    const stockVariation = await StockVariation.findOne({ 
      produit: this.produit, 
      pointVente: this.pointVente 
    }).exec(); // Assurez-vous que l'exécution est correcte

    if (!stockVariation) {
      // Si aucune variation de stock n'existe, lever une erreur
      return next(new Error('Aucune variation de stock trouvée pour ce produit dans ce point de vente.'));
    }

    // Vérifie si la quantité demandée est supérieure au solde disponible
    const soldeDisponible = stockVariation.solde; // Utiliser la propriété solde directement
    if (this.quantite > soldeDisponible) {
      return next(new Error(`Quantité insuffisante en stock. Quantité disponible : ${soldeDisponible}`));
    }

    next();
  } catch (error) {
    next(error);
  }
});

venteSchema.post('save', async function (doc) {
  try {
    let stockVariation = await StockVariation.findOne({ 
      produit: doc.produit, 
      pointVente: doc.pointVente 
    }).exec(); // Assurez-vous que l'exécution est correcte

    if (stockVariation) {
      stockVariation.quantiteVendu += doc.quantite;
      stockVariation.solde = stockVariation.quantiteLivre - stockVariation.quantiteVendu; // Recalculer le solde
    } else {
      stockVariation = await StockVariation.create({
        produit: doc.produit,
        pointVente: doc.pointVente,
        quantiteLivre: 0,
        quantiteVendu: doc.quantite,
        solde: -doc.quantite, // Initialiser le solde
      });
    }

    await stockVariation.save();
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la variation de stock:', error);
  }
});

// Création du modèle pour Vente
const Vente = mongoose.model('Vente', venteSchema);

export default Vente;
