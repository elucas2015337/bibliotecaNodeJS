'use strict'

//IMPORTS
var bcrypt = require('bcrypt-nodejs')
var User =  require('../models/user')
var libroController = require('./libroController')
var revistaController = require('./revistaController')
var Producto = require('../models/libro')

var jwt  = require("../services/jwt")
var path = require('path')
var fs = require('fs')

var pdf = require("pdfkit")

function registrar(req, res){
    var user = new User();
    var params = req.body
    if(req.user.rol != "admin") return res.send({ message: "Debes ser administrador para registrar un usuario" })

    if(params.nombre && params.password && params.email && params.apellido && params.carnetCui){
        user.nombre = params.nombre
        user.apellido = params.apellido
        user.identificador = params.carnetCui
        user.usuario = params.usuario
        user.email = params.email
        user.rol = params.rol;

        User.find({ $or: [
            {usuario: user.usuario},
            {email: user.email},
            {identificador: user.identificador}
        ]}).exec((err, users) => {
            if(err) return res.status(500).send({message}).send({message: 'Error en la peticion de usuarios'})
            if(users && users.length >= 1){
                return res.status(500).send({message: 'un usuario no puede tener el mismo usuario, email, carnet o CUI que uno anterior'})
            }else{
        
                bcrypt.hash(params.password, null, null, (err, hash) => {
                    user.password = hash;

                    user.save((err, usuarioGuardado) => {
                        if(err) return res.status(500).send({message: 'error al guardar el usuario'})
                        if(usuarioGuardado){
                            res.status(200).send({message: "Se ha creado el usuario con el identificador: " + usuarioGuardado.identificador})
                        }else{
                            res.status(404).send({message: 'no se ha podido registrar el usuario'})
                        }
                        
                    })
                })
            }
        })
    }else{
        res.status(200).send({
            message: 'Rellene todos los datos necesarios'
        })
    }
}

function crearUsuarioDefecto(req, res) {
    var user = new User();
    user.nombre = "admin"
    user.rol = "admin"
    user.email = "administracion@kinal.edu.gt"
    user.usuario = "admin"
    var password = "admin"


    User.countDocuments({nombre: 'admin', rol: 'admin'}, (err, usuarioDefault)=>{
     if(usuarioDefault == 0){
        bcrypt.hash(password, null, null, (err, hash) => {
                    user.password = hash;

                    user.save()
                    
                })
     }
    })
}


function login(req, res){
    var params = req.body
    var tipoUsuario;
    

    User.findOne({$or: [{usuario: params.usuarioEmail}, {email: params.usuarioEmail}]}, (err, usuario)=>{
        if(err) return res.status(500).send({ message: 'Error en la peticion' }) 
        if(!usuario) return res.status(404).send({ message: 'error al listar el usuario' })   
        if(usuario.rol == "estudiante" || usuario.rol == "catedratico"){
            tipoUsuario = 'Bienvenido '  + usuario.nombre
        }else{
            tipoUsuario = 'admin'
        }
    
    if(usuario){
        bcrypt.compare(params.password, usuario.password, (err, check)=>{
            if(check){
                if(params.gettoken){

                        return res.status(200).send({ token: jwt.createToken(usuario), tipoUsuario})
                }else{
                    usuario.password = undefined;
                    return res.status(200).send({ user: usuario })
                }

            }else{
                return res.status(404).send({ message: 'El usuario no se ha podido identificar' })
            }
        })
    }else{
        return res.status(404).send({ message: 'El usuario no se ha podido logear' })
    }
    })
}


