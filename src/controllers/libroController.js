'use strict'

var Libro = require('../models/libro')
//var Producto = require('../models/')
//var Libro = require('../models/user');
const { param } = require('../routes/userRoutes');
//var Producto = require('../models/producto')

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
                    Libro.findById(parametro, (err, empleadosID)=>{
                        
                        if(empleadosID) return res.status(200).send({ empleado: empleadosID })
                        return res.status(200).send({empleados: librosEncontrados})
                    })
        
            })
        
    }
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
                 if(!librosEncontrados) return res.status(404).send({ message: 'No se han podido listar los hote;es' })
                 return res.status(200).send({ libros: librosEncontrados })
             })
        }else if(id == 0){
            Libro.find({}).sort({id: -1}).exec( (err, librosEncontrados)=>{
                if(err) return res.status(500).send({ message: 'Error en la peticion de libros' })
                if(!librosEncontrados) return res.status(404).send({ message: 'No se han podido listar los hote;es' })
                return res.status(200).send({ libros: librosEncontrados })
            })
        }else if(copias == 1){
            Libro.find({}).sort({copias: 1}).exec( (err, librosEncontrados)=>{
                 if(err) return res.status(500).send({ message: 'Error en la peticion de libros' })
                 if(!librosEncontrados) return res.status(404).send({ message: 'No se han podido listar los hote;es' })
                 return res.status(200).send({ libros: librosEncontrados })
             })
        }else if(copias == 0){
            Libro.find({}).sort({copias: -1}).exec( (err, librosEncontrados)=>{
                if(err) return res.status(500).send({ message: 'Error en la peticion de libros' })
                if(!librosEncontrados) return res.status(404).send({ message: 'No se han podido listar los hote;es' })
                return res.status(200).send({ libros: librosEncontrados })
            })
        }else if(disponibles == 1){
            Libro.find({}).sort({disponibles: 1}).exec( (err, librosEncontrados)=>{
                if(err) return res.status(500).send({ message: 'Error en la peticion de libros' })
                if(!librosEncontrados) return res.status(404).send({ message: 'No se han podido listar los hote;es' })
                return res.status(200).send({ libros: librosEncontrados })
            })
        }else if(disponibles == 0){
            Libro.find({}).sort({disponibles: -1}).exec( (err, librosEncontrados)=>{
                if(err) return res.status(500).send({ message: 'Error en la peticion de libros' })
                if(!librosEncontrados) return res.status(404).send({ message: 'No se han podido listar los hote;es' })
                return res.status(200).send({ libros: librosEncontrados })
            })
        }else{
            Libro.find({}).sort({id: 1}).exec( (err, librosEncontrados)=>{
                if(err) return res.status(500).send({ message: 'Error en la peticion de libros' })
               if(!librosEncontrados) return res.status(404).send({ message: 'No se han podido listar los hote;es' })
               return res.status(200).send({ libros: librosEncontrados })
           })
        }
}





module.exports={
    agregarLibro,
    editarLibro,
    eliminarLibro,
    mostrarLibros,
    buscarlibro
}