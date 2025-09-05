
import RotaRepository from "../repositories/RotaRepository.js";
import { CustomError, HttpStatusCodes, messages } from "../utils/helpers/index.js";

class RotaService {
    constructor(){
        this.repository = new RotaRepository()
    }

    async listar(req){
        console.log('Estou no listar em RotaService');
        const data = await this.repository.listar(req)
        console.log('Estou retornando os dados em RotaService')
        return data
    }

    async criar(req){
        console.log('Estou no criar em RotaService')
        const rota = await this.repository.buscarRotaPorNome(req.rota)
        console.log(rota)
        if(rota){
            throw new CustomError({
                statusCode: HttpStatusCodes.CONFLICT.code,
                errorTypes: "resourceConflict",
                field: "Rotas",
                details: [],
                customMessage: messages.error.resourceConflict("Rotas", "rotas duplicadas")
            })
        }
        const data = await this.repository.criar(req)
        return data
    }

    async atualizar(req, id) {
        console.log('Estou no atualizar em RotaService')
        const rota = await this.repository.buscarRotaPorNome(req.rota, id)
        if (rota) {
            throw new CustomError({
                statusCode: HttpStatusCodes.CONFLICT.code,
                errorTypes: "resourceConflict",
                field: "Rotas",
                details: [],
                customMessage: messages.error.resourceConflict("Rotas", "rotas duplicadas")
            })
        }
        const data = await this.repository.atualizar(req, id)

        return data
    }
}
export default RotaService