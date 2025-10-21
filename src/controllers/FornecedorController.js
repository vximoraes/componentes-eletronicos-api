import FornecedorService from '../services/FornecedorService.js';
import { FornecedorQuerySchema, FornecedorIdSchema } from '../utils/validators/schemas/zod/querys/FornecedorQuerySchema.js';
import { FornecedorSchema, FornecedorUpdateSchema } from '../utils/validators/schemas/zod/FornecedorSchema.js';
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';

class FornecedorController {
    constructor() {
        this.service = new FornecedorService();
    };

    async criar(req, res) {
        const parsedData = FornecedorSchema.parse(req.body);
        let data = await this.service.criar(parsedData, req);

        let fornecedorLimpo = data.toObject();

        return CommonResponse.created(res, fornecedorLimpo);
    };

    async listar(req, res) {
        const { id } = req.params || {};
        if (id) {
            FornecedorIdSchema.parse(id);
        };

        const query = req.query || {};
        if (Object.keys(query).length !== 0) {
            await FornecedorQuerySchema.parseAsync(query);
        };

        const data = await this.service.listar(req);

        return CommonResponse.success(res, data);
    };

    async atualizar(req, res) {
        const { id } = req.params;
        FornecedorIdSchema.parse(id);

        const parsedData = FornecedorUpdateSchema.parse(req.body);
        const data = await this.service.atualizar(id, parsedData, req);

        return CommonResponse.success(res, data, 200, 'Fornecedor atualizado com sucesso.');
    };

    async inativar(req, res) {
        const { id } = req.params || {};
        FornecedorIdSchema.parse(id);

        const data = await this.service.inativar(id, req);

        return CommonResponse.success(res, data, 200, 'Fornecedor inativado com sucesso.');
    };
};

export default FornecedorController;