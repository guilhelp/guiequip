const router = require("express").Router();

// ->>>>>>>>>>>> USERS <<<<<<<<<<<<<<<-
router.get('/usuarios', async function (req, res) {
    try {
        const usersSnapshot = await db.collection('users').where('role', '!=', 'admin').get();
        const users = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.render('UsuariosPage', { users });
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).send('Erro ao buscar usuários.');
    }
});

router.get('/criar-usuario', function (req, res) {
    res.render('CriarUsuariosPage');
});

router.post("/criar-usuario", async function (req, res) {
    const { nome, email, password, role } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return res.status(400).send('Por favor, insira um email válido.');
    }

    try {
        const users = await auth.listUsers(); 
        const emailExists = users.users.some(user => user.email === email);

        if (emailExists) {
            return res.status(400).send('Este email já está em uso. Por favor, use outro.');
        }

        const userRecord = await auth.createUser({
            email,
            password,
        });

        await db.collection('users').doc(userRecord.uid).set({
            nome,
            email,
            role: role || 'user',
        });

        res.redirect('/usuarios');
    } catch (error) {
        console.error('Erro ao criar o usuário:', error);
        res.status(500).send('Erro ao criar o usuário.');
    }
});


router.delete('/usuarios/:id', async function (req, res) {
    const { id } = req.params;

    try {
        await auth.deleteUser(id);
        await db.collection('users').doc(id).delete();

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar o usuário:', error);
        res.status(500).send('Erro ao deletar o usuário.');
    }
});

router.get('/editar-usuario/:id', async function (req, res) {
    const { id } = req.params;

    try {
        const userSnapshot = await db.collection('users').doc(id).get();
        const user = userSnapshot.data();

        res.render('EditarUsuariosPage', { user, id });
    } catch (error) {
        console.error('Erro ao buscar o usuário:', error);
        res.status(500).send('Erro ao buscar o usuário.');
    }
});

router.post('/usuarios/:id', async function (req, res) {
    const { id } = req.params;
    const { nome, email, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return res.status(400).send('Por favor, insira um email válido.');
    }

    try {
       
        const users = await auth.listUsers(); 
        const emailExists = users.users.some(user => user.email === email && user.uid !== id); // Verifica se o email já existe, ignorando o usuário atual

        if (emailExists) {
            return res.status(400).send('Este email já está em uso. Por favor, use outro.');
        }

        if (password) {
            await auth.updateUser(id, {
                email,
                password,
            });
        } else {
            await auth.updateUser(id, {
                email,
            });
        }

        await db.collection('users').doc(id).update({
            nome,
            email,
        });

        res.redirect('/usuarios');
    } catch (error) {
        console.error('Erro ao editar o usuário:', error);
        res.status(500).send('Erro ao editar o usuário.');
    }
});

router.get('/editar-perfil', async function (req, res) {
    
});

module.exports = router