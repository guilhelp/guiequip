const router = require("express").Router();

// ->>>>>>>>>>>> EQUIPAMENTOS <<<<<<<<<<<<<<<-
router.get('/equipamentos/:departamentoId', async function (req, res) {
    const { departamentoId } = req.params;

    try {
        const equipamentosSnapshot = await db.collection('equipamentos').where('departamentoId', '==', departamentoId).get();
        const equipamentos = equipamentosSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.render('EquipamentosPage', { equipamentos, departamentoId });
    } catch (error) {
        console.error('Erro ao buscar equipamentos:', error);
        res.status(500).send('Erro ao buscar equipamentos.');
    }
});

router.get('/criar-equipamento/:departamentoId', function (req, res) {
    const { departamentoId } = req.params;

    res.render('CriarEquipamentoPage', { departamentoId });
});

router.post("/criar-equipamento/:departamentoId", async function (req, res) {
   
});

module.exports = router