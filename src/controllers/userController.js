'use strict'

//IMPORTS
var bcrypt = require('bcrypt-nodejs')
var User =  require('../models/user')
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

///////////////////////////////añadir al carrito y comprar////////////////////////////
/* 
function añadirCarrito(req, res) {
    var productoId = req.body.productoId
    var cantidad = req.body.cantidad
    
    if(req.user.rol != 'ROLE_CLIENTE') return res.send({ message: 'No puedes añadir productos a tu carrito' })
    Producto.findById(productoId, (err, productoEncontrado)=>{
        if(err) return res.status(500).send({ message: 'error en la petición de productos' })
        if(!productoEncontrado) return res.status(404).send({ message: 'error al listar los productos' })
        
        User.countDocuments({_id: req.user.sub, "carrito.codigoProducto": productoId}, (err, productoYaRegistrado)=>{
            if(err) return res.status(500).send({ message: 'error en la peticion de usuarios' })
           // if(!productoYaRegistrado) return res.status(404).send({ message: 'Error al contar los registros' })
            //return res.send({ productoYaRegistrado })
            if(productoYaRegistrado == 0){
                if(productoEncontrado.stock < cantidad) return res.send({ message: 'No hay unidades suficientes de este producto' })
                User.findByIdAndUpdate(req.user.sub, { $push: { carrito: { nombreProducto: productoEncontrado.nombreProducto, cantidad: cantidad, precio: productoEncontrado.precio, codigoProducto: productoEncontrado._id, total: productoEncontrado.precio * cantidad } } }, {new: true}, (err, carritoActualizado) =>{
                    if(err) return res.status(500).send({ message: 'Error en la peticion de usuario' })
                    if(!carritoActualizado) return res.status(404).send({ message: 'error al agregar el producto a la sucursal' })
                    return res.status(200).send({ carritoActualizado })
                })
            }else{
                User.findOne({_id: req.user.sub, "carrito.codigoProducto": productoId}, {"carrito.$.cantidad": 1, _id: 0}, (err, cantidadProductoEncontrado)=>{
                   //return res.send({ cantidadProductoEncontrado })
                    var cantidadTotal = cantidadProductoEncontrado.carrito[0].cantidad + Number(cantidad)
                    var precioAnterior =  cantidadProductoEncontrado.carrito[0].precio * cantidad
                   // console.log(cantidadTotal.carrito[0].cantidad);
                    
                    
                 // return res.send({cantidad:(cantidadTotal + Number(cantidad))})
                if(cantidadTotal > productoEncontrado.stock) return res.send({ message:'no hay suficient stock' })



                  User.updateOne({_id: req.user.sub, carrito: {$elemMatch: {codigoProducto: productoId}}}, {$inc:{"carrito.$.cantidad": cantidad ,"carrito.$.total": precioAnterior}}, (err, cantidadIncrementada)=>{
                    if(err) return res.status(500).send({ message: 'Error en la peticion de usuario' })
                    if(!cantidadIncrementada) return res.status(404).send({ message: 'error al actualizar el producto' })
                    User.findById(req.user.sub, (err, usuarioEncontrado)=>{
                        return res.status(200).send({ usuarioEncontrado })
                    })
                })
                })
                
            }
        })
    })
}

function comprar(req, res){
    var factura = new Factura();
    
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); 
    var yyyy = today.getFullYear();
    
        factura.empresa = "EASY BUY S.A"
        factura.fecha = mm + '/' + dd + '/' + yyyy
        var serie = 1
 
                    User.findById(req.user.sub, (err, usuarioEncontrado)=>{
                        if(err) return res.status(500).send({ message: 'Error en la petición de usuarios' })
                        if(!usuarioEncontrado) return res.status(404).send({ message: 'error al listar los usuarios' })
                        if(usuarioEncontrado.rol != 'ROLE_CLIENTE') return res.send({ message: 'NO puedes añadir una administrador a la factura' })
                        if(usuarioEncontrado.carrito.length == 0) return res.send({ message: 'No tienes productos en el carrito' })
                        Factura.countDocuments({}, (err, cantidadFacturas)=>{
                            serie = serie + cantidadFacturas
                        factura.NoSerie = serie
                        factura.user = usuarioEncontrado._id;
                        factura.save((err, facturaCreada) => {
                            if(err) return res.status(500).send({message: 'error al crear el empleado'})
                            if(!facturaCreada) return res.status(404).send({ message: 'no se ha podido crear la factura' })
                            //return res.send(facturaCreada)
                            agregarProductosFactura(facturaCreada, res);
                        })
                    })
                    })
                   
   
}

function agregarProductosFactura(datos, res) {
    User.findById(datos.user, (err, usuarioEncontrado)=>{
        if(err) return res.status(500).send({ message: 'error en la petición de usuarios' })
        if(!usuarioEncontrado) return res.status(404).send({ message: 'error al listar los usuarios' })

        for(let x=0; x<usuarioEncontrado.carrito.length; x++){
            var compras = usuarioEncontrado.carrito[x]
           var cantidadRestar = compras.cantidad 
           // return res.status(200).send({cantidad: cantidadRestar})
            Producto.updateOne({_id: compras.codigoProducto}, {$inc:{stock: -cantidadRestar}}).exec();
            Producto.updateOne({_id: compras.codigoProducto}, {$inc:{unidadesVendidas: cantidadRestar}}).exec();
            
                //if(productoEncontrado.stock < compras.cantidad) return res.send({ message: '' })
                Factura.findByIdAndUpdate(datos._id, {$push:{compra: compras}}, (err, facturaActualizada)=>{
                    if(err) return res.status(500).send({ message: 'error en la petición' })
                    if(!facturaActualizada) return res.status(404).send({ message: 'error al actualizar' })
                })
        }

        Factura.findById(datos._id, (err, facturaEncontrada)=>{
            eliminarCarrito(datos.user, res);
            return res.status(200).send({ factura: facturaEncontrada })
        })
    })
}

function eliminarCarrito(datosUsuario, res) {
    User.findByIdAndUpdate(datosUsuario, {carrito: []}).exec()
}


//////////////////////////////Busquedas de faturas y productos//////////////////////////////////


function facturasUsuario(req, res) {
    var userId = req.body.userId;

    if(req.user.rol != 'ROLE_ADMIN') return res.send({ message: 'No tienes permiso de ver las facturas de los usuarios' })

    Factura.find({user: userId}, (err, facturasEncontradas)=>{
        if(err) return res.status(500).send({ message: 'Error en la petición de facturas' })
        if(!facturasEncontradas) return res.status(404).send({ message: 'error al listar las facturas' })
        if(facturasEncontradas.length == 0) return res.send({ message: 'El cliente no tiene facturas' })

        return res.status(200).send({ facturas: facturasEncontradas })
    })

}

function  productoXFactura(req, res) {
    var serieFactura = req.body.NoSerie;

    if(req.user.rol != 'ROLE_ADMIN') return res.send({ message: 'No tienes permiso para realizar esta accion' })

    Factura.findOne({NoSerie: serieFactura }, {compra: 1, _id: 0}, (err, productosFactura)=>{
        if(err) return res.status(500).send({ message: 'error en la petición de facturas' })
        if(!productosFactura) return res.status(404).send({message: 'No se ha encontrado la factura'})
        return res.status(200).send({ productosFactura })
    })
}


function createPDF(req, res){
    var myDoc = new pdf; 
    var serie = req.body.serie;
    Factura.findOne({NoSerie: serie}, {"compra._id": 0, _id: 0}, (err, factura)=>{ 
        if(err) return res.status(500).send({message: 'Error en la peticion'})
        if(!factura){
            return res.status(404).send({message: 'La factura no existe'})
        }else{        
           // return res.send({ factura })
        myDoc.pipe(fs.createWriteStream('Facturas.pdf'));
        myDoc.font('Helvetica')
            .fontSize(16)
            .text("                                                                                   Serie: " + factura.NoSerie)
            .text("   ")
            .text("Fecha: " + factura.fecha)
            .text("Compras: ")
            .text("   ")
            
            for (let x = 0; x < factura.compra.length; x++) {
            myDoc
            .text("____________________________________________________")
                
            .text(factura.compra[x].nombreProducto + " ............... " + factura.compra[x].precio)
            .text("cantidad: " + factura.compra[x].cantidad +  "......... " + "Total de este producto: " + factura.compra[x].total)
            
            .text("____________________________________________________")
                
            }   
            myDoc
            .text("   ")
            .text("   ")
            .text("   ")
            .text("                             Empresa:" +  factura.empresa)

            .text("___________________________________________________")
            .text( " ")
            .text("        ..8888..     ..8888..")
            .text("    .8:::::::::::8. .8:::::::::::8.")
            .text("   .8:::::::::::::::8:::::::::::::::8.")
            .text("  .8:::::::::::::::::::::::::::::::::8.")
            .text("  8::::::  ::::' ':::' '::::  :  :::::8")
            .text("  8::::::  :::     '     :::  :  :::::8")
            .text("  8::::::  :::           :::  :  :::::8")
            .text("  '8:::::  ::::.       .::::  :  ::::8'")
            .text("   '8::::  ::::::.   .::::::  :  :::8'")
            .text("    '8:::  ::::::::.::::::::.   .::8'")
            .text("      '8:::::::::::::::::::::::::8'")
            .text("        '8:::::::::::::::::::::8'")
            .text("          '8:::::::::::::::::8'")
            .text("             '8:::::::::::8'")
            .text("                '8:::::8'")
            .text("                   '8'")


        myDoc.end();
        return res.status(200).send({factura})
    }
    })   
}
 */

module.exports={
    registrar,
    showUser,
    login,
    crearUsuarioDefecto,
    eliminarUsuario,
    editarUsuario,
    editarClientes
}