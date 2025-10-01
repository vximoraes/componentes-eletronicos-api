import EstoqueService from '../services/EstoqueService.js';
import { EstoqueQuerySchema, EstoqueIdSchema } from '../utils/validators/schemas/zod/querys/EstoqueQuerySchema.js';
import { EstoqueSchema, EstoqueUpdateSchema } from '../utils/validators/schemas/zod/EstoqueSchema.js';
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';

class EstoqueController {
    constructor() {
        this.service = new EstoqueService();
    };

    async listar(req, res) {
        const { id } = req.params || {};
        if (id) {
            EstoqueIdSchema.parse(id);
        };

        const query = req.query || {};
        if (Object.keys(query).length !== 0) {
            await EstoqueQuerySchema.parseAsync(query);
        };

        const data = await this.service.listar(req);

        return CommonResponse.success(res, data);
    };
};

export default EstoqueController;