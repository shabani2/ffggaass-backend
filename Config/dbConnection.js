import mongoose from 'mongoose'
import dotenv from 'dotenv'

 export const dbConnection = async () => {
 try {
   console.info('con zone')
  // console.log('connection var = '+ process.env.MONGODB_URL_ONLINE);
    await mongoose.connect(process.env.MONGODB_URL_ONLINE)
    console.log('connection establish successfully')
    
 } catch (error) {
    console.log(error.message)
    process.exit(1)
    
 }
}