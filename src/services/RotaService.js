import RotaRepository from "../repositories/RotaRepository.js";
import { CustomError, messages } from "../utils/helpers/index.js";

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
}
export default RotaService