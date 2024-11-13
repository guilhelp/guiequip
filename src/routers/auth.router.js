const router = require("express").Router();
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

const db = getFirestore();
const auth = getAuth();

router.get('/', function (req, res) {
    res.render('LoginPage');
});

router.post('/login', async function (req, res) {
    const { token } = req.body;

    try {
        const decodedToken = await auth.verifyIdToken(token);
        const uid = decodedToken.uid;

        let userRef = db.collection('usuarios').doc(uid);
        let userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            await userRef.set({
                email: decodedToken.email,
                nome: decodedToken.name,
                foto: decodedToken.picture,
                criadoEm: new Date(),
            });
        }

        req.session.user = { uid, email: decodedToken.email };
        res.status(200).json({ success: true, message: 'Usuário autenticado com sucesso' });

    } catch (error) {
        console.error('Erro ao verificar o token:', error);
        res.status(401).json({ success: false, message: 'Falha na autenticação' });
    }
});

router.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/auth');
});

module.exports = router;