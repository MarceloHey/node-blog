const mongoose = require('mongoose')
const express = require('express')
const bcrypt = require('bcryptjs')
const { EqualsOperation } = require('sift')
const router = express.Router()
require("../models/Usuario")
const passport = require('passport')

const Usuario = mongoose.model('usuarios')

router.get('/registro', (req, res) => {
    res.render('usuarios/registro')
})

router.post('/registro', (req, res) => {
    const erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome inválido" })
    }
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({ texto: "Email inválido" })
    }
    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({ texto: "Senha inválida" })
    }
    if (!req.body.senha.length > 4) {
        erros.push({ texto: "Senha muito curta" })
    }
    if (!req.body.repetir || typeof req.body.repetir == undefined || req.body.repetir == null) {
        erros.push({ texto: "Senha inválida" })
    }
    if (req.body.senha && req.body.repetir && req.body.senha !== req.body.repetir) {
        erros.push({ texto: "As senhas informadas são diferentes" })
    }

    if (erros.length > 0) {
        res.render('usuarios/registro', { erros: erros })
    } else {
        Usuario.findOne({ email: req.body.email }).then(usuario => {
            if (usuario) {
                req.flash('error_msg', "Já existe um usuário cadastrado com esse e-mail")
                res.redirect('/usuario/registro')
            } else {
                const novoUsuario = {
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha,
                }
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (err, hash) => {
                        if (err) {
                            req.flash('error_msg', "Houve um erro interno, tente novamente")
                            res.redirect('/')
                        } else {
                            novoUsuario.senha = hash
                            new Usuario(novoUsuario).save().then(() => {
                                req.flash("success_msg", "Usuário criado com sucesso !")
                                res.redirect('/')
                            }).catch((err) => {
                                req.flash("error_msg", "Erro ao criar usuário, tente novamente")
                                res.redirect('/usuario/registro')
                            })
                        }
                    })
                })
            }
        }).catch(err => {
            req.flash('error_msg', "Houve um erro interno")
            res.redirect('/')
        })
    }
})

router.get('/login', (req, res) => {
    res.render('usuarios/login')
})

router.post('/login', (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: '/',
        failureRedirect: '/usuario/login',
        failureFlash: true
    })(req, res, next)
})

router.get('/logout', (req, res) => {
    req.logout((err => {
        if (err) {
            return next(err)
        }
        req.flash('success_msg', "Deslogado com sucesso")
        res.redirect('/')
    }))
})

module.exports = router


