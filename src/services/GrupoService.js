import GrupoRepository from "../repositories/GrupoRepository.js";
import UsuarioRepository from "../repositories/UsuarioRepository.js";
import { CustomError, HttpStatusCodes, messages } from "../utils/helpers/index.js";

class GrupoService {
    constructor(){
        this.repository = new GrupoRepository();
        this.usuarioRepository = new UsuarioRepository();
    }

    async listar(req) {
        const data = await this.repository.listar(req)
        return data
    }

    async criar(parsedData){
        const grupo = await this.repository.buscarPorNome(parsedData.nome)
        if(grupo){
            throw new CustomError({
                statusCode: HttpStatusCodes.CONFLICT.code,
                errorType: "resourceConflict",
                field:"Grupos",
                details: [],
                customMessage: messages.error.resourceConflict("Grupos", "nome duplicado")
            })
        }
        const data = this.repository.criar(parsedData)
        return data
    }

    async atualizar(parsedData, id, user) {
        await this.repository.buscarPorId(id)
        const grupo = await this.repository.buscarPorNome(parsedData.nome, id)
        await this.verificarGrupo(user, id)
        if(grupo) {
            throw new CustomError({
                statusCode: HttpStatusCodes.CONFLICT.code,
                errorType: "resourceConflict",
                field: "Grupos",
                details: [],
                customMessage: messages.error.resourceConflict("Grupos", "nome duplicado")
            })
        }
        const usuario = await this.usuarioRepository.buscarPorId(user.id)
        const grupoUsuario = usuario.toObject()
        const data = await this.repository.atualizar(id, parsedData)
        return data
    }
    async deletar(id, user){

        await this.repository.buscarPorId(id)
        await this.verificarGrupo(user, id)
        const data = this.repository.deletar(id)
        return data
    }

    async verificarGrupo(user, id){
        const usuario = await this.usuarioRepository.buscarPorId(user.id)
        const grupoUsuario = usuario.toObject()
        for(const grupo of grupoUsuario.grupos){
            if(grupo._id.toString() === id){
                throw new CustomError({
                statusCode: HttpStatusCodes.FORBIDDEN.code,
                errorType: "Forbidden",
                field: "Grupos",
                details: [],
                customMessage: "Este grupo não pode ser alterado ou deletado." 
            })

            }
        }
    }
}

export default GrupoService