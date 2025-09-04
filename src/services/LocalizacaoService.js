import LocalizacaoRepository from '../repositories/LocalizacaoRepository.js';
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';

class LocalizacaoService {
    constructor() {
        this.repository = new LocalizacaoRepository();
    };

    async criar(parsedData, req) {
        await this.validateNome(parsedData.nome, null, req);

        parsedData.usuario = req.user_id;
        const data = await this.repository.criar(parsedData);

        return data;
    };

    async listar(req) {
        const data = await this.repository.listar(req);

        return data;
    };

    async atualizar(id, parsedData, req) {
        await this.ensureLocationExists(id, req);
        await this.validateNome(parsedData.nome, id, req);

        const data = await this.repository.atualizar(id, parsedData, req);

        return data;
    };

    async deletar(id, req) {
        await this.ensureLocationExists(id, req);

        const data = await this.repository.deletar(id, req);

        return data;
    };

    // Métodos auxiliares.

    async validateNome(nome, id = null, req) {
        const localizacaoExistente = await this.repository.buscarPorNome(nome, id, req);
        if (localizacaoExistente) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'nome',
                details: [{ path: 'nome', message: 'Nome já está em uso.' }],
                customMessage: 'Nome já está em uso.',
            });
        };
    };

    async ensureLocationExists(id, req) {
        const localizacaoExistente = await this.repository.buscarPorId(id, false, req);
        if (!localizacaoExistente) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Localizacao',
                details: [],
                customMessage: messages.error.resourceNotFound('Localizacao'),
            });
        };

        return localizacaoExistente;
    };
};

export default LocalizacaoService;