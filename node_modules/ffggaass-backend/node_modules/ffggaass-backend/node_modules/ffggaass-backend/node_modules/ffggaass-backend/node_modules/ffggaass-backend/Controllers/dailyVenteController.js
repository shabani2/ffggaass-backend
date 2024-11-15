import Livraison from "../Models/LivraisonSchema.js";

const groupByPointVenteProduitDate = async () => {
  try {
    const result = await Livraison.aggregate([
      {
        $group: {
          _id: {
            pointVente: "$pointVente",
            produit: "$produit",
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
          },
          totalQuantite: { $sum: "$quantite" },
          totalMontant: { $sum: "$montant" },
          livraisons: { $push: "$$ROOT" } // Pousse les documents originaux pour référence future
        }
      },
      {
        $lookup: {
          from: 'produits', // Nom de la collection des produits
          localField: '_id.produit',
          foreignField: '_id',
          as: 'produitDetails'
        }
      },
      {
        $lookup: {
          from: 'pointventes', // Nom de la collection des points de vente
          localField: '_id.pointVente',
          foreignField: '_id',
          as: 'pointVenteDetails'
        }
      },
      {
        $sort: { "_id.date": 1 } // Tri par date
      }
    ]);

    return result;
  } catch (error) {
    console.error("Erreur lors de l'agrégation :", error);
    throw error;
  }
};

// Exemple d'appel
groupByPointVenteProduitDate().then((data) => {
  console.log(JSON.stringify(data, null, 2));
}).catch(console.error);
