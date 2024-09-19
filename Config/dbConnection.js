import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();  // Charger les variables d'environnement

export const dbConnection = async () => {
  try {
    console.info('Tentative de connexion à la base de données...');
    
    // Vérifier si l'URL de la base de données est présente
    if (!process.env.MONGODB_URL_ONLINE) {
      throw new Error('MONGODB_URL_ONLINE non défini dans les variables d\'environnement');
    }

    // Essayer de se connecter à MongoDB
    await mongoose.connect(process.env.MONGODB_URL_ONLINE, {
      useNewUrlParser: true,       // Options pour éviter les warnings de Mongoose
      useUnifiedTopology: true,    // Utiliser le moteur de topologie unifiée
      useCreateIndex: true,        // Créer des index automatiquement
      useFindAndModify: false      // Désactiver findAndModify
    });
    
    console.log('Connexion à la base de données établie avec succès');
  } catch (error) {
    // Journaliser l'erreur complète pour faciliter le débogage
    console.error('Erreur lors de la connexion à la base de données:', error);

    // Si l'erreur est liée à la connexion MongoDB, afficher un message spécifique
    if (error.name === 'MongoNetworkError') {
      console.error('Impossible de se connecter à MongoDB. Vérifiez l\'URL de connexion ou la disponibilité du service.');
    }

    // Fermer proprement le processus avec un code d'erreur
    process.exit(1); 
  }
};
