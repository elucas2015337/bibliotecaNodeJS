'use stric'

var express = require("express")
var libroController = require("../controllers/libroController")
var md_auth = require('../middlewares/authenticated')


//RUTAS
var api = express.Router();
api.post('/crearLibro', md_auth.ensureAuth, libroController.agregarLibro)
api.put('/editarLibro/:id', md_auth.ensureAuth, libroController.editarLibro)
api.delete('/eliminarLibro/:id', md_auth.ensureAuth, libroController.eliminarLibro)
//api.get('/listarCategorias', libroController.listarCategorias)
api.get('/mostrarLibros', md_auth.ensureAuth, libroController.mostrarLibros)
api.get('/buscarLibro', libroController.buscarlibro)
module.exports = api;