import express from 'express';
import Livraison from '../Models/LivraisonSchema.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import xlsx from 'xlsx';
import multer from 'multer'; // Assurez-vous que le chemin est correct
import Produit from '../Models/ProduitSchema.js';
import PointVente from '../Models/PointVenteSchema.js';
import asyncHandler from 'express-async-handler';

const livraisonRouter = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration de multer pour l'upload de fichiers (même si on l'utilise pour l'import)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

// Route pour exporter les livraisons
livraisonRouter.get('/export', asyncHandler(async (req, res) => {
  const { format } = req.query; // format peut être 'csv' ou 'xlsx'

  const livraisons = await Livraison.find({})
    .populate('produit', 'nom')
    .populate('pointVente', 'nom emplacement');

  const data = livraisons.map(livraison => ({
    quantite: livraison.quantite,
    montant: livraison.montant,
    statut: livraison.statut,
    produitNom: livraison.produit.nom,
    pointVenteNom: livraison.pointVente.nom,
    // pointVenteEmplacement: livraison.pointVente.emplacement, // Ajouter emplacement du point de vente
  }));

  if (format === 'xlsx') {
    // Générer le fichier XLSX dans un buffer
    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Livraisons');
    
    const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    // Définir les en-têtes pour un fichier XLSX
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=livraisons.xlsx');
    res.send(buffer);
  } else if (format === 'csv') {
    // Générer le fichier CSV
    const csv = data.map(row => Object.values(row).join(',')).join('\n');
    const header = Object.keys(data[0]).join(',');
    const filePath = path.join(__dirname, 'export', 'livraisons.csv');
    
    fs.writeFileSync(filePath, `${header}\n${csv}`);
    res.download(filePath, (err) => {
      if (err) {
        res.status(500).send('Erreur lors du téléchargement du fichier');
      }
      fs.unlinkSync(filePath); // Supprimer le fichier après téléchargement
    });
  } else {
    return res.status(400).send('Format invalide');
  }
}));

// Fonctions utilitaires pour l'exportation
const exportToCSV = (data, filePath) => {
  const csv = data.map(row => Object.values(row).join(',')).join('\n');
  const header = Object.keys(data[0]).join(',');
  fs.writeFileSync(filePath, `${header}\n${csv}`);
};

const exportToExcel = (data, filePath) => {
  const worksheet = xlsx.utils.json_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Livraisons');
  xlsx.writeFile(workbook, filePath);
};


livraisonRouter.post('/import', upload.single('file'), asyncHandler(async (req, res) => {
  try {
    const filePath = req.file.path;

    // Lire le fichier Excel
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    // Insérer les données dans la table Livraison
    const importedData = [];
    for (const record of data) {
      const produit = await Produit.findOne({ nom: record.produitNom });
      const pointVente = await PointVente.findOne({ nom: record.pointVenteNom });

      if (produit && pointVente) {
        const newLivraison = new Livraison({
          quantite: record.quantite,
          montant: record.montant,
          statut: record.statut || 'unvalidate', // Si statut est manquant, il sera défini sur 'unvalidate'
          produit: produit._id,
          pointVente: pointVente._id,
        });
        const savedLivraison = await newLivraison.save();
        importedData.push(savedLivraison);
      }
    }

    // Supprimer le fichier uploadé après traitement
    fs.unlinkSync(filePath);

    res.status(200).json(importedData);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du traitement du fichier', error: error.message });
  }
}));



