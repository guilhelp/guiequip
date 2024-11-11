const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const express = require('express');
const app = express();
const handlebars = require('express-handlebars').engine;
const bodyParser = require('body-parser');

const serviceAccount = require('./serviceAccount.json');

initializeApp({
    credential: cert(serviceAccount),
});

const db = getFirestore();
const auth = getAuth();

app.engine('handlebars', handlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.set("views", __dirname + "/views")
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const authRouter = require("./routers/auth.router");
const colaboradoresRouter = require("./routers/colaboradores.router");
const departamentosRouter = require("./routers/departamentos.router");
const equipamentosRouter = require("./routers/equipamentos.router");
const usuariosRouter = require("./routers/usuarios.router");

app.use("/auth", authRouter);
app.use("/colaboradores", colaboradoresRouter);
app.use("/departamentos", departamentosRouter);
app.use("/equipamentos", equipamentosRouter);
app.use("/usuarios", usuariosRouter);

app.listen(8081, function () {
    console.log('Servidor ativo, rodando na porta localhost:8081');
});
