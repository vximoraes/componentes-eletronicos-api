import MovimentacaoRepository from '../repositories/MovimentacaoRepository.js';
import Componente from '../models/Componente.js';
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';

class MovimentacaoService {
    constructor() {
        this.repository = new MovimentacaoRepository();
    };

    async criar(parsedData, req) {
        const componente = await Componente.findOne({ _id: parsedData.componente, usuario: req.user_id });
        if (!componente) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Componente',
                details: [],
                customMessage: messages.error.resourceNotFound('Componente')
            });
        };

        if (parsedData.tipo === 'saida') {
            const Estoque = await import('../models/Estoque.js');
            const estoqueAtual = await Estoque.default.findOne({
                componente: parsedData.componente,
                localizacao: parsedData.localizacao
            });
            
            const quantidadeDisponivel = estoqueAtual ? estoqueAtual.quantidade : 0;
            
            if (quantidadeDisponivel < parsedData.quantidade) {
                throw new CustomError({
                    statusCode: 400,
                    errorType: 'validationError',
                    field: 'quantidade',
                    details: [{ path: 'quantidade', message: `Quantidade insuficiente em estoque. Disponível: ${quantidadeDisponivel}` }],
                    customMessage: `Quantidade insuficiente em estoque. Disponível: ${quantidadeDisponivel}`
                });
            }
        }

        const now = new Date();
        now.setHours(now.getHours() - 4);
        now.setDate(now.getDate() - 1);
        parsedData.data_hora = now.toISOString().slice(0, 23).replace('T', ' ');

        parsedData.usuario = req.user_id;
        const data = await this.repository.criar(parsedData);
        return data;
    };

    async listar(req) {
        const data = await this.repository.listar(req);

        return data;
    };
};

export default MovimentacaoService;