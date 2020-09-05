'use stric'

var mongoose = require("mongoose")
var Schema = mongoose.Schema;

var LibroSchema = Schema({
    autor: String,
    titulo : String,
    edicion: Number,
    palabrasClave: String,
    descripcion: String,
    temas: String,
    copias: Number,
    disponibles: Number,
    prestados: Number

})

module.exports = mongoose.model('libro', LibroSchema);