import mongoose from 'mongoose';
import axios from 'axios'; // Importez axios
import Seuil from './SeuilSchema.js'; // Assurez-vous d'importer le modèle Seuil

const { Schema } = mongoose;

const stockVariationSchema = new Schema(
  {
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
    quantiteLivre: {
      type: Number,
      required: true,
      default: 0,
    },
    quantiteVendu: {
      type: Number,
      required: true,
      default: 0,
    },
    solde: {
      type: Number,
      required: true,
      default: function() {
        return this.quantiteLivre - this.quantiteVendu;
      }
    },
  },
  { timestamps: true }
);

// Fonctionnalité pour écouter le solde
stockVariationSchema.pre('save', async function (next) {
  try {
    // Calculer le solde
    this.solde = this.quantiteLivre - this.quantiteVendu;

    // Trouver le seuil correspondant au produit
    const seuil = await Seuil.findOne({ produit: this.produit });

    if (seuil && this.solde <= seuil.quantite) {
      // Peupler les détails du produit et du point de vente
      const produit = await mongoose.model('Produit').findById(this.produit).exec();
      const pointVente = await mongoose.model('PointVente').findById(this.pointVente).exec();

      if (!produit || !pointVente) {
        return next(new Error('Produit ou point de vente non trouvé.'));
      }

      // Créer le message en utilisant le nom du produit et du point de vente
      const message = `Le produit ${produit.nom} a atteint le seuil de stock dans le point de vente ${pointVente.nom}. Solde actuel: ${this.solde}`;

      // Envoyer un message WhatsApp
      await sendWhatsAppMessage(message);
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Fonction pour envoyer un message WhatsApp
async function sendWhatsAppMessage(message) {
  try {
    const response = await axios.post('https://api.ultramsg.com/instance93830/messages/chat'
      , null, {
      params: {
        token: 'f8hp7mxpjyxgdegd',
        to: '0827337733',
        body: message
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    // Vérifiez la réponse pour vous assurer que le message a été envoyé
    if (response.data.sent === 'true') {
      console.log('Message envoyé avec succès:', response.data);
    } else {
      console.log('Erreur lors de l\'envoi du message:', response.data);
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message WhatsApp:', error);
  }
}


const StockVariation = mongoose.model('StockVariation', stockVariationSchema);

export default StockVariation;
