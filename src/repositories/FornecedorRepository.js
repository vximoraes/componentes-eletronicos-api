import FornecedorFilterBuilder from './filters/FornecedorFilterBuilder.js';
import FornecedorModel from '../models/Fornecedor.js';
import MovimentacaoModel from '../models/Movimentacao.js';
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';

class FornecedorRepository {
    constructor({
        fornecedorModel = FornecedorModel,
    } = {}) {
        this.model = fornecedorModel;
    };

    async criar(parsedData) {
        const fornecedor = new this.model(parsedData);
        return await fornecedor.save();
    };

    async listar(req) {
        const id = req.params.id || null;

        // Se um ID for fornecido, retorna o fornecedor enriquecido com estatísticas.
        if (id) {
            const data = await this.model.findOne({ _id: id, usuario: req.user_id });

            if (!data) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'Fornecedor',
                    details: [],
                    customMessage: messages.error.resourceNotFound('Fornecedor')
                });
            };

            const dataWithStats = {
                ...data.toObject()
            };

            return dataWithStats;
        };

        const { nome, contato, descricao, url, page = 1 } = req.query;
        const limite = Math.min(parseInt(req.query.limite, 10) || 10, 100);

        const filterBuilder = new FornecedorFilterBuilder()
            .comNome(nome || '')
            .comContato(contato || '')
            .comDescricao(descricao || '')
            .comUrl(url || '');

        if (typeof filterBuilder.build !== 'function') {
            throw new CustomError({
                statusCode: 500,
                errorType: 'internalServerError',
                field: 'Fornecedor',
                details: [],
                customMessage: messages.error.internalServerError('Fornecedor')
            });
        };

        const filtros = { ...filterBuilder.build(), usuario: req.user_id };

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limite, 10),
            sort: { nome: 1 }
        };

        const resultado = await this.model.paginate(filtros, options);

        // Enriquecer cada fornecedor com estatísticas utilizando o length dos arrays.
        resultado.docs = resultado.docs.map(doc => {
            const fornecedorObj = typeof doc.toObject === 'function' ? doc.toObject() : doc;

            return {
                ...fornecedorObj,
            };
        });

        return resultado;
    };

    async atualizar(id, parsedData, req) {
        const fornecedor = await this.model.findOneAndUpdate({ _id: id, usuario: req.user_id }, parsedData, { new: true }).lean();
        if (!fornecedor) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Fornecedor',
                details: [],
                customMessage: messages.error.resourceNotFound('Fornecedor')
            });
        };

        return fornecedor;
    };

    async deletar(id, req) {
        const existeMovimentacao = await MovimentacaoModel.exists({ fornecedor: id, usuario: req.user_id });
        if (existeMovimentacao) {
            throw new CustomError({
                statusCode: 400,
                errorType: 'resourceInUse',
                field: 'Fornecedor',
                details: [],
                customMessage: 'Não é possível deletar: fornecedor está vinculado a movimentações.'
            });
        };

        const fornecedor = await this.model.findOneAndDelete({ _id: id, usuario: req.user_id });
        return fornecedor;
    };

    // Métodos auxiliares.

    async buscarPorNome(nome, idIgnorado, req) {
        const filtro = { nome, usuario: req.user_id };

        if (idIgnorado) {
            filtro._id = { $ne: idIgnorado };
        };

        const documento = await this.model.findOne(filtro);

        return documento;
    };

    async buscarPorId(id, includeTokens = false, req) {
        let query = this.model.findOne({ _id: id, usuario: req.user_id });

        const fornecedor = await query;

        if (!fornecedor) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Fornecedor',
                details: [],
                customMessage: messages.error.resourceNotFound('Fornecedor')
            });
        };

        return fornecedor;
    };
};

export default FornecedorRepository;