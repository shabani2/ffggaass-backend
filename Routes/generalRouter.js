import express from 'express';
import multer from 'multer';
import General from '../Models/GeneralSchema.js'; // Assurez-vous que le chemin est correct

const GeneralRouter = express.Router();

// Configurer Multer pour l'upload des images

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Répertoire où le fichier sera sauvegardé
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Utiliser le nom d'origine du fichier
  }
});

const upload = multer({ storage: storage });



// Créer une nouvelle entrée
GeneralRouter.post('/', upload.single('logoentreprise'), async (req, res) => {
  try {
    // Vérifiez si req.file est défini
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier téléchargé.' });
    }

    const nouvelleGeneral = new General({
      ...req.body,
      logoentreprise: req.file.path, // Chemin de l'image uploadée
    });

    await nouvelleGeneral.save();
    res.status(201).json(nouvelleGeneral);
  } catch (error) {
    console.error(error); // Ajoutez cette ligne pour voir l'erreur dans la console
    res.status(400).json({ message: error.message });
  }
});

// Récupérer toutes les entrées
GeneralRouter.get('/', async (req, res) => {
  try {
    const Generals = await General.find();
    res.json(Generals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Récupérer une entrée par ID
GeneralRouter.get('/:id', async (req, res) => {
  try {
    const General = await General.findById(req.params.id);
    if (!General) return res.status(404).json({ message: 'Non trouvé' });
    res.json(General);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mettre à jour une entrée par ID
GeneralRouter.put('/:id', upload.single('logoentreprise'), async (req, res) => {
  try {
    const updates = req.file ? { ...req.body, logoentreprise: req.file.path } : req.body;
    const General = await General.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!General) return res.status(404).json({ message: 'Non trouvé' });
    res.json(General);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer une entrée par ID
GeneralRouter.delete('/:id', async (req, res) => {
  try {
    const General = await General.findByIdAndDelete(req.params.id);
    if (!General) return res.status(404).json({ message: 'Non trouvé' });
    res.json({ message: 'Entrée supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default GeneralRouter;
