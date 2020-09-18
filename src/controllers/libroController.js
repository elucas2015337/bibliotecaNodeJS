'use strict'

var Libro = require('../models/libro')
var User = require('../models/user')
var Busqueda = require('../models/buscados')
const { param } = require('../routes/userRoutes')
const libro = require('../models/libro')


function agregarLibro(req, res) {
    var libro = new Libro();
    var params = req.body


    if(req.user.rol != "admin") return res.send({ message: 'No tienen permiso de agregar libros' })

        if(params.titulo){
           
            libro.autor = params.autor,
            libro.titulo = params.titulo,
            libro.edicion = params.edicion,
            libro.palabrasClave = params.palabrasClave,
            libro.descripcion = params.descripcion,
            libro.temas = params.temas,
            libro.copias = params.copias,
            libro.disponibles = params.disponibles

            //return res.send({ message: libro.descripcion })
    
            Libro.find({ $or: [
                {titulo: params.titulo}
            ]}).exec((err, libros) => {
                if(err) return res.status(500).send({message}).send({message: 'Error en la peticion de libros'})
                if(libros && libros.length >= 1){
                    return res.status(500).send({message: 'Este libro ya esta registrado'})
                }else{
                        
                        libro.save((err, libroGuardado) => {
                       /*  {console.log(err)
                        return err  } */
                            if(err) return res.status(500).send({message: 'error al guardar el libro'})
                            if(libroGuardado){
                                res.status(200).send({libro: libroGuardado})
                            }else{
                                res.status(404).send({message: 'no se ha podido guardar el libro'})
                            }
                            
                        })
                    
                }
            })
        }else{
            res.status(200).send({
                message: 'Indique al menos el titulo del libro'
            })
        }
    
    
}


function editarLibro(req, res) {
    var datos = req.body;
    
    var libroID = req.params.id;

    if(req.user.rol != 'admin') return res.send({ message: 'no tienes permiso de editar libros' })

        Libro.findById(libroID, (err, libroEncontrado)=>{
            if(err) return res.status(500).send({ message: 'error en la peticion de libros' })
            if(!libroEncontrado) return res.status(404).send({ message: 'error al listar los libros' })
            Libro.findByIdAndUpdate(libroEncontrado._id, datos, {new: true}, (err, libroActualizado)=>{
                if(err) return res.status(500).send({ message: 'error al actualizar el libro' })
                return res.status(200).send({ libroActualizado })
            })
        })
   
}

function eliminarLibro(req, res) {
    var libroID = req.params.id;

        if(req.user.rol != 'admin') return res.send({ message: 'No tienes permiso para eliminar los libros' })
        Libro.findById(libroID, (err, libroEncontrado)=>{
            if(err) return res.status(500).send({ message: 'error en la peticion de libros' })
            if(!libroEncontrado) return res.status(404).send({ message: 'Error al listar los libros' })
            Libro.findByIdAndDelete(libroEncontrado._id, (err, libroEliminado)=>{
                if(err) return res.status(500).send({ message: 'error al eliminar el libro' })
                if(!libroEliminado) return res.status(404).send({ message: 'No se ha podido eliminar el libro' })
                return res.send({ message: "Libro eliminado" })
                
            })
        })
    
}

/* function listarCategorias(req, res) {

    Categoria.find({}, (err, categoriasEncontradas)=>{
        if(err) return res.status(500).send({ message: 'error en la petición de categorias' })
        if(!categoriasEncontradas) return res.status(404).send({ message: 'Error al listar las categorias' })
        return res.status(200).send({ categoriasEncontradas })
    })
} */

//

