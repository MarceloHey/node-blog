const express = require('express')
const router = express.Router()

require("../models/Categoria")
require("../models/Postagem")
const mongoose = require('mongoose')
const Categoria = mongoose.model('categorias')
const Postagem = mongoose.model('postagens')



router.get('/', (req, res) => {
    res.render('admin/index')
})

router.get('/posts', (req, res) => {
    res.send('Página de posts do painel adm')
})

router.get('/categorias', (req, res) => {
    Categoria.find().sort({ date: 'DESC' }).lean()
        .then((categorias) => {
            res.render('admin/categorias', { categorias: categorias })
        })
        .catch((err) => {
            req.flash("error_msg", "Erro ao listar categorias")
            res.redirect('/admin')
        })
})

router.get('/categorias/add', (req, res) => {
    res.render('admin/addCategorias')
})

router.post('/categorias/nova', (req, res) => {
    const erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome === null) {
        erros.push({ texto: "Nome inválido" })
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug === null) {
        erros.push({ texto: "Slug inválido" })
    }
    if (req.body.nome.length < 2) {
        erros.push({ texto: "Nome da categotria muito curto" })
    }

    if (erros.length > 0) {
        res.render("admin/addCategorias", { erros: erros })
    } else {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        new Categoria(novaCategoria).save()
            .then(() => {
                req.flash("success_msg", "Categoria criada com sucesso !")
                res.redirect('/admin/categorias')
            }).catch((err) => {
                req.flash("error_msg", "Erro ao salvar categoria, tente novamente")
                res.redirect('/admin')
            })
    }



})

router.get('/categorias/edit/:id', (req, res) => {
    Categoria.findOne({ _id: req.params.id }).lean().then((categoria) => {
        res.render("admin/editCategoria", { categoria: categoria })
    }).catch((err) => {
        req.flash("error_msg", "Essa categoria nao existe")
        res.redirect('/admin/categorias')
    })

})

router.post('/categorias/edit', (req, res) => {
    const erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome === null) {
        erros.push({ texto: "Nome inválido" })
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug === null) {
        erros.push({ texto: "Slug inválido" })
    }
    if (req.body.nome.length < 2) {
        erros.push({ texto: "Nome da categotria muito curto" })
    }

    if (erros.length > 0) {
        Categoria.findOne({ _id: req.body._id }).lean().then(categoria => {
            console.log(categoria)
            res.render("admin/editCategoria", { categoria: categoria, erros: erros })
        })
    } else {
        Categoria.findOne({ _id: req.body._id }).then((categoria) => {
            categoria.nome = req.body.nome
            categoria.slug = req.body.slug

            categoria.save().then(() => {
                req.flash('success_msg', "Categoria editada com sucesso !")
                res.redirect('/admin/categorias')
            })

        }).catch(err => {
            req.flash('error_msg', "Erro ao editar categoria")
        })
    }
})


router.get('/categorias/delete/:id', (req, res) => {
    Categoria.deleteOne({ _id: req.params.id }).then(() => {
        req.flash('success_msg', "Categoria removida com sucesso !")
        res.redirect('/admin/categorias')
    })
})

router.get('/postagens', (req, res) => {
    Postagem.find().lean().populate("categoria").sort({ data: "DESC" }).then(postagens => {
        res.render('admin/postagens', { postagens: postagens })
    }).catch(err => {
        req.flash("error_msg", "Erro ao carregar postagens")
        res.render('/admin')
    })
})

router.get('/postagens/add', (req, res) => {
    Categoria.find().lean().then(categorias => {
        res.render("admin/addPostagens", { categorias: categorias })
    }).catch(err => {
        req.flash("error_msg", "Erro ao carregar formulário")
        res.redirect('/admin')
    })
})

router.post('/postagens/nova', (req, res) => {
    const erros = []

    if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo === null) {
        erros.push({ texto: "Título inválido" })
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug === null) {
        erros.push({ texto: "Slug inválido" })
    }
    if (!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao === null) {
        erros.push({ texto: "Descrição inválida" })
    }
    if (!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo === null) {
        erros.push({ texto: "Conteúdo inválido" })
    }
    if (req.body.categoria == 0) {
        erros.push({ texto: "Categoria inválida" })
    }
    if (req.body.titulo.length < 2) {
        erros.push({ texto: "Titulo da postagem muito curto" })
    }

    if (erros.length > 0) {
        Categoria.find().lean().then(categorias => {
            res.render("admin/addPostagens", { erros: erros, categorias: categorias })
        }).catch(err => {
            req.flash("error_msg", "Erro ao carregar formulário")
            res.redirect('/admin')
        })
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }
        new Postagem(novaPostagem).save()
            .then(() => {
                req.flash("success_msg", "Postagem criada com sucesso !")
                res.redirect('/admin/postagens')
            }).catch((err) => {
                req.flash("error_msg", "Erro ao salvar postagem, tente novamente")
                res.redirect('/admin')
            })
    }
})

router.get('/postagens/edit/:id', (req, res) => {
    Categoria.find().lean().then(categorias => {
        Postagem.findOne({ _id: req.params.id }).lean().then((postagem) => {
            res.render("admin/editPostagem", { categorias: categorias, postagem: postagem })
        }).catch((err) => {
            req.flash("error_msg", "Essa postagem nao existe")
            res.redirect('/admin/postagens')
        })
    }).catch(err => {
        req.flash("error_msg", "Erro ao carregar formulário")
        res.redirect('/admin')
    })


})

router.post('/postagens/edit', (req, res) => {
    const erros = []

    if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo === null) {
        erros.push({ texto: "Título inválido" })
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug === null) {
        erros.push({ texto: "Slug inválido" })
    }
    if (!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao === null) {
        erros.push({ texto: "Descrição inválida" })
    }
    if (!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo === null) {
        erros.push({ texto: "Conteúdo inválido" })
    }
    if (req.body.categoria == 0) {
        erros.push({ texto: "Categoria inválida" })
    }
    if (req.body.titulo.length < 2) {
        erros.push({ texto: "Titulo da postagem muito curto" })
    }

    if (erros.length > 0) {
        Categoria.find().lean().then(categorias => {
            Postagem.findOne({ _id: req.body._id }).lean().then((postagem) => {
                res.render("admin/editPostagem", { categorias: categorias, postagem: postagem, erros: erros })
            }).catch((err) => {
                req.flash("error_msg", "Essa postagem nao existe")
                res.redirect('/admin/postagens')
            })
        })
    } else {
        Postagem.findOne({ _id: req.body._id }).then((postagem) => {
            postagem.titulo = req.body.titulo
            postagem.slug = req.body.slug
            postagem.descricao = req.body.descricao
            postagem.conteudo = req.body.conteudo
            postagem.categoria = req.body.categoria

            postagem.save().then(() => {
                req.flash('success_msg', "Postagem editada com sucesso !")
                res.redirect('/admin/postagens')
            })
        }).catch(err => {
            req.flash('error_msg', "Erro ao editar postagem" + err)
            res.redirect('/admin/postagens')
        })
    }
})

router.get('/postagens/delete/:id', (req, res) => {
    Postagem.deleteOne({ _id: req.params.id }).then(() => {
        req.flash('success_msg', "Postagem removida com sucesso !")
        res.redirect('/admin/postagens')
    })
})

module.exports = router