function editarUsuario(req, res){
    var userId = req.params.id
    var params = req.body

    if(req.user.rol != "admin") return res.send({ message: "Debes ser administrador para editar" })
    //Borrar la propiedad de password y de rol
    delete params.rol
    delete params.carnetCui

    //if(req.user.rol != "ROLE_CLIENTE") return res.status(500).send({ message: "No puedes editar tu usuario de administrador" })

    User.findByIdAndUpdate(userId, params, {new: true}, (err, usuarioActualizado) =>{
        if(err) return res.status(500).send({ message: 'error en la peticion' })
        if(!usuarioActualizado) return res.status(404).send({ message: 'no se ha podido editar el usuario' })
        return res.status(200).send({ user: usuarioActualizado })
    })
}
//Para ver los usuarios se debe escoger una manera de ordenarlo, se deben colocar en el postman nombre, apellido y rol, cada uno se ordena 
//0 = descendente,  1 = ascendente, si no se escoge ninguno se ordena por nombre ascendente, no se pueden esocger mas de una manera de ordenarlo
function showUser(req, res) {
    
    var nombre  = req.body.nombre;
    var apellido = req.body.apellido;
    var rol = req.body.rol;

    if (req.user.rol != "admin") return res.send({ message: "No tienes permitido utilizar esta función" })

    
    //if(nombre != undefined) return res.send({ message: "indefinido" })
    //return res.send({ message: nombre + " " + apellido + " " + rol})
        if(nombre && apellido  || apellido && rol || nombre && apellido && rol || nombre && rol ){
            return res.status(500).send({message: 'escoga solo una manera'})
        }else if (nombre == 1) {
            User.find({}).sort({nombre: 1}).exec( (err, usuariosEncontrados)=>{
                  if(err) return res.status(500).send({ message: 'Error en la peticion de usuarios' })
                 if(!usuariosEncontrados) return res.status(404).send({ message: 'No se han podido listar los hote;es' })
                 return res.status(200).send({ usuarios: usuariosEncontrados })
             })
        }else if(nombre == 0){
            User.find({}).sort({nombre: -1}).exec( (err, usuariosEncontrados)=>{
                if(err) return res.status(500).send({ message: 'Error en la peticion de usuarios' })
                if(!usuariosEncontrados) return res.status(404).send({ message: 'No se han podido listar los hote;es' })
                return res.status(200).send({ usuarios: usuariosEncontrados })
            })
        }else if(apellido == 1){
            User.find({}).sort({apellido: 1}).exec( (err, usuariosEncontrados)=>{
                 if(err) return res.status(500).send({ message: 'Error en la peticion de usuarios' })
                 if(!usuariosEncontrados) return res.status(404).send({ message: 'No se han podido listar los hote;es' })
                 return res.status(200).send({ usuarios: usuariosEncontrados })
             })
        }else if(apellido == 0){
            User.find({}).sort({apellido: -1}).exec( (err, usuariosEncontrados)=>{
                if(err) return res.status(500).send({ message: 'Error en la peticion de usuarios' })
                if(!usuariosEncontrados) return res.status(404).send({ message: 'No se han podido listar los hote;es' })
                return res.status(200).send({ usuarios: usuariosEncontrados })
            })
        }else if(rol == 1){
            User.find({}).sort({rol: 1}).exec( (err, usuariosEncontrados)=>{
                if(err) return res.status(500).send({ message: 'Error en la peticion de usuarios' })
                if(!usuariosEncontrados) return res.status(404).send({ message: 'No se han podido listar los hote;es' })
                return res.status(200).send({ usuarios: usuariosEncontrados })
            })
        }else if(rol == 0){
            User.find({}).sort({rol: -1}).exec( (err, usuariosEncontrados)=>{
                if(err) return res.status(500).send({ message: 'Error en la peticion de usuarios' })
                if(!usuariosEncontrados) return res.status(404).send({ message: 'No se han podido listar los hote;es' })
                return res.status(200).send({ usuarios: usuariosEncontrados })
            })
        }else{
            User.find({}).sort({nombre: 1}).exec( (err, usuariosEncontrados)=>{
                if(err) return res.status(500).send({ message: 'Error en la peticion de usuarios' })
               if(!usuariosEncontrados) return res.status(404).send({ message: 'No se han podido listar los hote;es' })
               return res.status(200).send({ usuarios: usuariosEncontrados })
           })
        }
}

function editarClientes(req, res) {
    var usuarioId = req.params.id;
    var datos = req.body;
    var usuarioRol = req.user.rol;

    if(usuarioRol != "ROLE_ADMIN") return res.status(500).send({ message: 'No puedes editar otros usuarios' })

    User.findById(usuarioId, (err, usuarioEncontrado)=>{
        if(err) return res.status(500).send({ message: 'error en la petición de usuarios' })
        if(!usuarioEncontrado) return res.status(404).send({ message: 'error al listar los empleados' })
        if(usuarioEncontrado.rol == "ROLE_ADMIN") return res.send({ message: 'no puedes editar otros administradores' })
        User.findByIdAndUpdate(usuarioId, datos, {new: true},(err, usuarioActualizado)=>{
            return res.status(200).send({ usuarioActualizado })
        })
    })
    
}



/* function eliminarUsuario(req, res) {
    var userId = req.user.sub

    //if(req.user.rol != 'ROLE_CLIENTE') return res.status(500).send({ message: 'No puedes eliminar tu usuario :P' })

    User.findByIdAndDelete(userId, (err, usuarioActualizado) =>{
        if(err) return res.status(500).send({ message: 'error en la peticion' })
        if(!usuarioActualizado) return res.status(404).send({ message: 'no se ha podido eliminar el usuario' })
        return res.status(200).send({ message: 'usuario eliminado' })
    })
} */

function eliminarUsuario(req, res) {
    var userRol = req.user.rol      
    var userId = req.params.id

    if(userRol != 'admin') return res.send({ message: 'No tienes permiso de eliminar otros ususarios' })

    User.findById(userId, (err, usuarioEncontrado)=>{
        if(err) return res.status(500).send({ message: 'error en la petición de usuarios' })    
        if(!usuarioEncontrado) return res.status(404).send({ message: 'Error al listar los usuarios' })
        if(usuarioEncontrado.rol == 'ROLE_ADMIN') return res.send({ message: 'no puedes eliminar un administrador' })

        User.findByIdAndDelete(userId, (err, usuarioActualizado) =>{
            if(err) return res.status(500).send({ message: 'error en la peticion' })
            if(!usuarioActualizado) return res.status(404).send({ message: 'no se ha podido eliminar el usuario' })
            return res.status(200).send({ message: 'usuario eliminado' })
        })

    })
}


function agregarRevistaLibro(req, res){
    var tipo = req.body.tipo;

    if(req.user.rol != "admin") return res.send({ message: "No tienes los permisos necesarios" })
    //return res.send({ message: tipo })
    if(tipo == undefined || tipo < 0 || tipo > 1) return res.send({ message: "Debe indicar el tipo de bilbiografía (0 =libro, 1 = revista)" })

    if(tipo == 0){
        libroController.agregarLibro(req, res)
    }else if(tipo == 1){
        revistaController.agregarRevista(req, res)  
    }
}


module.exports={
    registrar,
    showUser,
    login,
    crearUsuarioDefecto,
    eliminarUsuario,
    editarUsuario,
    editarClientes,
    agregarRevistaLibro
}