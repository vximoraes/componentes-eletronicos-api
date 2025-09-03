import FornecedorRepository from '../repositories/FornecedorRepository.js';
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';

class FornecedorService {
    constructor() {
        this.repository = new FornecedorRepository();
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
        await this.ensureSupplierExists(id, req.user_id);
        await this.validateNome(parsedData.nome, id, req.user_id);

        const data = await this.repository.atualizar(id, parsedData, req.user_id);

        return data;
    };

    async deletar(id, req) {
        await this.ensureSupplierExists(id, req.user_id);

        const data = await this.repository.deletar(id, req.user_id);

        return data;
    };

    // Métodos auxiliares.

    async validateNome(nome, id = null, usuarioId) {
        const fornecedorExistente = await this.repository.buscarPorNome(nome, id, usuarioId);
        if (fornecedorExistente) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'nome',
                details: [{ path: 'nome', message: 'Nome já está em uso.' }],
                customMessage: 'Nome já está em uso.',
            });
        };
    };

    async ensureSupplierExists(id, usuarioId) {
        const fornecedorExistente = await this.repository.buscarPorId(id, usuarioId);
        if (!fornecedorExistente) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Fornecedor',
                details: [],
                customMessage: messages.error.resourceNotFound('Fornecedor'),
            });
        };

        return fornecedorExistente;
    };
};

export default FornecedorService;