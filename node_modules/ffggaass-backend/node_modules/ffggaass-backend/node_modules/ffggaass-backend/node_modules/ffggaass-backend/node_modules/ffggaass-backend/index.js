//import { express } from "Express";
import dotenv   from 'dotenv'
//import { configDotenv } from 'dotenv'
import {dbConnection } from './Config/dbConnection.js'
import express from 'express'
import { errorHandler, notFound } from './Middlewares/errorHandler.js';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import authRoute from './Routes/authentificationRoute.js';
import CategoryRoute from './Routes/CategoryRoute.js';
import mvtRoute from './Routes/mvtRoute.js';
import ProduitRoute from './Routes/ProduitRoute.js';
import PointeVenteRoute from './Routes/PointVenteRoute.js'
import seuilRoute from './Routes/SeuilRoute.js'
import path from 'path'; // path fonctionne avec ES6 aussi
import { fileURLToPath } from 'url'

import cors from 'cors'
import userRoute from './Routes/UserRoute.js';
import fileRouter from './Routes/fileManagementRoute.js';
import ClientRouter from './Routes/clientRoute.js';
import commandeRouter from './Routes/commandeRoute.js';
import venteRouter from './Routes/venteRoute.js';
import livraisonRouter from './Routes/livraisonRoute.js';
import variationRouter from './Routes/stockVariationRoute.js';
import bonEntreRouter from './Routes/bonEntreRoute.js';
import stockLocalRouter from './Routes/stockLocalRoute.js';
import pdfGeneratorRouter from './Routes/PdfGeneratorRoute.js';
import GeneralRouter from './Routes/generalRouter.js';




dotenv.config();
const app = express();

const allowedOrigins = ['http://localhost:5173',
   'http://localhost:5174', 
   'https://www.agrecavente.online',
   'http://localhost:8080','https://inaf-vente.netlify.app',];

// Configuration de CORS
app.use(cors({
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origin (comme les clients Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Permettre les cookies
}));


dbConnection();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cookieParser());

// Trouver le chemin du fichier courant en ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir les fichiers statiques du dossier 'uploads'
app.use('/api/ffggaass/uploads', express.static(path.join(__dirname, 'uploads')));



//routes
app.use('/api/ffggaass/auth',authRoute)
app.use('/api/ffggaass/category',CategoryRoute)
app.use('/api/ffggaass/pointvente',PointeVenteRoute)
app.use('/api/ffggaass/mvtstock',mvtRoute)
app.use('/api/ffggaass/produit',ProduitRoute)
app.use('/api/ffggaass/seuil',seuilRoute)

app.use('/api/ffggaass/user',userRoute)
app.use('/api/ffggaass/clients',ClientRouter)
app.use('/api/ffggaass/commande',commandeRouter)
app.use('/api/ffggaass/vente',venteRouter)
app.use('/api/ffggaass/livraison',livraisonRouter)
app.use('/api/ffggaass/stockVariations',variationRouter)
app.use('/api/ffggaass/bonEntre',bonEntreRouter)
app.use('/api/ffggaass/stockLocal',stockLocalRouter)
app.use('/api/ffggaass/print',pdfGeneratorRouter)
app.use('/api/ffggaass/generale',GeneralRouter)



//route pour exportation to excel
app.use('/api/ffggaass/file',fileRouter)




//app.use('/crud-api/users',userRoute);
app.get('/', async (req, res) => {
   try{
       res.json({
           status : 'ffggaass api application',
           data : 'api create action'
       });

   }catch(error){
       res.json(error.message)
   }
    
});



 

//connection to mongodb call


 //middlewares

 

 //error handling midleware

 app.use(notFound);
 app.use(errorHandler)

 //listen toserver
 const Port = process.env.PORT || 9091
app.listen(Port,console.log(`server is running on port ${Port}`))
//app.listen(Port,console.log('connection var = '+ process.env.MONGODB_URL_ONLINE))