function buscarlibro(req, res) {
    var params = req.body;
    var parametro = params.parametro;
    
    if (parametro == null) {

        Libro.find({}, (err, todosLibros) =>{
                if(err) return res.status(500).send({ message: 'error en la peticion' })
                return res.status(200).send({libros: todosLibros })
            })

    }else{
        Libro.find({$or:
                [{titulo: {$regex: parametro, $options: "i"}},
                 {autor: {$regex: parametro, $options: "i"}},
                {palabrasClave:{$regex: parametro, $options: "i"}},
                {descripcion:{$regex: parametro, $options: "i"}},
                {temas:{$regex: parametro, $options: "i"}}
                ]}, (err, librosEncontrados)=>{
                if(err) return res.status(500).send({ message: 'error en la peticion de libros' })
                if(!librosEncontrados) return res.status(404).send({ message: 'no se han podido listar los libros' })
                    Libro.findById(parametro, (err, librosID)=>{
                        
                        if(librosID) return res.status(200).send({ Libros: librosID })
                        return res.status(200).send({libros: librosEncontrados})
                    })
        
            })
            guardarBusqueda(req, res);
        
    }
}

//recopilación de palabras mas usadas para las busquedas

function guardarBusqueda(req, res){
    var busqueda = new Busqueda();
    var params = req.body

    busqueda.parametro = params.parametro,
    busqueda.numeroBusquedas = 1,
    busqueda.tipo = "libro"

    Busqueda.findOne({parametro: params.parametro, tipo: "libro"}, (err, busquedaEncontrada)=>{
        if(err) return res.status(500).send({ message: "error en la petición de busquedas" })
        if(busquedaEncontrada){
            Busqueda.updateOne({_id: busquedaEncontrada._id}, {$inc:{numeroBusquedas: 1}}).exec();
        }else if(!busquedaEncontrada){
            busqueda.save();
        }
    })
}

function mostrarLibros(req, res) {
    
    var id  = req.body.id;
    var copias = req.body.copias;
    var disponibles = req.body.disponibles;

    if (req.user.rol != "admin") return res.send({ message: "No tienes permitido utilizar esta función" })

    
    //if(id != undefined) return res.send({ message: "indefinido" })
    //return res.send({ message: id + " " + copias + " " + disponibles})
        if(id && copias  || copias && disponibles || id && copias && disponibles || id && disponibles ){
            return res.status(500).send({message: 'escoga solo una manera'})
        }else if (id == 1) {
            Libro.find({}).sort({id: 1}).exec( (err, librosEncontrados)=>{
                  if(err) return res.status(500).send({ message: 'Error en la peticion de libros' })
                 if(!librosEncontrados) return res.status(404).send({ message: 'No se han podido listar los libros' })
                 return res.status(200).send({ libros: librosEncontrados })
             })
        }else if(id == 0){
            Libro.find({}).sort({id: -1}).exec( (err, librosEncontrados)=>{
                if(err) return res.status(500).send({ message: 'Error en la peticion de libros' })
                if(!librosEncontrados) return res.status(404).send({ message: 'No se han podido listar los libros' })
                return res.status(200).send({ libros: librosEncontrados })
            })
        }else if(copias == 1){
            Libro.find({}).sort({copias: 1}).exec( (err, librosEncontrados)=>{
                 if(err) return res.status(500).send({ message: 'Error en la peticion de libros' })
                 if(!librosEncontrados) return res.status(404).send({ message: 'No se han podido listar los libros' })
                 return res.status(200).send({ libros: librosEncontrados })
             })
        }else if(copias == 0){
            Libro.find({}).sort({copias: -1}).exec( (err, librosEncontrados)=>{
                if(err) return res.status(500).send({ message: 'Error en la peticion de libros' })
                if(!librosEncontrados) return res.status(404).send({ message: 'No se han podido listar los libros' })
                return res.status(200).send({ libros: librosEncontrados })
            })
        }else if(disponibles == 1){
            Libro.find({}).sort({disponibles: 1}).exec( (err, librosEncontrados)=>{
                if(err) return res.status(500).send({ message: 'Error en la peticion de libros' })
                if(!librosEncontrados) return res.status(404).send({ message: 'No se han podido listar los libros' })
                return res.status(200).send({ libros: librosEncontrados })
            })
        }else if(disponibles == 0){
            Libro.find({}).sort({disponibles: -1}).exec( (err, librosEncontrados)=>{
                if(err) return res.status(500).send({ message: 'Error en la peticion de libros' })
                if(!librosEncontrados) return res.status(404).send({ message: 'No se han podido listar los libros' })
                return res.status(200).send({ libros: librosEncontrados })
            })
        }else{
            Libro.find({}).sort({id: 1}).exec( (err, librosEncontrados)=>{
                if(err) return res.status(500).send({ message: 'Error en la peticion de libros' })
               if(!librosEncontrados) return res.status(404).send({ message: 'No se han podido listar los libros' })
               return res.status(200).send({ libros: librosEncontrados })
           })
        }
}

