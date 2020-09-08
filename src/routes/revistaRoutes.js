'use stric'

var express = require("express")
var RevistaController = require("../controllers/revistaController")
var md_auth = require('../middlewares/authenticated');
const revistaController = require("../controllers/revistaController");


//RUTAS
var api = express.Router();
api.post('/agregarRevista', md_auth.ensureAuth, RevistaController.agregarRevista)
api.put('/editarRevista/:id', md_auth.ensureAuth, RevistaController.editarRevista)
api.delete('/eliminarRevista/:id', md_auth.ensureAuth, RevistaController.eliminarRevista)
api.get('/mostrarRevistas', md_auth.ensureAuth, RevistaController.mostrarRevistas)
api.get('/buscarRevistas', RevistaController.buscarRevista)
api.post('/prestarRevista', md_auth.ensureAuth, RevistaController.prestarRevista)
api.put('/devolverRevista', md_auth.ensureAuth, RevistaController.devolverRevista)

module.exports = api;