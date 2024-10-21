import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

const generateToken = (res,userId) => {
    const token = jwt.sign({userId},secrets.JWT_SECRET,{expiresIn:'30d',})
    //test avec les objets
    // const token = jwt.sign(
    //     {
    //         userId: user._id,
    //         nom: user.nom,
    //         postnom: user.postnom,
    //         prenom: user.prenom,
    //         role: user.role,
    //         pointVente: user.pointVente,
    //     },
    //     process.env.JWT_SECRET,
    //     { expiresIn: '30d' }
    // );
    res.cookie('jwt',token,{
        httpOnly : true,
        secure : process.env.NODE_ENV !== 'developpement',
        sameSite: 'strict', 
        maxAge : 30 * 24 * 60*60*1000
    })
    return token;
  
}

export default generateToken