function prestarLibro(req, res) {
    var libroId = req.body.libroId
    var tipoBibliografia = "libro"

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); 
    var yyyy = today.getFullYear();

    var fecha = mm + '/' + dd + '/' + yyyy
    
    if(req.user.rol == 'admin') return res.send({ message: 'Este usuario no tiene permitido prestar libros' })
    Libro.findById(libroId, (err, libroEncontrado)=>{
        if(err) return res.status(500).send({ message: 'error en la petición de libros' })
        if(!libroEncontrado) return res.status(404).send({ message: 'error al listar los libros' })
        
        User.countDocuments({_id: req.user.sub, "prestamos.codigoBibliografia": libroId}, (err, libroYaRegistrado)=>{
            if(err) return res.status(500).send({ message: 'error en la peticion de usuarios' })
            User.findById(req.user.sub, (err, usuarioEncontrado)=>{
                if(usuarioEncontrado.prestamos.length >= 10) return res.send({ message: "no puedes prestar mas libros" })
            
            if(libroYaRegistrado == 0){
                if(libroEncontrado.disponibles == 0) return res.send({ message: 'No hay unidades de este libro' })
                User.findByIdAndUpdate(req.user.sub, { $push: { prestamos: { titulo: libroEncontrado.titulo, autor: libroEncontrado.autor, fechaPrestamo: fecha, codigoBibliografia: libroEncontrado._id, tipo: tipoBibliografia } } }, {new: true}, (err, prestamoActualizado) =>{
                    if(err) return res.status(500).send({ message: 'Error en la peticion de usuario' })
                    if(!prestamoActualizado) return res.status(404).send({ message: 'error al agregar el libro al prestamo' })
                    Libro.updateOne({_id: libroId}, {$inc:{prestados: 1, disponibles: -1}}).exec();
                    return res.status(200).send({ message: "has prestado: " + libroEncontrado.titulo +" de " + libroEncontrado.autor })
                })
            }else{
                return res.send({ message: "No puede prestar el mismo libro" })
                
            }

        })
        })
    })
}

function devolverLibro(req, res){
    var libroId = req.body.libroId

    if(libroId){
        Libro.findById(libroId, (err, libroEncontrado)=>{
            if(err) return res.status(500).send({ message: "Error en la peticion de libros" })
            if(!libroEncontrado) return res.status(404).send({ message: "No se ha encontrado el libro" })
            User.countDocuments({_id: req.user.sub, "prestamos.codigoBibliografia": libroId}, (err, libroDevolver)=>{
                if(libroDevolver > 0){
                    Libro.updateOne({_id: libroId}, {$inc:{disponibles: 1}}).exec();
                    User.updateOne({_id: req.user.sub, prestamos:{$elemMatch: {codigoBibliografia: libroId}}}, {$pull:{prestamos:{codigoBibliografia: libroId}}}, (err, libroBorrado)=>{
                        return res.status(200).send({ message: "Has devuelto " + libroEncontrado.titulo + " de " + libroEncontrado.autor })
                    })

                }else{
                    return res.send({ message: "No puedes devolver un libro que aún no has prestado" })
                }
            })
        })
    }else{
        return res.send({ message: 'ingrese el Id del libro a devolver'})
    }
}


module.exports={
    agregarLibro,
    editarLibro,
    eliminarLibro,
    mostrarLibros,
    buscarlibro,
    prestarLibro,
    devolverLibro
}