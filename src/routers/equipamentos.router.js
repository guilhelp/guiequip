const router = require("express").Router();
const { getFirestore } = require('firebase-admin/firestore');

const db = getFirestore();

// ->>>>>>>>>>>> EQUIPAMENTOS <<<<<<<<<<<<<<<-
router.get('/:departamentoId', async function (req, res) {
    const { departamentoId } = req.params;

    try {
        const equipamentosSnapshot = await db.collection('equipamentos').where('departamentoId', '==', departamentoId).get();
        const equipamentos = equipamentosSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const equipamentosEncontrados = equipamentos.length > 0;

        res.render('EquipamentosPage', {equipamentos, departamentoId, equipamentosEncontrados });
    } catch (error) {
        console.error('Erro ao buscar equipamentos:', error);
        res.status(500).send('Erro ao buscar equipamentos.');
    }
});

router.get('/criar/:departamentoId', async function (req, res) {
    const { departamentoId } = req.params;

    try {
        const colaboradoresSnapshot = await db.collection('colaboradores')
            .where('departamentoId', '==', departamentoId)
            .get();

        const colaboradores = colaboradoresSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.render('CriarEquipamentoPage', { departamentoId, colaboradores });
    } catch (error) {
        console.error('Erro ao buscar colaboradores:', error);
        res.status(500).send('Erro ao buscar colaboradores.');
    }
});

router.post("/criar/:departamentoId", async function (req, res) {
    const { departamentoId } = req.params;
    const { tipoEquipamento, processador, ram, hdSsd, marca, modelo, usuarioId, usuarioNome } = req.body;

    try {
        const equipamentoData = {
            tipoEquipamento: tipoEquipamento,
            modelo: modelo,
            usuario: {
                id: usuarioId,
                nome: usuarioNome
            },
            departamentoId,
        };

        if (tipoEquipamento === 'Notebook') {
            equipamentoData.processador = processador || 'undefined';
            equipamentoData.ram = ram || 'undefined';
            equipamentoData.hdSsd = hdSsd || 'undefined';
            equipamentoData.marca = marca || 'undefined';
            equipamentoData.modelo = modelo || 'undefined';
        } else {
            equipamentoData.marca = marca || 'undefined';
            equipamentoData.modelo = modelo || 'undefined';
        }

        const docRef = await db.collection('equipamentos').add(equipamentoData);
        res.redirect(`/equipamentos/${departamentoId}`);
    } catch (error) {
        console.error("Erro ao cadastrar equipamento:", error);
        res.status(500).send({ message: "Erro ao cadastrar equipamento", error });
    }
});

router.delete('/:equipamentoId', async function (req, res) {
    const { equipamentoId } = req.params;

    try {
        await db.collection('equipamentos').doc(equipamentoId).delete();
        res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar equipamento:', error);
        res.status(500).send('Erro ao deletar equipamento.');
    }
});

router.get('/editar/:equipamentoId', async function (req, res) {
    const { equipamentoId } = req.params;

    try {
        const equipamento = (await db.collection('equipamentos').doc(equipamentoId).get()).data();
        const colaboradoresSnapshot = await db.collection('colaboradores')
            .where('departamentoId', '==', equipamento.departamentoId)
            .get();

        const colaboradores = colaboradoresSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.render('EditarEquipamentoPage', { equipamento, colaboradores, equipamentoId });
    } catch (error) {
        console.error('Erro ao buscar equipamento:', error);
        res.status(500).send('Erro ao buscar equipamento.');
    }
});

router.post('/:departamentoId/:equipamentoId', async function (req, res) {
    const { equipamentoId, departamentoId } = req.params;
    const { tipoEquipamento, processador, ram, hdSsd, marca, modelo, usuarioId, usuarioNome } = req.body;

    try {
        const equipamentoData = {
            tipoEquipamento: tipoEquipamento,
            modelo: modelo,
            usuario: {
                id: usuarioId,
                nome: usuarioNome
            }
        };

        if (tipoEquipamento === 'Notebook') {
            equipamentoData.processador = processador;
            equipamentoData.ram = ram;
            equipamentoData.hdSsd = hdSsd ;
            equipamentoData.marca = marca;
            equipamentoData.modelo = modelo;
        } else {
            equipamentoData.marca = marca;
            equipamentoData.modelo = modelo;
        }

        await db.collection('equipamentos').doc(equipamentoId).update(equipamentoData);
        res.redirect(`/equipamentos/${departamentoId}`);
    } catch (error) {
        console.error("Erro ao editar equipamento:", error);
        res.status(500).send({ message: "Erro ao editar equipamento", error });
    }
});

module.exports = router