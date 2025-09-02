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
    }
}

export default GrupoService