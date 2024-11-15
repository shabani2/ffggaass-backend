import Livraison from '../Models/LivraisonSchema.js'; // Assurez-vous que le chemin est correct
import SituationLivraison from './../Models/SituationLivraisonSchema.js'; // Assurez-vous que le chemin est correct

const aggregateLivraisons = async () => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Effectuer l'agrégation des données
    const results = await Livraison.aggregate([
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
          from: 'produits',
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
          from: 'pointventes',
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
          montantTotal: 1,
          date: startOfDay
        }
      }
    ]);

    // Mettre à jour ou insérer les résultats dans la collection SituationLivraison
    for (const result of results) {
      await SituationLivraison.updateOne(
        { date: result.date, 'produit': result.produit, 'pointVente': result.pointVente },
        { $set: { quantiteTotale: result.quantiteTotale, montantTotal: result.montantTotal } },
        { upsert: true }
      );
    }

    console.log('Agrégation et enregistrement effectués avec succès.');
  } catch (err) {
    console.error('Erreur lors de l\'agrégation et de l\'enregistrement:', err);
  }
};

export default aggregateLivraisons;
