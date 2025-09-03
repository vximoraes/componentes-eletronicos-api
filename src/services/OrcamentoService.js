import OrcamentoRepository from '../repositories/OrcamentoRepository.js';
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';
import OrcamentoModel from '../models/Orcamento.js';

class OrcamentoService {
    constructor() {
        this.repository = new OrcamentoRepository();
    };

    async criar(parsedData, req) {
        await this.validateProtocolo(parsedData.protocolo, null, req.user_id);

        parsedData.usuarioId = req.user_id;
        const data = await this.repository.criar(parsedData);

        return data;
    };

    async listar(req) {
        const data = await this.repository.listar(req);

        return data;
    };

    async atualizar(id, parsedData, req) {
        await this.ensureBudgetExists(id, req.user_id);

        const data = await this.repository.atualizar(id, parsedData, req.user_id);

        return data;
    };

    async deletar(id, req) {
        await this.ensureBudgetExists(id, req.user_id);

        const data = await this.repository.deletar(id, req.user_id);

        return data;
    };

    // Manipular componentes.

    async adicionarComponente(orcamentoId, novoComponente, req) {
        return await this.repository.adicionarComponente(orcamentoId, novoComponente, req.user_id);
    };

    async atualizarComponente(orcamentoId, componenteId, componenteAtualizado, req) {
        return await this.repository.atualizarComponente(orcamentoId, componenteId, componenteAtualizado, req.user_id);
    };

    async removerComponente(orcamentoId, componenteId, req) {
        return await this.repository.removerComponente(orcamentoId, componenteId, req.user_id);
    };

    async getComponenteById(orcamentoId, componenteId, req) {
        const orcamento = await this.repository.buscarPorId(orcamentoId, req.user_id);
        if (!orcamento) return null;

        const componentes = Array.isArray(orcamento.componentes) ? orcamento.componentes : [];
        const comp = componentes.find(c => c && c._id && c._id.toString() === componenteId);

        return comp || null;
    };

    // Métodos auxiliares.

    async validateProtocolo(protocolo, id = null, usuarioId) {
        const orcamentoExistente = await this.repository.buscarPorProtocolo(protocolo, id, usuarioId);
        if (orcamentoExistente) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'protocolo',
                details: [{ path: 'protocolo', message: 'Protocolo já está em uso.' }],
                customMessage: 'Nome já está em uso.',
            });
        };
    };

    async ensureBudgetExists(id, usuarioId) {
        const orcamentoExistente = await this.repository.buscarPorId(id, usuarioId);
        if (!orcamentoExistente) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Orçamento',
                details: [],
                customMessage: messages.error.resourceNotFound('Orçamento'),
            });
        };

        return orcamentoExistente;
    };
};

export default OrcamentoService;