module.exports = {
    isAdmin: (req, res, next) => {
        if (req.isAuthenticated() && req.user.isAdmin == 1) {
            return next()
        }
        req.flash('error_msg', "Vece deve estar logado como admin para entrar aqui")
        res.redirect('/')
    }
}