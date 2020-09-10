'use stric'

var express = require("express")
var UserController = require("../controllers/userController")
var md_auth = require('../middlewares/authenticated')
const userController = require("../controllers/userController")
userController.crearUsuarioDefecto();


//RUTAS
var api = express.Router();
api.post('/registrar', md_auth.ensureAuth, UserController.registrar)
api.post('/login', UserController.login)
api.put('/editarUsuario/:id', md_auth.ensureAuth, UserController.editarUsuario)
api.delete('/eliminarUsuario/:id', md_auth.ensureAuth, UserController.eliminarUsuario)
api.get('/mostrarUsuarios', md_auth.ensureAuth, UserController.showUser)
api.post('/agregarRevistaLibro', md_auth.ensureAuth, UserController.agregarRevistaLibro)
api.post('/crearPDF', UserController.crearPDF)

module.exports = api;