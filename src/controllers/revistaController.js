'use strict'

var Revista = require('../models/revista')
var User = require('../models/user')
//var Producto = require('../models/')

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

function buscarRevista(req, res) {
    var params = req.body;
    var parametro = params.parametro;
    
    if (parametro == null) {

        Revista.find({}, (err, todasRevistas) =>{
                if(err) return res.status(500).send({ message: 'error en la peticion' })
                return res.status(200).send({libros: todasRevistas })
            })

    }else{
        Revista.find({$or:
                [{titulo: {$regex: parametro, $options: "i"}},
                 {autor: {$regex: parametro, $options: "i"}},
                {palabrasClave:{$regex: parametro, $options: "i"}},
                {descripcion:{$regex: parametro, $options: "i"}},
                {temas:{$regex: parametro, $options: "i"}}
                ]}, (err, revistasEncontradas)=>{
                if(err) return res.status(500).send({ message: 'error en la peticion de revistas' })
                if(!revistasEncontradas) return res.status(404).send({ message: 'no se han podido listar las Revistas' })
                    Revista.findById(parametro, (err, empleadosID)=>{
                        
                        if(empleadosID) return res.status(200).send({ empleado: empleadosID })
                        return res.status(200).send({empleados: revistasEncontradas})
                    })
        
            })
        
    }
}


function mostrarRevistas(req, res) {
    
    var id  = req.body.id;
    var copias = req.body.copias;
    var disponibles = req.body.disponibles;

    if (req.user.rol != "admin") return res.send({ message: "No tienes permitido utilizar esta función" })

    
    //if(id != undefined) return res.send({ message: "indefinido" })
    //return res.send({ message: id + " " + copias + " " + disponibles})
        if(id && copias  || copias && disponibles || id && copias && disponibles || id && disponibles ){
            return res.status(500).send({message: 'escoga solo una manera'})
        }else if (id == 1) {
            Revista.find({}).sort({id: 1}).exec( (err, revistasEncontradas)=>{
                  if(err) return res.status(500).send({ message: 'Error en la peticion de libros' })
                 if(!revistasEncontradas) return res.status(404).send({ message: 'No se han podido listar los hote;es' })
                 return res.status(200).send({ libros: revistasEncontradas })
             })
        }else if(id == 0){
            Revista.find({}).sort({id: -1}).exec( (err, revistasEncontradas)=>{
                if(err) return res.status(500).send({ message: 'Error en la peticion de libros' })
                if(!revistasEncontradas) return res.status(404).send({ message: 'No se han podido listar los hote;es' })
                return res.status(200).send({ libros: revistasEncontradas })
            })
        }else if(copias == 1){
            Revista.find({}).sort({copias: 1}).exec( (err, revistasEncontradas)=>{
                 if(err) return res.status(500).send({ message: 'Error en la peticion de libros' })
                 if(!revistasEncontradas) return res.status(404).send({ message: 'No se han podido listar los hote;es' })
                 return res.status(200).send({ libros: revistasEncontradas })
             })
        }else if(copias == 0){
            Revista.find({}).sort({copias: -1}).exec( (err, revistasEncontradas)=>{
                if(err) return res.status(500).send({ message: 'Error en la peticion de libros' })
                if(!revistasEncontradas) return res.status(404).send({ message: 'No se han podido listar los hote;es' })
                return res.status(200).send({ libros: revistasEncontradas })
            })
        }else if(disponibles == 1){
            Revista.find({}).sort({disponibles: 1}).exec( (err, revistasEncontradas)=>{
                if(err) return res.status(500).send({ message: 'Error en la peticion de libros' })
                if(!revistasEncontradas) return res.status(404).send({ message: 'No se han podido listar los hote;es' })
                return res.status(200).send({ libros: revistasEncontradas })
            })
        }else if(disponibles == 0){
            Revista.find({}).sort({disponibles: -1}).exec( (err, revistasEncontradas)=>{
                if(err) return res.status(500).send({ message: 'Error en la peticion de libros' })
                if(!revistasEncontradas) return res.status(404).send({ message: 'No se han podido listar los hote;es' })
                return res.status(200).send({ libros: revistasEncontradas })
            })
        }else{
            Revista.find({}).sort({id: 1}).exec( (err, revistasEncontradas)=>{
                if(err) return res.status(500).send({ message: 'Error en la peticion de libros' })
               if(!revistasEncontradas) return res.status(404).send({ message: 'No se han podido listar los hote;es' })
               return res.status(200).send({ libros: revistasEncontradas })
           })
        }
}

function prestarRevista(req, res) {
    var revistaId = req.body.revistaId
    var tipoBibliografia = "revista"

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); 
    var yyyy = today.getFullYear();

    var fecha = mm + '/' + dd + '/' + yyyy
    
    if(req.user.rol == 'admin') return res.send({ message: 'Este usuario no tiene permitido prestar revistas' })
    Revista.findById(revistaId, (err, revistaEncontrada)=>{
        if(err) return res.status(500).send({ message: 'error en la petición de revistas' })
        if(!revistaEncontrada) return res.status(404).send({ message: 'error al listar las revistas' })
        
        User.countDocuments({_id: req.user.sub, "prestamos.codigoBibliografia": revistaId}, (err, libroYaRegistrado)=>{
            if(err) return res.status(500).send({ message: 'error en la peticion de usuarios' })
            User.findById(req.user.sub, (err, usuarioEncontrado)=>{
                if(usuarioEncontrado.prestamos.length >= 10) return res.send({ message: "no puedes prestar mas revistas" })
            
            if(libroYaRegistrado == 0){
                if(revistaEncontrada.disponibles == 0) return res.send({ message: 'No hay unidades de esta revista' })
                User.findByIdAndUpdate(req.user.sub, { $push: { prestamos: { titulo: revistaEncontrada.titulo, autor: revistaEncontrada.autor, fechaPrestamo: fecha, codigoBibliografia: revistaEncontrada._id, tipo: tipoBibliografia } } }, {new: true}, (err, prestamoActualizado) =>{
                    if(err) return res.status(500).send({ message: 'Error en la peticion de usuario' })
                    if(!prestamoActualizado) return res.status(404).send({ message: 'error al agregar la revista al prestamo' })
                    Revista.updateOne({_id: revistaId}, {$inc:{prestados: 1, disponibles: -1}}).exec();
                    return res.status(200).send({ prestamoActualizado })
                })
            }else{
                return res.send({ message: "No puede prestar la misma revista" })
                
            }

        })
        })
    })
}

module.exports={
    agregarRevista,
    editarRevista,
    eliminarRevista,
    listarCategorias,
    mostrarRevistas,
    buscarRevista,
    prestarRevista
}