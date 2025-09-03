import CategoriaRepository from '../repositories/CategoriaRepository.js';
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';

class CategoriaService {
    constructor() {
        this.repository = new CategoriaRepository();
    };

    async criar(parsedData, req) {
        await this.validateNome(parsedData.nome, null, req.user_id);

        parsedData.usuarioId = req.user_id;
        const data = await this.repository.criar(parsedData);

        return data;
    };

    async listar(req) {
        const data = await this.repository.listar(req);

        return data;
    };

    async atualizar(id, parsedData, req) {
        await this.ensureCategoryExists(id, req.user_id);
        await this.validateNome(parsedData.nome, id, req.user_id);

        const data = await this.repository.atualizar(id, parsedData, req.user_id);

        return data;
    };

    async deletar(id, req) {
        await this.ensureCategoryExists(id, req.user_id);

        const data = await this.repository.deletar(id, req.user_id);

        return data;
    };

    // Métodos auxiliares.

    async validateNome(nome, id = null, usuarioId) {
        const categoriaExistente = await this.repository.buscarPorNome(nome, id, usuarioId);
        if (categoriaExistente) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'nome',
                details: [{ path: 'nome', message: 'Nome já está em uso.' }],
                customMessage: 'Nome já está em uso.',
            });
        };
    };

    async ensureCategoryExists(id, usuarioId) {
        const categoriaExistente = await this.repository.buscarPorId(id, usuarioId);
        if (!categoriaExistente) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Categoria',
                details: [],
                customMessage: messages.error.resourceNotFound('Categoria'),
            });
        };

        return categoriaExistente;
    };
};

export default CategoriaService;