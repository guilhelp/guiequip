const router = require("express").Router();
const { getFirestore } = require('firebase-admin/firestore');

const db = getFirestore();

// ->>>>>>>>>>>> COLABORADORES <<<<<<<<<<<<<<<-
router.get('/:departamentoId', async function (req, res) {
    const { departamentoId } = req.params;

    try {
        const colaboradoresSnapshot = await db.collection('colaboradores').where('departamentoId', '==', departamentoId).get();
        const colaboradores = colaboradoresSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.render('ColaboradoresPage', { colaboradores, departamentoId });
    } catch (error) {
        console.error('Erro ao buscar equipamentos:', error);
        res.status(500).send('Erro ao buscar equipamentos.');
    }
});

router.get('/criar-colaborador/:departamentoId', function (req, res) {
    const { departamentoId } = req.params;

    res.render('CriarColaboradorPage', { departamentoId });
});

router.post("/criar-colaborador/:departamentoId", async function (req, res) {
    const { departamentoId } = req.params;
    const { nome, cargo } = req.body;

    try {
        await db.collection('colaboradores').doc().set({
            nome,
            cargo,
            departamentoId,
        });

        res.redirect(`/colaboradores/${departamentoId}`);
    } catch (error) {
        console.error('Erro ao criar o colaborador:', error);
        res.status(500).send('Erro ao criar o colaborador.');
    }
});

router.delete('/:id', async function (req, res) {
    const { id } = req.params;

    try {
        await db.collection('colaboradores').doc(id).delete();

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar o colaborador:', error);
        res.status(500).send('Erro ao deletar o colaborador.');
    }
});

router.get('/editar-colaborador/:id', async function (req, res) {
    const { id } = req.params;

    try {
        const colaboradorSnapshot = await db.collection('colaboradores').doc(id).get();
        const colaborador = colaboradorSnapshot.data();

        res.render('EditarColaboradorPage', {colaborador, id});
    } catch (error) {
        console.error('Erro ao buscar o colaborador:', error);
        res.status(500).send('Erro ao buscar o colaborador.');
    }
});

router.post('/:departamentoId/:id', async function (req, res) {
    const { id, departamentoId } = req.params;
    const { nome, cargo } = req.body;

    try {
        await db.collection('colaboradores').doc(id).update({
            nome,
            cargo,
        });

        res.redirect(`/colaboradores/${departamentoId}`);
    } catch (error) {
        console.error('Erro ao editar o colaborador:', error);
        res.status(500).send('Erro ao editar o colaborador.');
    }
});

module.exports = router
