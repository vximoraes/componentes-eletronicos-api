import OrcamentoFilterBuilder from './filters/OrcamentoFilterBuilder.js';
import OrcamentoModel from '../models/Orcamento.js';
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';

class OrcamentoRepository {
    constructor({
        orcamentoModel = OrcamentoModel,
    } = {}) {
        this.model = orcamentoModel;
    };

    async criar(parsedData) {
        const orcamento = new this.model(parsedData);
        const orcamentoSalvo = await orcamento.save();
        return await this.model.findById(orcamentoSalvo._id)
    };

    async listar(req) {
        const id = req.params.id || null;

        // Se um ID for fornecido, retorna o orçamento enriquecido com estatísticas.
        if (id) {
            const data = await this.model.findOne({ _id: id, usuario: req.user_id })

            if (!data) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'Orçamento',
                    details: [],
                    customMessage: messages.error.resourceNotFound('Orçamento')
                });
            };

            const dataWithStats = {
                ...data.toObject()
            };

            return dataWithStats;
        };

        const { nome, protocolo, page = 1 } = req.query;
        const limite = Math.min(parseInt(req.query.limite, 10) || 10, 100);

        const filterBuilder = new OrcamentoFilterBuilder()
            .comNome(nome || '')
            .comProtocolo(protocolo || '')

        if (typeof filterBuilder.build !== 'function') {
            throw new CustomError({
                statusCode: 500,
                errorType: 'internalServerError',
                field: 'Orçamento',
                details: [],
                customMessage: messages.error.internalServerError('Orçamento')
            });
        };

        const filtros = { ...filterBuilder.build(), usuario: req.user_id };

        const options = {
            page: parseInt(page),
            limit: parseInt(limite),
            sort: { nome: 1 },
        };

        const resultado = await this.model.paginate(filtros, options);

        // Enriquecer cada orçamento com estatísticas utilizando o length dos arrays.
        resultado.docs = resultado.docs.map(doc => {
            const orcamentoObj = typeof doc.toObject === 'function' ? doc.toObject() : doc;

            return {
                ...orcamentoObj
            };
        });

        return resultado;
    };

    async atualizar(id, parsedData, req) {
        const orcamento = await this.model.findOneAndUpdate({ _id: id, usuario: req.user_id }, parsedData, { new: true }).lean();
        if (!orcamento) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Orçamento',
                details: [],
                customMessage: messages.error.resourceNotFound('Orçamento')
            });
        };

        return orcamento;
    };

    async deletar(id, req) {
        const orcamento = await this.model.findOne({ _id: id, usuario: req.user_id })
        if (!orcamento) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Orçamento',
                details: [],
                customMessage: messages.error.resourceNotFound('Orçamento')
            });
        }

        await this.model.findOneAndDelete({ _id: id, usuario: req.user_id });
        return orcamento;
    };

    // Manipular componentes.

<<<<<<< HEAD
       async adicionarComponente(orcamentoId, novoComponente) {
        const orcamento = await this.model.findById(orcamentoId);
=======
    async adicionarComponente(orcamentoId, novoComponente, req) {
        const orcamento = await this.model.findOne({ _id: orcamentoId, usuario: req.user_id });
>>>>>>> b4d02c85d2f618e669503a6507114fa9946ed682
        if (!orcamento) throw new CustomError({
            statusCode: 404,
            errorType: 'resourceNotFound',
            field: 'Orçamento',
            details: [],
            customMessage: messages.error.resourceNotFound('Orçamento')
        });

        // Normalize numeric fields and ensure subtotal is correct.
        novoComponente.valor_unitario = Number(novoComponente.valor_unitario || 0);
        novoComponente.quantidade = Number(novoComponente.quantidade || 0);
        // If subtotal wasn't provided, compute it from quantidade * valor_unitario
        novoComponente.subtotal = Number(novoComponente.subtotal ?? (novoComponente.quantidade * novoComponente.valor_unitario));

        orcamento.componentes.push(novoComponente);
        orcamento.valor = orcamento.componentes.reduce((acc, comp) => acc + Number(comp.subtotal || 0), 0);
        await orcamento.save();

        return orcamento;
    };

    async atualizarComponente(orcamentoId, componenteId, componenteAtualizado, req) {
        const orcamento = await this.model.findOne({ _id: orcamentoId, usuario: req.user_id });
        if (!orcamento) throw new CustomError({
            statusCode: 404,
            errorType: 'resourceNotFound',
            field: 'Orçamento',
            details: [],
            customMessage: messages.error.resourceNotFound('Orçamento')
        });

        const componentes = Array.isArray(orcamento.componentes) ? orcamento.componentes : [];
        const idx = componentes.findIndex(c => c && c._id && c._id.toString() === componenteId);
        if (idx === -1) throw new CustomError({
            statusCode: 404,
            errorType: 'resourceNotFound',
            field: 'Componente',
            details: [],
            customMessage: 'Componente não encontrado.'
        });

        // Preserve valor_unitario do componente existente 
        const old = (typeof componentes[idx].toObject === 'function') ? componentes[idx].toObject() : componentes[idx];
        componenteAtualizado.valor_unitario = Number(old.valor_unitario || 0);

        // normalize quantidade and recompute subtotal
        componenteAtualizado.quantidade = Number(componenteAtualizado.quantidade ?? old.quantidade);
        componenteAtualizado.subtotal = Number((componenteAtualizado.quantidade || 0) * componenteAtualizado.valor_unitario);

        componentes[idx] = {
            ...old,
            ...componenteAtualizado,
            _id: old._id
        };

        orcamento.componentes = componentes;
        orcamento.valor = componentes.reduce((acc, comp) => acc + Number(comp.subtotal || 0), 0);
        await orcamento.save();

        return orcamento;
    };
<<<<<<< HEAD
    
=======

    async removerComponente(orcamentoId, componenteId, req) {
        const orcamento = await this.model.findOne({ _id: orcamentoId, usuario: req.user_id });
        if (!orcamento) throw new CustomError({
            statusCode: 404,
            errorType: 'resourceNotFound',
            field: 'Orçamento',
            details: [],
            customMessage: messages.error.resourceNotFound('Orçamento')
        });

        orcamento.componentes = orcamento.componentes.filter(c => c._id.toString() !== componenteId);
        orcamento.valor = orcamento.componentes.reduce((acc, comp) => acc + comp.subtotal, 0);
        await orcamento.save();

        return orcamento;
    };

>>>>>>> b4d02c85d2f618e669503a6507114fa9946ed682
    // Métodos auxiliares.

    async buscarPorId(id, includeTokens = false, req) {
        let query = this.model.findOne({ _id: id, usuario: req.user_id });

        const orcamento = await query;
        if (!orcamento) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Orçamento',
                details: [],
                customMessage: messages.error.resourceNotFound('Orçamento')
            });
        };

        return orcamento;
    };

    async buscarPorProtocolo(protocolo, idIgnorado, req) {
        const filtro = { protocolo, usuario: req.user_id };

        if (idIgnorado) {
            filtro._id = { $ne: idIgnorado }
        };

        const documento = await this.model.findOne(filtro)

        return documento;
    };
};

export default OrcamentoRepository;