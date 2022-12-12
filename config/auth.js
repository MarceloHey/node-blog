const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

require('../models/Usuario')
const Usuario = mongoose.model('usuarios')


module.exports = function (passport) {
    passport.use(new localStrategy({
        usernameField: 'email',
        passwordField: 'senha'
    }, (email, senha, done) => {
        Usuario.findOne({ email: email }).then(usuario => {
            if (!usuario) {
                return done(null, false, { message: "Esta conta não existe" })
            } else {
                bcrypt.compare(senha, usuario.senha, (erro, batem) => {
                    if (batem) {
                        return done(null, usuario)
                    } else {
                        return done(null, false, { message: "Senha incorreta" })
                    }
                })
            }
        })
    }))

    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser((id, done) => {
        try {
            Usuario.findById(id, (err, usuario) => {
                done(err, usuario)
            })
        } catch (err) {
            console.log(err)
        }
    })
}