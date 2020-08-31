'use stric'

var express = require("express")
var RevistaController = require("../controllers/revistaController")
var md_auth = require('../middlewares/authenticated')


//RUTAS
var api = express.Router();
api.post('/agregarRevista', md_auth.ensureAuth, RevistaController.agregarRevista)
api.put('/editarRevista/:id', md_auth.ensureAuth, RevistaController.editarRevista)
api.delete('/eliminarRevista/:id', md_auth.ensureAuth, RevistaController.eliminarRevista)
//api.get('/listarProductos', RevistaController.listarProductos)
//api.get('/buscarProductosNombre', RevistaController.buscarProductoNombre)
//api.get('/productosAgotados', md_auth.ensureAuth, RevistaController.productosAgotados)
//api.get('/productosMasVendidos', md_auth.ensureAuth, RevistaController.productosMasVendidos)

module.exports = api;