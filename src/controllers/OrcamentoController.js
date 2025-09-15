import OrcamentoService from '../services/OrcamentoService.js';
import { OrcamentoQuerySchema, OrcamentoIdSchema } from '../utils/validators/schemas/zod/querys/OrcamentoQuerySchema.js';
import { OrcamentoSchema, OrcamentoUpdateSchema, ComponenteOrcamentoSchema, ComponenteOrcamentoUpdateSchema } from '../utils/validators/schemas/zod/OrcamentoSchema.js';
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';
import { v4 as uuid } from 'uuid';
import mongoose from 'mongoose';

class OrcamentoController {
    constructor() {
        this.service = new OrcamentoService();
    };

    async criar(req, res) {
        const parsedData = OrcamentoSchema.parse(req.body);
        const protocolo = uuid();

        const componentes = parsedData.componente_orcamento.map((comp) => {
            const quantidade = Number(comp.quantidade) || 0;
            const valor_unitario = Number(comp.valor_unitario) || 0;
            const subtotal = quantidade * valor_unitario;
            return {
                ...comp,
                quantidade,
                valor_unitario,
                subtotal,
                _id: new mongoose.Types.ObjectId()
            };
        });

        const valor = componentes.reduce((acc, comp) => acc + comp.subtotal, 0);

        const orcamentoParaSalvar = {
            ...parsedData,
            protocolo,
            valor,
            componentes
        };

        let data = await this.service.criar(orcamentoParaSalvar, req);
        let orcamentoLimpo = data.toObject();

        return CommonResponse.created(res, orcamentoLimpo);
    };

    async listar(req, res) {
        const { id } = req.params || {};
        if (id) {
            OrcamentoIdSchema.parse(id);
        };

        const query = req.query || {};
        if (Object.keys(query).length !== 0) {
            await OrcamentoQuerySchema.parseAsync(query);
        };

        const data = await this.service.listar(req);

        return CommonResponse.success(res, data);
    };

    async atualizar(req, res) {
        const { id } = req.params;

        // Não permitir alteração do valor_unitario no update do orçamento
        if (req.body.componente_orcamento && req.body.componente_orcamento.valor_unitario) {
            delete req.body.componente_orcamento.valor_unitario;
        }

        const parsedData = OrcamentoUpdateSchema.parse(req.body);
        const orcamentoAtualizado = await this.service.atualizar(id, parsedData, req);

        return CommonResponse.success(res, orcamentoAtualizado, 200, 'Orçamento atualizado com sucesso.');
    };

    async deletar(req, res) {
        const { id } = req.params || {};
        OrcamentoIdSchema.parse(id);
        const data = await this.service.deletar(id, req);
        return CommonResponse.success(res, data, 200, 'Orçamento excluído com sucesso.');
    };


    async adicionarComponente(req, res) {
        const { orcamentoId } = req.params;
        const componenteData = req.body;
        const parsedComponente = ComponenteOrcamentoSchema.parse(componenteData);
        const quantidade = Number(parsedComponente.quantidade) || 0;
        const valor_unitario = Number(parsedComponente.valor_unitario) || 0;
        const subtotal = quantidade * valor_unitario;
        const novoComponente = {
            ...parsedComponente,
            quantidade,
            valor_unitario,
            subtotal,
            _id: new mongoose.Types.ObjectId()
        };
        const orcamentoAtualizado = await this.service.adicionarComponente(orcamentoId, novoComponente, req);
        return CommonResponse.success(res, orcamentoAtualizado, 200, 'Componente adicionado com sucesso.');
    };

    async atualizarComponente(req, res) {
        const { orcamentoId, id } = req.params;
        const componenteData = req.body;
        if (!componenteData || Object.keys(componenteData).length === 0) {
            return CommonResponse.error(res, 400, 'validationError', 'componente', [{ message: 'Nenhum campo enviado para atualização.' }]);
        };
        const parsedComponente = ComponenteOrcamentoUpdateSchema.parse(componenteData);

<<<<<<< HEAD
        // valores antigos para garantir subtotal correto
        const oldComponente = await this.service.getComponenteById(orcamentoId, id);
=======
        // Buscar valores antigos para garantir subtotal correto
        const oldComponente = await this.service.getComponenteById(orcamentoId, id, req);
>>>>>>> b4d02c85d2f618e669503a6507114fa9946ed682
        if (!oldComponente) {
            return CommonResponse.error(res, 404, 'resourceNotFound', 'componente', [{ message: 'Componente não encontrado.' }]);
        };

        const componenteAtualizado = {
            ...oldComponente,
            ...parsedComponente,
            _id: id
        };

        // Atualiza somente quantidade. Valor unitário sempre mantido
        const quantidade = Object.prototype.hasOwnProperty.call(req.body, 'quantidade')
            ? Number(req.body.quantidade)
            : Number(oldComponente.quantidade);

        const valor_unitario = Number(oldComponente.valor_unitario);

        componenteAtualizado.quantidade = quantidade;
        componenteAtualizado.valor_unitario = valor_unitario;
        componenteAtualizado.subtotal = quantidade * valor_unitario;

        const orcamentoAtualizado = await this.service.atualizarComponente(orcamentoId, id, componenteAtualizado, req);
        return CommonResponse.success(res, orcamentoAtualizado, 200, 'Componente atualizado com sucesso.');
    };

    async removerComponente(req, res) {
        const { orcamentoId, id } = req.params;
        const orcamentoAtualizado = await this.service.removerComponente(orcamentoId, id, req);
        return CommonResponse.success(res, orcamentoAtualizado, 200, 'Componente removido com sucesso.');
    };
};

export default OrcamentoController;