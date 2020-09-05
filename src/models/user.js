'use stric'

var mongoose = require("mongoose")
var Schema = mongoose.Schema;

var UserSchema = Schema({
    nombre: String,
    identificador: Number,
    apellido: String,
    usuario: String,
    email: String,
    password: String,
    rol: String,
    prestamos: [{
        titulo: String,
        tipo: String,
        autor: String,
        fechaPrestamo: Date,
        codigoBibliografia: { type: Schema.ObjectId, ref: 'producto' },
    }],
})

module.exports = mongoose.model('user', UserSchema);