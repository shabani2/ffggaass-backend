import mongoose from 'mongoose'
import dotenv from 'dotenv'

 export const dbConnection = async () => {
 try {
    await mongoose.connect(process.env.MONGODB_URL)
    console.log('connection establish successfully')
    
 } catch (error) {
    console.log(error.message)
    process.exit(1)
    
 }
}