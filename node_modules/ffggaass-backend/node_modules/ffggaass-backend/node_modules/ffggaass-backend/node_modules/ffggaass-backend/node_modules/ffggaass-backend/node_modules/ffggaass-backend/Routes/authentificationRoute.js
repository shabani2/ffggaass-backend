import express from 'express'
import { loggedout, login, register } from '../Controllers/authentificationController.js'
// import { register,loggedout,login } from '../Controllers/authentificationController.js'

const authRoute = express.Router()

//register route
authRoute.post('/register',register)
authRoute.post('/login',login)
authRoute.post('/loggedout',loggedout)

authRoute.post('/done', async (req, res) => {
    try{
        res.json({
            status : 'done',
            data : 'api create action'
        });
 
    }catch(error){
        res.json(error.message)
    }
     
 });
 

export default authRoute