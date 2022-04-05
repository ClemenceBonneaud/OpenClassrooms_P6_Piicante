const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, 'MY_FIRST_TOKEN_SECRET');
        const userId = decodedToken.userId;
        req.auth = { userId: userId };
        if(req.body.userId && req.body.userId !== userId) {
            throw 'User ID non valable';
        } else {
            console.log("Utilisateur bien identifié !");
            next();
        }
    } catch (error) {
        res.status(403).json({ error: error | 'Requete non authentifiée' });
    }
};