import mongoose from 'mongoose';
import Livraison from '../Models/LivraisonSchema.js'; // Remplace par le chemin de ton modèle Livraison
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
    "prix": 4500
  },
  {
    "_id": "669af478f3b3b93e14d00150",
    "nom": "trump",
    "prix": 7000
  },
  {
    "_id": "669af6d8f3b3b93e14d001b1",
    "nom": "wilki",
    "prix": 8000
  }
];

const pointVenteId = "66c3c48058118fcaab0c7817";

const randomIntFromInterval = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const generateRandomLivraisons = async () => {
  const dates = [
    new Date('2024-08-01'),
    new Date('2024-08-05'),
    new Date('2024-08-10'),
    new Date('2024-08-15'),
    new Date('2024-08-20'),
  ];

  const livraisons = [];

  for (let i = 0; i < 50; i++) {
    const produit = produits[randomIntFromInterval(0, produits.length - 1)];
    const quantite = randomIntFromInterval(1, 100);
    const montant = produit.prix * quantite;
    const createdAt = dates[randomIntFromInterval(0, dates.length - 1)];

    const livraison = new Livraison({
      quantite,
      montant,
      produit: produit._id,
      pointVente: pointVenteId,
      createdAt,
      updatedAt: createdAt,
    });

    livraisons.push(livraison);
  }

  try {
    await Livraison.insertMany(livraisons);
    console.log('Livraisons générées et insérées avec succès !');
  } catch (error) {
    console.error('Erreur lors de l\'insertion des livraisons :', error);
  }

  mongoose.connection.close();
};

generateRandomLivraisons();
