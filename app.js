// IMPORTS
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')

const adminRoutes = require('./routes/admin')
const usuarioRoutes = require('./routes/usuario')
const passport = require('passport')

const Postagem = mongoose.model('postagens')
const Categoria = mongoose.model('categorias')
const Usuario = mongoose.model('usuarios')

require('./config/auth')(passport)

const { isAdmin } = require('./helpers/isAdmin')




//CONFIGS
const app = express()

//sessão
app.use(session({
    secret: "cursonode",
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

// middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    res.locals.user = req.user || null
    next()
})

// body parser
app.use(bodyParser.urlencoded({ extend: true }))
app.use(bodyParser.json())

// handlebars
app.engine('handlebars', handlebars.engine({ defaultLayout: 'main', runtimeOptions: { allowProtoPropertiesByDefault: true } }))
app.set('view engine', 'handlebars')

//mongoose
mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost:27017/projetinhoBlog')
    .then(() => {
        console.log('Conexão com o DB feita com sucesso');
    }).catch((err) => {
        console.log('Erro ao se conectar ao DB' + err);
    })

//ROUTES

app.get('/', (req, res) => {
    Postagem.find().lean().populate("categoria").sort({ data: "DESC" }).then(postagens => {
        res.render('index', { postagens: postagens })
    }).catch(err => {
        req.flash("error_msg", "Erro ao carregar postagens")
        res.redirect('/404')
    })
})

app.get('/postagem/:slug', (req, res) => {
    Postagem.findOne({ slug: req.params.slug }).lean().then(postagem => {
        if (postagem) {
            res.render('postagem/index', { postagem: postagem })
        } else {
            req.flash("error_msg", "Essa postagem não existe")
            res.redirect('/')
        }
    }).catch(err => {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect('/')
    })
})

app.get('/categorias', (req, res) => {
    Categoria.find().lean().then(categorias => {
        res.render('categoria/index', { categorias: categorias })
    }).catch(err => {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect('/')
    })
})

app.get('/categorias/:slug', (req, res) => {
    Categoria.findOne({ slug: req.params.slug }).lean().then(categoria => {
        if (categoria) {
            Postagem.find({ categoria: categoria._id }).lean().then(postagens => {
                res.render('postagem/porCategoria', { categoria: categoria, postagens: postagens })
            }).catch(err => {
                req.flash("error_msg", "Houve um erro interno")
                res.redirect('/categorias')
            })
        } else {
            req.flash("error_msg", "Essa categoria não existe")
            res.redirect('/categorias')
        }
    }).catch(err => {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect('/categorias')
    })
})

app.use('/admin', isAdmin, adminRoutes)
app.use('/usuario', usuarioRoutes)

//STATIC FILES
app.use(express.static(path.join(__dirname, 'public')))

//OTHER
const PORT = 8081
app.listen(PORT, () => {
    console.log('Servidor rodando')
})



