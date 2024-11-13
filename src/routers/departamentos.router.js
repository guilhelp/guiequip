const router = require("express").Router();
const { Router } = require("express");
const { getFirestore } = require('firebase-admin/firestore');

const db = getFirestore();

router.get('/', async function (req, res) {
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

router.get('/criar', function (req, res) {
    res.render('CriarDepartamentoPage');
});

router.post("/criar-departamento", async function (req, res) {
    const { nome, descricao } = req.body;

    try {
        
        await db.collection('departamentos').doc().set({
            nome,
            descricao,
        })

        res.redirect('/departamentos')
    } catch (error) {
        console.error('Erro ao criar o departamento:', error)
        res.status(500).send('Erro ao criar o departamento.')
    }
});

router.delete('/:id', async function (req, res) {
    const { id } = req.params;

    try {
   
        const colaboradoresSnapshot = await db.collection('colaboradores')
            .where('departamentoId', '==', id)
            .get();

        const deleteColaboradoresPromises = colaboradoresSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deleteColaboradoresPromises);

        const equipamentosSnapshot = await db.collection('equipamentos')
            .where('departamentoId', '==', id)
            .get();

        const deleteEquipamentosPromises = equipamentosSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deleteEquipamentosPromises);

        await db.collection('departamentos').doc(id).delete();

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar departamento e seus relacionados:', error);
        res.status(500).send('Erro ao deletar departamento e seus dados relacionados.');
    }
});

router.get('/editar/:id', async function (req, res) {
    const { id } = req.params;

    try {
        const departamentoDoc = await db.collection('departamentos').doc(id).get();

        if (!departamentoDoc.exists) {
            return res.status(404).send('Departamento não encontrado.');
        }

        const departamento = { id: departamentoDoc.id, ...departamentoDoc.data() };

        res.render('EditarDepartamentoPage', { departamento, id });
    } catch (error) {
        console.error('Erro ao buscar departamento:', error);
        res.status(500).send('Erro ao buscar departamento.');
    }
});

router.post('/editar/:id', async function (req, res) {
    const { id } = req.params;
    const { nome, descricao } = req.body;

    try {
        await db.collection('departamentos').doc(id).update({
            nome,
            descricao,
        });

        res.redirect('/departamentos');
    } catch (error) {
        console.error('Erro ao editar departamento:', error);
        res.status(500).send('Erro ao editar departamento.');
    }
});

router.get('/:departamentoId/dashboard', async function (req, res) {
    const { departamentoId } = req.params;

    try {
        const colaboradoresSnapshot = await db.collection('colaboradores')
            .where('departamentoId', '==', departamentoId)
            .get();
        const colaboradores = colaboradoresSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const equipamentosSnapshot = await db.collection('equipamentos')
            .where('departamentoId', '==', departamentoId)
            .get();
        const equipamentos = equipamentosSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.render('DashboardPage', {
            departamentoId,
            totalColaboradores: colaboradores.length,
            totalEquipamentos: equipamentos.length
        });
    } catch (error) {
        console.error('Erro ao buscar dados do departamento:', error);
        res.status(500).send('Erro ao buscar dados do departamento.');
    }
});


module.exports = router