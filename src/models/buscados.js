'use stric'

var mongoose = require("mongoose")
var Schema = mongoose.Schema;

var BuscadosSchema = Schema({
    parametro: String,
    numeroBusquedas: Number,
    tipo: String

})

module.exports = mongoose.model('buscados', BuscadosSchema);