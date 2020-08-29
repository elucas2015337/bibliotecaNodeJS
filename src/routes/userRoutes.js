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
//api.put('/editarClientes/:id', md_auth.ensureAuth, UserController.editarClientes)
api.delete('/eliminarUsuario/:id', md_auth.ensureAuth, UserController.eliminarUsuario)
//api.put('/agregar_a_Carrito', md_auth.ensureAuth, UserController.añadirCarrito)
//api.put('/comprar', md_auth.ensureAuth, UserController.comprar)
//api.get('/facturasXcliente', md_auth.ensureAuth, UserController.facturasUsuario)
//api.get('/productosXfactura', md_auth.ensureAuth, UserController.productoXFactura)
//api.post('/crearPDF', UserController.createPDF)

module.exports = api;