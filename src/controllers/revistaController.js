'use strict'

var Revista = require('../models/revista')
//var Producto = require('../models/')
var User = require('../models/user');
const { param } = require('../routes/userRoutes');
//var Producto = require('../models/producto')

function agregarRevista(req, res) {
    var revista = new Revista();
    var params = req.body


    if(req.user.rol != "admin") return res.send({ message: 'No tienen permiso de agregar revistas' })

        if(params.titulo){
           
            revista.autor = params.autor,
            revista.titulo = params.titulo,
            revista.edicion = params.edicion,
            revista.palabrasClave = params.palabrasClave,
            revista.descripcion = params.descripcion,
            revista.temas = params.temas,
            revista.copias = params.copias,
            revista.disponibles = params.disponibles
            revista.edicion = params.edicion
            revista.frecuencia = params.frecuencia
            revista.ejemplares = params.ejemplares

            //return res.send({ message: revista.descripcion })
    
            Revista.find({ $or: [
                {titulo: params.titulo}
            ]}).exec((err, libros) => {
                if(err) return res.status(500).send({message}).send({message: 'Error en la peticion de revistas'})
                if(libros && libros.length >= 1){
                    return res.status(500).send({message: 'Esta revista ya esta registrado'})
                }else{
                        
                        revista.save((err, revistaGuardada) => {
                       /*  {console.log(err)
                        return err  } */
                            if(err) return res.status(500).send({message: 'error al guardar la revista'})
                            if(revistaGuardada){
                                res.status(200).send({revista: revistaGuardada})
                            }else{
                                res.status(404).send({message: 'no se ha podido guardar la revista'})
                            }
                            
                        })
                    
                }
            })
        }else{
            res.status(200).send({
                message: 'Indique al menos el titulo de la revista'
            })
        }
    
    
}


function editarRevista(req, res) {
    var datos = req.body;
    
    var revistaID = req.params.id;

    if(req.user.rol != 'admin') return res.send({ message: 'no tienes permiso de editar revistas' })

        Revista.findById(revistaID, (err, revistaEncontrada)=>{
            if(err) return res.status(500).send({ message: 'error en la peticion de revistas' })
            if(!revistaEncontrada) return res.status(404).send({ message: 'error al listar las revistas' })
            Revista.findByIdAndUpdate(revistaEncontrada._id, datos, {new: true}, (err, revistaActualizada)=>{
                if(err) return res.status(500).send({ message: 'error al actualizar la revista' })
                return res.status(200).send({ revistaActualizada })
            })
        })
   
}

function eliminarRevista(req, res) {
    var revistaID = req.params.id;

        if(req.user.rol != 'admin') return res.send({ message: 'No tienes permiso para eliminar los libros' })
        Revista.findById(revistaID, (err, revistaEncontrada)=>{
            if(err) return res.status(500).send({ message: 'error en la peticion de revistas' })
            if(!revistaEncontrada) return res.status(404).send({ message: 'Error al listar las revistas' })
            Revista.findByIdAndDelete(revistaEncontrada._id, (err, revistaEliminada)=>{
                if(err) return res.status(500).send({ message: 'error al eliminar la revista' })
                if(!revistaEliminada) return res.status(404).send({ message: 'No se ha podido eliminar la revista' })
                return res.send({ message: "Revista eliminada" })
                
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
    agregarRevista,
    editarRevista,
    eliminarRevista,
    listarCategorias
}