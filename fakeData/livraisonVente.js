import mongoose from 'mongoose';
import Vente from '../Models/VenteSchema.js'; // Remplace par le chemin de ton modèle Livraison
import dotenv from 'dotenv'
import Livraison from '../Models/LivraisonSchema.js'; 
import Produit from '../Models/ProduitSchema.js';

dotenv.config();

mongoose.connect('mongodb://localhost:27017/api-ffggaass');

const pointsVente = [
  "6699b212b11b8be870b498c6",
  "6699bfcf691720a30bbc8fa7",
  "669c379b9d4bbc80ab71e2ec"
];

const randomIntFromInterval = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const generateRandomLivraisons = async () => {
  // Obtenez les ventes pour chaque produit
  const ventes = await Vente.find().populate('produit');
  
  // Calculez la quantité totale vendue par produit
  const quantiteTotaleVendueParProduit = ventes.reduce((acc, vente) => {
    if (!acc[vente.produit._id]) {
      acc[vente.produit._id] = 0;
    }
    acc[vente.produit._id] += vente.quantite;
    return acc;
  }, {});

  const produits = await Produit.find();
  
  const dates = [
    new Date('2024-08-01'),
    new Date('2024-08-05'),
    new Date('2024-08-10'),
    new Date('2024-08-15'),
    new Date('2024-08-20')
  ];

  const livraisons = [];

  for (let i = 0; i < 15; i++) {
    const produit = produits[randomIntFromInterval(0, produits.length - 1)];
    const pointVente = pointsVente[randomIntFromInterval(0, pointsVente.length - 1)];
    const quantiteVendue = quantiteTotaleVendueParProduit[produit._id] || 1;
    const quantiteLivree = randomIntFromInterval(quantiteVendue, quantiteVendue + 100);
    
    // Validation
    const produitPrix = Number(produit.prix);
    if (isNaN(produitPrix)) {
      console.error(`Prix invalide pour produit ${produit.nom}: ${produit.prix}`);
      continue;
    }
    
    const montant = produitPrix * quantiteLivree;
    if (isNaN(montant)) {
      console.error(`Erreur de calcul du montant pour produit ${produit.nom}: ${montant}`);
      continue;
    }

    const createdAt = dates[randomIntFromInterval(0, dates.length - 1)];
    const statut = Math.random() < 0.5 ? 'validate' : 'unvalidate'; // Randomize statut

    const livraison = new Livraison({
      quantite: quantiteLivree,
      montant,
      produit: produit._id,
      pointVente: pointVente,
      statut,
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

