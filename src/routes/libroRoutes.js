'use stric'

var express = require("express")
var libroController = require("../controllers/libroController")
var md_auth = require('../middlewares/authenticated')


//RUTAS
var api = express.Router();
api.post('/crearLibro', md_auth.ensureAuth, libroController.agregarLibro)
api.post('/prestarLibro', md_auth.ensureAuth, libroController.prestarLibro)
api.put('/editarLibro/:id', md_auth.ensureAuth, libroController.editarLibro)
api.delete('/eliminarLibro/:id', md_auth.ensureAuth, libroController.eliminarLibro)
api.get('/mostrarLibros', md_auth.ensureAuth, libroController.mostrarLibros)
api.get('/buscarLibro', libroController.buscarlibro)
api.put('/devolverLibro', md_auth.ensureAuth, libroController.devolverLibro)
module.exports = api;