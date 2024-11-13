const { initializeApp, cert } = require('firebase-admin/app');
const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');

const serviceAccount = require('./serviceAccount.json');

initializeApp({
    credential: cert(serviceAccount),
});

const hbs = handlebars.create({
    defaultLayout: 'main',
    helpers: {
        eq: function (a, b) {
            return a === b;
        }
    }
});

const session = require('express-session');
app.use(session({
    secret: 'guilherme',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));


app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set("views", __dirname + "/views");
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const authRouter = require("./routers/auth.router");
const colaboradoresRouter = require("./routers/colaboradores.router");
const departamentosRouter = require("./routers/departamentos.router");
const equipamentosRouter = require("./routers/equipamentos.router");
const usuariosRouter = require("./routers/usuarios.router");

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/auth');
}

app.use("/auth", authRouter);
app.use("/colaboradores", isAuthenticated, colaboradoresRouter);
app.use("/departamentos", isAuthenticated, departamentosRouter);
app.use("/equipamentos", isAuthenticated, equipamentosRouter);
app.use("/usuarios", isAuthenticated, usuariosRouter);

app.listen(8081, function () {
    console.log('Servidor ativo, rodando na porta localhost:8081');
});
