'use strict'

var Libro = require('../models/libro')
//var Producto = require('../models/')
var User = require('../models/user');
const { param } = require('../routes/userRoutes');
//var Producto = require('../models/producto')

function agregarLibro(req, res) {
    var libro = new Libro();
    var params = req.body


    if(req.user.rol != "admin") return res.send({ message: 'No tienen permiso de crear categorias' })

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
                                res.status(404).send({message: 'no se ha guardar el libro'})
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

function crearCategoriaDefecto() {
    var categoria = new Categoria();
    categoria.nombreCategoria = "defaultCategory"
    categoria.descripcionCategoria = "categoria default para productos sin categoría"

    Categoria.countDocuments({nombreCategoria: 'defaultCategory', descripcionCategoria: 'categoria default para productos sin categoría'}, (err, categoriaDefault)=>{
     if(categoriaDefault == 0){
        categoria.save()
     }
    })
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

        if(req.user.rol != 'admin') return res.send({ message: 'No tienes permiso para eliminar la categoria' })
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

function listarCategorias(req, res) {

    Categoria.find({}, (err, categoriasEncontradas)=>{
        if(err) return res.status(500).send({ message: 'error en la petición de categorias' })
        if(!categoriasEncontradas) return res.status(404).send({ message: 'Error al listar las categorias' })
        return res.status(200).send({ categoriasEncontradas })
    })
}






module.exports={
    agregarLibro,
    editarLibro,
    eliminarLibro,
    listarCategorias
}