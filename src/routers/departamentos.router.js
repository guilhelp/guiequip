const router = require("express").Router();

router.get('/departamentos-admin', async function (req, res) {
    try {
        const departamentosSnapshots = await db.collection('departamentos').get();
        const departamentos = departamentosSnapshots.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.render('DepartamentosPage', { departamentos });
    } catch (error) {
        console.error('Erro ao buscar departamentos:', error);
        res.status(500).send('Erro ao buscar departamentos.');
    }
});

router.get('/departamentos', async function (req, res) {
    try {
        const departamentosSnapshots = await db.collection('departamentos').get();
        const departamentos = departamentosSnapshots.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.render('DepartamentosUsuarioPage', { departamentos });
    } catch (error) {
        console.error('Erro ao buscar departamentos:', error);
        res.status(500).send('Erro ao buscar departamentos.');
    }
});

router.get('/departamento/:id', async function (req, res) {
    const departamentoId = req.params.id;

    try {
        const departamentoDoc = await db.collection('departamentos').doc(departamentoId).get();

        if (!departamentoDoc.exists) {
            return res.status(404).send('Departamento não encontrado.');
        }

        const departamento = { id: departamentoDoc.id, ...departamentoDoc.data() };

        res.render('DashboardPage', { departamento });
    } catch (error) {
        console.error('Erro ao buscar departamento:', error);
        res.status(500).send('Erro ao buscar departamento.');
    }
});

router.get('/criar-departamento', function (req, res) {
    res.render('CriarDepartamentoPage');
});

router.post("/criar-departamento", async function (req, res) {
    const { nome, descricao } = req.body;

    try {
        
        await db.collection('departamentos').doc().set({
            nome,
            descricao,
        })

        res.redirect('/departamentos-admin')
    } catch (error) {
        console.error('Erro ao criar o departamento:', error)
        res.status(500).send('Erro ao criar o departamento.')
    }
});

module.exports = router