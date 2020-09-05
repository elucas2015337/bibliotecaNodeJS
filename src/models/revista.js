'use stric'

var mongoose = require("mongoose")
var Schema = mongoose.Schema;

var RevistaSchema = Schema({
    autor: String,
    titulo : String,
    edicion: Number,
    palabrasClave: String,
    descripcion: String,
    temas: String,
    copias: Number,
    disponibles: Number,
    frecuencia: String,
    ejemplares: Number,
    prestados: Number

})

module.exports = mongoose.model('revista', RevistaSchema);