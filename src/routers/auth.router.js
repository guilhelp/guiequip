const router = require("express").Router();

router.get('/', function (req, res) {
    res.render('LoginPage');
});

router.post('/login', async function (req, res) {
    const { email, password } = req.body;

    try {
       
        const userRecord = await auth.getUserByEmail(email);
        const userSnapshot = await db.collection('users').doc(userRecord.uid).get();
        
        if (userSnapshot.exists) {
            const userData = userSnapshot.data();
            
            if (userData.role === 'admin') {
                return res.redirect('/departamentos-admin');
            } else {
                return res.redirect('/departamentos');
            }
        } else {
            res.status(404).send('Usuário não encontrado no Firestore.');
        }
    } catch (error) {
        console.error('Erro ao autenticar o usuário:', error);
        res.status(500).send('Erro ao autenticar o usuário.');
    }
});

router.get('/logout', function (req, res) {
    res.redirect('/');
});

module.exports = router