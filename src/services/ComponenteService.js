import ComponenteRepository from '../repositories/ComponenteRepository.js';
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';
import LocalizacaoModel from '../models/Localizacao.js';
import CategoriaModel from '../models/Categoria.js';
import minioClient from '../config/MinIO.js';
import compress from '../config/SharpConfig.js';

class ComponenteService {
    constructor() {
        this.repository = new ComponenteRepository();
    };

    async criar(parsedData, req) {
        await this.validateNome(parsedData.nome, null, req);
        await this.validateLocalizacao(parsedData.localizacao, req);
        await this.validateCategoria(parsedData.categoria, req);

        parsedData.usuario = req.user_id;
        const data = await this.repository.criar(parsedData);

        return data;
    };

    async listar(req) {
        const data = await this.repository.listar(req);

        return data;
    };

    async atualizar(id, parsedData, req) {
        await this.ensureComponentExists(id, req);
        await this.validateNome(parsedData.nome, id, req);

        delete parsedData.quantidade;

        const data = await this.repository.atualizar(id, parsedData, req);

        return data;
    };

    async deletar(id, req) {
        await this.ensureComponentExists(id, req);

        const data = await this.repository.deletar(id, req);

        return data;
    };

    // Métodos auxiliares.

    async validateNome(nome, id = null, req) {
        const componenteExistente = await this.repository.buscarPorNome(nome, id, req);
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

    async ensureComponentExists(id, req) {
        const componenteExistente = await this.repository.buscarPorId(id, false, req);
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

    async validateLocalizacao(localizacaoId, req) {
        const localizacao = await LocalizacaoModel.findOne({ _id: localizacaoId, usuario: req.user_id });
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

    async validateCategoria(categoriaId, req) {
        const categoria = await CategoriaModel.findOne({ _id: categoriaId, usuario: req.user_id });
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

    async uploadFoto(req, id) {
        const file = req.file;
        if (file.size > (5 * 1024 * 1024)) {
            throw new CustomError({
                statusCode: HttpStatusCodes.PAYLOAD_TOO_LARGE.code,
                errorType: 'payloadTooLarge',
                field: "Imagem",
                details: [{ path: "Imagem", message: "Arquivo é superior a 5 MB" }],
                customMessage: "O arquivo é maior do que 5 MB."
            });
        }
        try {
            const newFile = await compress(file.buffer);
            const objectName = `${id}.jpeg`;
            const data = await minioClient.putObject(process.env.MINIO_BUCKET_2, objectName, newFile, {
                'Content-Type': file.mimetype,
            });

            return data;
        } catch (err) {
            throw new Error(err);
        };
    }
};

export default ComponenteService;