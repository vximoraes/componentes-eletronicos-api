import LocalizacaoFilterBuilder from './filters/LocalizacaoFilterBuilder.js';
import LocalizacaoModel from '../models/Localizacao.js';
import ComponenteModel from '../models/Componente.js';
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';

class LocalizacaoRepository {
    constructor({
        localizacaoModel = LocalizacaoModel,
    } = {}) {
        this.model = localizacaoModel;
    };

    async criar(parsedData) {
        const localizacao = new this.model(parsedData);
        return await localizacao.save();
    };

    async listar(req) {
        const id = req.params.id || null;

        // Se um ID for fornecido, retorna a localização enriquecida com estatísticas.
        if (id) {
            const data = await this.model.findOne({ _id: id, usuario: req.user_id });

            if (!data) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'Localizacao',
                    details: [],
                    customMessage: messages.error.resourceNotFound('Localizacao')
                });
            };

            const dataWithStats = {
                ...data.toObject()
            };

            return dataWithStats;
        };

        const { nome, page = 1 } = req.query;
        const limite = Math.min(parseInt(req.query.limite, 10) || 10, 100);

        const filterBuilder = new LocalizacaoFilterBuilder()
            .comNome(nome || '');

        if (typeof filterBuilder.build !== 'function') {
            throw new CustomError({
                statusCode: 500,
                errorType: 'internalServerError',
                field: 'Localizacao',
                details: [],
                customMessage: messages.error.internalServerError('Localizacao')
            });
        };

        const filtros = { ...filterBuilder.build(), usuario: req.user_id };

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limite, 10),
            sort: { nome: 1 }
        };

        const resultado = await this.model.paginate(filtros, options);

        // Enriquecer cada localização com estatísticas utilizando o length dos arrays.
        resultado.docs = resultado.docs.map(doc => {
            const localizacaoObj = typeof doc.toObject === 'function' ? doc.toObject() : doc;

            return {
                ...localizacaoObj,
            };
        });

        return resultado;
    };

    async atualizar(id, parsedData, req) {
        const localizacao = await this.model.findOneAndUpdate({ _id: id, usuario: req.user_id }, parsedData, { new: true }).lean();
        if (!localizacao) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Localizacao',
                details: [],
                customMessage: messages.error.resourceNotFound('Localizacao')
            });
        };

        return localizacao;
    };

    async deletar(id, req) {
        const existeComponente = await ComponenteModel.exists({ localizacao: id, usuario: req.user_id });
        if (existeComponente) {
            throw new CustomError({
                statusCode: 400,
                errorType: 'resourceInUse',
                field: 'Localizacao',
                details: [],
                customMessage: 'Não é possível deletar: localizacão está vinculada a componentes.'
            });
        };

        const localizacao = await this.model.findOneAndDelete({ _id: id, usuario: req.user_id });
        return localizacao;
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

        const localizacao = await query;

        if (!localizacao) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Localizacao',
                details: [],
                customMessage: messages.error.resourceNotFound('Localizacao')
            });
        };

        return localizacao;
    };
};

export default LocalizacaoRepository;