import Vente from '../Models/VenteSchema.js'; // Assurez-vous que le chemin est correct
import SituationVente from '../Models/SituationVenteSchema.js'; // Assurez-vous que le chemin est correct
///mport Vente from '../Models/VenteSchema';

// Fonction d'agrégation
const aggregateVente= async (pointVente, produit, dateStart, dateEnd) => {
  const pipeline = [
    // Filtrer par point de vente
    { $match: { pointVente: mongoose.Types.ObjectId(pointVente) } },
    // Filtrer par produit
    { $match: { produit: mongoose.Types.ObjectId(produit) } },
    // Filtrer par date si les dates sont spécifiées
    ...(dateStart && dateEnd ? [
      { $match: { createdAt: { $gte: new Date(dateStart), $lte: new Date(dateEnd) } } }
    ] : []),
    // Regrouper par date, produit, et point de vente
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          produit: "$produit",
          pointVente: "$pointVente",
        },
        totalQuantite: { $sum: "$quantite" },
        totalMontant: { $sum: "$montant" },
      }
    },
    // Restructurer les documents pour correspondre au modèle SituationLivraison
    {
      $project: {
        date: "$_id.date",
        produit: "$_id.produit",
        pointVente: "$_id.pointVente",
        quantiteTotale: "$totalQuantite",
        montantTotal: "$totalMontant",
        _id: 0,
      }
    }
  ];

  return Vente.aggregate(pipeline);
};

export default aggregateVente;
