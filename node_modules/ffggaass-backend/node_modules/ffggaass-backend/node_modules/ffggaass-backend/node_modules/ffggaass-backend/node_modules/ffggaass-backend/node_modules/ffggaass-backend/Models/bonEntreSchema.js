import mongoose from 'mongoose';
import StockLocal from './stockLocalSchema.js';


const { Schema } = mongoose;

// Définition du schéma pour MvtStock
const bonEntreSchema = new Schema(
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
    
  },
  { timestamps: true }
);

// Middleware pour mettre à jour le cumul de la quantité dans StockVariation
bonEntreSchema.post('save', async function (doc) {
    let stocklocal = await StockLocal.findOne({ produit: doc.produit });
  
    if (stocklocal) {
      // Ajouter la quantité du bon d'entrée au cumul existant
      stocklocal.quantiteTotale += doc.quantite;
    } else {
      // Créer une nouvelle entrée dans StockVariation si elle n'existe pas
      stocklocal = await StockLocal.create({
        produit: doc.produit,
        quantiteTotale: doc.quantite,
      });
    }
  
    await stocklocal.save();
  });


const bonEntre = mongoose.model('bonEntre', bonEntreSchema);

export default bonEntre;
