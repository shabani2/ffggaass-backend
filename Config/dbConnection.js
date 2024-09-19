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

    // Essayer de se connecter à MongoDB sans les options obsolètes
    await mongoose.connect(process.env.MONGODB_URL_ONLINE, {
      useNewUrlParser: true,       // Toujours recommandé pour éviter les avertissements
      useUnifiedTopology: true     // Utiliser la topologie unifiée pour gérer les connexions
    });
    
    console.log('Connexion à la base de données établie avec succès');
  } catch (error) {
    console.error('Erreur lors de la connexion à la base de données:', error.message);

    // Fermer proprement le processus avec un code d'erreur
    process.exit(1); 
  }
};




// import mongoose from 'mongoose'
// import dotenv from 'dotenv'

//  export const dbConnection = async () => {
//  try {
//    console.info('con zone')
//   // console.log('connection var = '+ process.env.MONGODB_URL_ONLINE);
//     await mongoose.connect(process.env.MONGODB_URL_ONLINE)
//     console.log('connection establish successfully')
    
//  } catch (error) {
//     console.log(error.message)
//     process.exit(1)
    
//  }; }