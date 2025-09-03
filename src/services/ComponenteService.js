import ComponenteRepository from '../repositories/ComponenteRepository.js';
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';
import LocalizacaoModel from '../models/Localizacao.js';
import CategoriaModel from '../models/Categoria.js';

class ComponenteService {
    constructor() {
        this.repository = new ComponenteRepository();
    };

    async criar(parsedData, req) {
        await this.validateNome(parsedData.nome, null, req.user_id);
        await this.validateLocalizacao(parsedData.localizacao, req.user_id);
        await this.validateCategoria(parsedData.categoria, req.user_id);

        parsedData.usuarioId = req.user_id;
        const data = await this.repository.criar(parsedData);

        return data;
    };

    async listar(req) {
        const data = await this.repository.listar(req);

        return data;
    };

    async atualizar(id, parsedData, req) {
        await this.ensureComponentExists(id, req.user_id);
        await this.validateNome(parsedData.nome, id, req.user_id);

        delete parsedData.quantidade;

        const data = await this.repository.atualizar(id, parsedData, req.user_id);

        return data;
    };

    async deletar(id, req) {
        await this.ensureComponentExists(id, req.user_id);

        const data = await this.repository.deletar(id, req.user_id);

        return data;
    };

    // Métodos auxiliares.

    async validateNome(nome, id = null, usuarioId) {
        const componenteExistente = await this.repository.buscarPorNome(nome, id, usuarioId);
        if (componenteExistente) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'nome',
                details: [{ path: 'nome', message: 'Nome já está em uso.' }],
                customMessage: 'Nome já está em uso.',
            });
        };
    };

    async ensureComponentExists(id, usuarioId) {
        const componenteExistente = await this.repository.buscarPorId(id, usuarioId);
        if (!componenteExistente) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Componente',
                details: [],
                customMessage: messages.error.resourceNotFound('Componente'),
            });
        };

        return componenteExistente;
    };

    async validateLocalizacao(localizacaoId, usuarioId) {
        const localizacao = await LocalizacaoModel.findOne({ _id: localizacaoId, usuarioId });
        if (!localizacao) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'localizacao',
                details: [{ path: 'localizacao', message: 'Localização não encontrada.' }],
                customMessage: 'Localização não encontrada.',
            });
        };
    };

    async validateCategoria(categoriaId, usuarioId) {
        const categoria = await CategoriaModel.findOne({ _id: categoriaId, usuarioId });
        if (!categoria) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'categoria',
                details: [{ path: 'categoria', message: 'Categoria não encontrada.' }],
                customMessage: 'Categoria não encontrada.',
            });
        };
    };
};

export default ComponenteService;