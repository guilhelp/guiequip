const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const express = require('express');
const app = express();
const handlebars = require('express-handlebars').engine;
const bodyParser = require('body-parser');

const serviceAccount = require('./guiequip-firebase-adminsdk-39ysp-500663d575.json');

initializeApp({
    credential: cert(serviceAccount),
});

const db = getFirestore();
const auth = getAuth();

app.engine('handlebars', handlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.render('LoginPage');
});

app.post('/login', async function (req, res) {
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

app.get('/logout', function (req, res) {
    res.redirect('/');
});

// ->>>>>>>>>>>> DEPARTAMENTOS <<<<<<<<<<<<<<<-
app.get('/departamentos-admin', async function (req, res) {
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

app.get('/departamentos', async function (req, res) {
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

app.get('/departamento/:id', async function (req, res) {
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

app.get('/criar-departamento', function (req, res) {
    res.render('CriarDepartamentoPage');
});

app.post("/criar-departamento", async function (req, res) {
    const { nome, descricao } = req.body;

    try {
        
        await db.collection('departamentos').doc().set({
            nome,
            descricao,
        });

        res.redirect('/departamentos-admin');
    } catch (error) {
        console.error('Erro ao criar o departamento:', error);
        res.status(500).send('Erro ao criar o departamento.');
    }
});


// ->>>>>>>>>>>> EQUIPAMENTOS <<<<<<<<<<<<<<<-
app.get('/equipamentos/:departamentoId', async function (req, res) {
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

app.get('/criar-equipamento/:departamentoId', function (req, res) {
    const { departamentoId } = req.params;

    res.render('CriarEquipamentoPage', { departamentoId });
});

app.post("/criar-equipamento/:departamentoId", async function (req, res) {
   
});


// ->>>>>>>>>>>> COLABORADORES <<<<<<<<<<<<<<<-
app.get('/colaboradores/:departamentoId', async function (req, res) {
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

app.get('/criar-colaborador/:departamentoId', function (req, res) {
    const { departamentoId } = req.params;

    res.render('CriarColaboradorPage', { departamentoId });
});

app.post("/criar-colaborador/:departamentoId", async function (req, res) {
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

app.delete('/colaboradores/:id', async function (req, res) {
    const { id } = req.params;

    try {
        await db.collection('colaboradores').doc(id).delete();

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar o colaborador:', error);
        res.status(500).send('Erro ao deletar o colaborador.');
    }
});

app.get('/editar-colaborador/:id', async function (req, res) {
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

app.post('/colaboradores/:departamentoId/:id', async function (req, res) {
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


// ->>>>>>>>>>>> PERFIL <<<<<<<<<<<<<<<-
app.get('/editar-perfil', async function (req, res) {
    
});


// ->>>>>>>>>>>> USERS <<<<<<<<<<<<<<<-
app.get('/usuarios', async function (req, res) {
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

app.get('/criar-usuario', function (req, res) {
    res.render('CriarUsuariosPage');
});

app.post("/criar-usuario", async function (req, res) {
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


app.delete('/usuarios/:id', async function (req, res) {
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

app.get('/editar-usuario/:id', async function (req, res) {
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

app.post('/usuarios/:id', async function (req, res) {
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




app.listen(8081, function () {
    console.log('Servidor ativo, rodando na porta localhost:8081');
});
