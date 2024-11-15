import mongoose from 'mongoose';
import Vente from '../Models/VenteSchema.js'; // Remplace par le chemin de ton modèle Livraison
import dotenv from 'dotenv'



dotenv.config();

mongoose.connect('mongodb://localhost:27017/api-ffggaass', {
 useNewUrlParser: true,
   useUnifiedTopology: true,
});

const produits = [
  {
    "_id": "669adee5f3b3b93e14cffe4b",
    "nom": "poutine",
    "prixVente": 6000
  },
  {
    "_id": "669af478f3b3b93e14d00150",
    "nom": "trump",
    "prixVente": 9000
  },
  {
    "_id": "669af6d8f3b3b93e14d001b1",
    "nom": "wilki",
    "prixVente": 9500
  }
];

const pointsVente = [
  "6699b212b11b8be870b498c6",
  "6699bfcf691720a30bbc8fa7",
  "669c379b9d4bbc80ab71e2ec"
];

const randomIntFromInterval = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const generateRandomVentes = async () => {
  const dates = [
    new Date('2024-08-01'),
    new Date('2024-08-05'),
    new Date('2024-08-10'),
    new Date('2024-08-15'),
    new Date('2024-08-20'),
    new Date('2024-08-25'),
    new Date('2024-08-30'),
    new Date('2024-09-01'),
    new Date('2024-09-05'),
    new Date('2024-09-10'),
    new Date('2024-09-15'),
    new Date('2024-09-20')
  ];

  const ventes = [];

  for (let i = 0; i < 250; i++) {
    const produit = produits[randomIntFromInterval(0, produits.length - 1)];
    const pointVente = pointsVente[randomIntFromInterval(0, pointsVente.length - 1)];
    const quantite = randomIntFromInterval(1, 100);
    const montant = produit.prixVente * quantite;
    const createdAt = dates[randomIntFromInterval(0, dates.length - 1)];

    const vente = new Vente({
      quantite,
      montant,
      produit: produit._id,
      pointVente: pointVente,
      createdAt,
      updatedAt: createdAt,
    });

    ventes.push(vente);
  }

  try {
    await Vente.insertMany(ventes);
    console.log('Ventes générées et insérées avec succès !');
  } catch (error) {
    console.error('Erreur lors de l\'insertion des ventes :', error);
  }

  mongoose.connection.close();
};

generateRandomVentes();