// Créer une nouvelle livraison
livraisonRouter.post('/', async (req, res) => {
  try {
    const newLivraison = new Livraison(req.body);
    const savedLivraison = await newLivraison.save();
    res.status(201).json(savedLivraison);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Obtenir toutes les livraisons (triées par createdAt en ordre décroissant)
livraisonRouter.get('/', async (req, res) => {
  try {
    const livraisons = await Livraison.find()
      .populate('produit')
      .populate('pointVente')
      .sort({ createdAt: -1 }); // Tri en ordre décroissant par createdAt
    res.status(200).json(livraisons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rechercher des livraisons par produit.nom (triées par createdAt en ordre décroissant)
livraisonRouter.get('/search-by-produit', async (req, res) => {
  try {
    const { produitQuery } = req.query;

    const livraisons = await Livraison.find()
      .populate({
        path: 'produit',
        match: produitQuery ? { nom: { $regex: produitQuery, $options: 'i' } } : {},
      })
      .populate('pointVente')
      .sort({ createdAt: -1 }); // Tri en ordre décroissant par createdAt

    const filteredLivraisons = livraisons.filter(livraison => livraison.produit);

    res.status(200).json(filteredLivraisons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rechercher des livraisons par pointVente.nom (triées par createdAt en ordre décroissant)
livraisonRouter.get('/search-by-pointVente', async (req, res) => {
  try {
    const { pointVenteQuery } = req.query;

    const livraisons = await Livraison.find()
      .populate('produit')
      .populate({
        path: 'pointVente',
        match: pointVenteQuery ? { nom: { $regex: pointVenteQuery, $options: 'i' } } : {},
      })
      .sort({ createdAt: -1 }); // Tri en ordre décroissant par createdAt

    const filteredLivraisons = livraisons.filter(livraison => livraison.pointVente);

    res.status(200).json(filteredLivraisons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Exclure les livraisons par pointVente.nom (triées par createdAt en ordre décroissant)
livraisonRouter.get('/exclude-by-pointVente', async (req, res) => {
  try {
    const { pointVenteQuery } = req.query;

    const livraisons = await Livraison.find()
      .populate('produit')
      .populate({
        path: 'pointVente',
        match: pointVenteQuery ? { nom: { $not: { $regex: pointVenteQuery, $options: 'i' } } } : {},
      })
      .sort({ createdAt: -1 }); // Tri en ordre décroissant par createdAt

    const filteredLivraisons = livraisons.filter(livraison => livraison.pointVente);

    res.status(200).json(filteredLivraisons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mettre à jour le statut d'une livraison par ID
livraisonRouter.put('/statut/:id/:statut', async (req, res) => {
  try {
    const { id, statut } = req.params;

    if (!statut) {
      return res.status(400).json({ message: 'Le statut est requis.' });
    }

    const updatedLivraison = await Livraison.findByIdAndUpdate(
      id,
      { statut },
      { new: true, runValidators: true }
    )
      .populate('produit')
      .populate('pointVente');

    if (!updatedLivraison) {
      return res.status(404).json({ message: 'Livraison non trouvée' });
    }

    res.status(200).json(updatedLivraison);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Obtenir une livraison par ID
livraisonRouter.get('/:id', async (req, res) => {
  try {
    const livraison = await Livraison.findById(req.params.id)
      .populate('produit')
      .populate('pointVente');
    if (!livraison) {
      return res.status(404).json({ message: 'Livraison non trouvée' });
    }
    res.status(200).json(livraison);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mettre à jour une livraison par ID
livraisonRouter.put('/:id', async (req, res) => {
  try {
    const updatedLivraison = await Livraison.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('produit')
      .populate('pointVente');
    if (!updatedLivraison) {
      return res.status(404).json({ message: 'Livraison non trouvée' });
    }
    res.status(200).json(updatedLivraison);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Supprimer une livraison par ID
livraisonRouter.delete('/:id', async (req, res) => {
  try {
    const deletedLivraison = await Livraison.findByIdAndDelete(req.params.id);
    if (!deletedLivraison) {
      return res.status(404).json({ message: 'Livraison non trouvée' });
    }
    res.status(200).json({ message: 'Livraison supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Grouped Livraisons avec tri par date décroissant
livraisonRouter.get('/grouped-livraisons', async (req, res) => {
  try {
    const { pointVente, produit, dateStart, dateEnd } = req.query;

    if (!pointVente || !produit) {
      return res.status(400).json({ message: "Les paramètres 'pointVente' et 'produit' sont requis." });
    }

    let matchCondition = {
      pointVente: mongoose.Types.ObjectId(pointVente),
      produit: mongoose.Types.ObjectId(produit),
    };

    if (dateStart || dateEnd) {
      matchCondition.createdAt = {};
      if (dateStart) {
        matchCondition.createdAt.$gte = new Date(dateStart);
      }
      if (dateEnd) {
        matchCondition.createdAt.$lte = new Date(dateEnd);
      }
    }

    const result = await Livraison.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: {
            pointVente: "$pointVente",
            produit: "$produit",
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            }
          },
          totalQuantite: { $sum: "$quantite" },
          totalMontant: { $sum: "$montant" },
          livraisons: { $push: "$$ROOT" }
        }
      },
      {
        $lookup: {
          from: 'produits',
          localField: '_id.produit',
          foreignField: '_id',
          as: 'produitDetails'
        }
      },
      {
        $lookup: {
          from: 'pointventes',
          localField: '_id.pointVente',
          foreignField: '_id',
          as: 'pointVenteDetails'
        }
      },
      {
        $sort: { "_id.date": -1 } // Tri par date en ordre décroissant
      }
    ]);

    res.status(200).json(result);
  } catch (error) {
    console.error("Erreur lors de l'agrégation :", error);
    res.status(500).json({ message: error.message });
  }
});

export default livraisonRouter;
