import cron from 'node-cron';
import mongoose from 'mongoose';
import SituationVente from './Models/SituationVenteSchema.js'; // Assurez-vous du chemin correct
import Vente from './Models/VenteSchema.js'

// Fonction pour effectuer l'agrégation et enregistrer les données
export const aggregateAndSaveVente = async () => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Effectuer l'agrégation des données
    const results = await Vente.aggregate([
      { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay } } },
      {
        $group: {
          _id: { pointVente: '$pointVente', produit: '$produit' },
          quantiteTotale: { $sum: '$quantite' },
          montantTotal: { $sum: '$montant' },
        }
      },
      {
        $lookup: {
          from: 'produits', // Assurez-vous que ce nom correspond au nom de votre collection Produit
          localField: '_id.produit',
          foreignField: '_id',
          as: 'produit'
        }
      },
      {
        $unwind: '$produit'
      },
      {
        $lookup: {
          from: 'pointventes', // Assurez-vous que ce nom correspond au nom de votre collection PointVente
          localField: '_id.pointVente',
          foreignField: '_id',
          as: 'pointVente'
        }
      },
      {
        $unwind: '$pointVente'
      },
      {
        $project: {
          produit: '$produit.nom',
          pointVente: '$pointVente.nom',
          quantiteTotale: 1,
          montantTotal: 1
        }
      }
    ]);

    // Enregistrer les résultats dans la collection SituationLivraison
    await SituationVente.insertMany(results);

    console.log('Agrégation et enregistrement effectués avec succès.');
  } catch (err) {
    console.error('Erreur lors de l\'agrégation et de l\'enregistrement:', err);
  }
};

// Planifier l'exécution du cron job tous les jours à minuit
cron.schedule('0 0 * * *', () => {
  console.log('Début de l\'agrégation quotidienne');
  aggregateAndSave();
});
