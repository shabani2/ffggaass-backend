import express from 'express';
import Vente from '../Models/VenteSchema.js'; // Assurez-vous que le chemin est correct
import asyncHandler from 'express-async-handler';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import xlsx from 'xlsx';
import multer from 'multer';
import Produit from '../Models/ProduitSchema.js';
import PointVente from '../Models/PointVenteSchema.js';

const venteRouter = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration de multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

// Route pour exporter les ventes
venteRouter.get('/export', asyncHandler(async (req, res) => {
  const { format } = req.query; // format peut être 'csv' ou 'xlsx'

  // Récupérer les données de vente avec les informations liées
  const ventes = await Vente.find({})
    .populate('produit', 'nom')
    .populate('pointVente', 'nom emplacement');

  // Transformer les données en un format plus lisible pour l'export
  const data = ventes.map(vente => ({
    quantite: vente.quantite,
    montant: vente.montant,
    produitNom: vente.produit.nom,
    pointVenteNom: vente.pointVente.nom,
    // pointVenteEmplacement: vente.pointVente.emplacement,
  }));

  // Créer un répertoire d'export s'il n'existe pas
  const exportDir = path.join(__dirname, 'export');
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir);
  }

  const filePath = path.join(exportDir, `ventes.${format}`);

  if (format === 'csv') {
    exportToCSV(data, filePath);
  } else if (format === 'xlsx') {
    exportToExcel(data, filePath);
  } else {
    return res.status(400).send('Format invalide');
  }

  res.download(filePath, (err) => {
    if (err) {
      res.status(500).send('Erreur lors du téléchargement du fichier');
    }
    fs.unlinkSync(filePath); // Supprime le fichier après téléchargement
  });
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
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Ventes');
  xlsx.writeFile(workbook, filePath);
};

// Route pour importer les ventes
venteRouter.post('/import', upload.single('file'), asyncHandler(async (req, res) => {
  try {
    const filePath = req.file.path;

    // Lire le fichier Excel
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    const importedData = [];

    for (const record of data) {
      const produit = await Produit.findOne({ nom: record.produitNom });
      const pointVente = await PointVente.findOne({ nom: record.pointVenteNom });

      if (produit && pointVente) {
        const newVente = new Vente({
          quantite: record.quantite,
          montant: record.montant,
          produit: produit._id,
          pointVente: pointVente._id,
        });

        const savedVente = await newVente.save();
        importedData.push(savedVente);
      }
    }

    // Supprimer le fichier uploadé après traitement
    fs.unlinkSync(filePath);

    res.status(200).json(importedData);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du traitement du fichier', error: error.message });
  }
}));

// Créer une nouvelle vente
venteRouter.post('/', async (req, res) => {
  try {
    const newVente = new Vente(req.body);
    const savedVente = await newVente.save();
    res.status(201).json(savedVente);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Obtenir toutes les ventes (triées par createdAt en ordre décroissant)
venteRouter.get('/', async (req, res) => {
  try {
    const ventes = await Vente.find()
      .populate('produit')
      .populate('pointVente')
      .sort({ createdAt: -1 }); // Tri par createdAt en ordre décroissant

    res.status(200).json(ventes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rechercher des ventes par produit.nom (avec tri par createdAt en ordre décroissant)
venteRouter.get('/search-by-produit', async (req, res) => {
  try {
    const { produitQuery } = req.query;

    const ventes = await Vente.find()
      .populate({
        path: 'produit',
        match: produitQuery ? { nom: { $regex: produitQuery, $options: 'i' } } : {},
      })
      .populate('pointVente')
      .sort({ createdAt: -1 }); // Tri par createdAt en ordre décroissant

    // Filtrer les ventes où le produit est trouvé
    const filteredVentes = ventes.filter(vente => vente.produit);

    res.status(200).json(filteredVentes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rechercher des ventes par pointVente.nom (avec tri par createdAt en ordre décroissant)
venteRouter.get('/search-by-pointVente', async (req, res) => {
  try {
    const { pointVenteQuery } = req.query;

    const ventes = await Vente.find()
      .populate('produit')
      .populate({
        path: 'pointVente',
        match: pointVenteQuery ? { nom: { $regex: pointVenteQuery, $options: 'i' } } : {},
      })
      .sort({ createdAt: -1 }); // Tri par createdAt en ordre décroissant

    // Filtrer les ventes où le point de vente est trouvé
    const filteredVentes = ventes.filter(vente => vente.pointVente);

    res.status(200).json(filteredVentes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Obtenir une vente par ID
venteRouter.get('/:id', async (req, res) => {
  try {
    const vente = await Vente.findById(req.params.id).populate('produit').populate('pointVente');
    if (!vente) {
      return res.status(404).json({ message: 'Vente non trouvée' });
    }
    res.status(200).json(vente);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mettre à jour une vente par ID
venteRouter.put('/:id', async (req, res) => {
  try {
    const updatedVente = await Vente.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('produit').populate('pointVente');
    if (!updatedVente) {
      return res.status(404).json({ message: 'Vente non trouvée' });
    }
    res.status(200).json(updatedVente);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Supprimer une vente par ID
venteRouter.delete('/:id', async (req, res) => {
  try {
    const deletedVente = await Vente.findByIdAndDelete(req.params.id);
    if (!deletedVente) {
      return res.status(404).json({ message: 'Vente non trouvée' });
    }
    res.status(200).json({ message: 'Vente supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Agrégation des ventes groupées avec tri
venteRouter.get('/grouped-vente', async (req, res) => {
  try {
    const { pointVente, produit, dateStart, dateEnd } = req.query;

    if (!pointVente || !produit) {
      return res.status(400).json({ message: "Les paramètres 'pointVente' et 'produit' sont requis." });
    }

    // Construction de la condition de filtrage
    let matchCondition = {
      pointVente: mongoose.Types.ObjectId(pointVente),
      produit: mongoose.Types.ObjectId(produit),
    };

    // Ajout de la condition de date si fournie
    if (dateStart || dateEnd) {
      matchCondition.createdAt = {};
      if (dateStart) {
        matchCondition.createdAt.$gte = new Date(dateStart);
      }
      if (dateEnd) {
        matchCondition.createdAt.$lte = new Date(dateEnd);
      }
    }

    // Pipeline d'agrégation
    const result = await Vente.aggregate([
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
          ventes: { $push: "$$ROOT" }
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
        $sort: { "_id.date": 1 } // Tri par date croissant dans l'agrégation
      }
    ]);

    res.status(200).json(result);
  } catch (error) {
    console.error("Erreur lors de l'agrégation :", error);
    res.status(500).json({ message: error.message });
  }
});

export default venteRouter;
