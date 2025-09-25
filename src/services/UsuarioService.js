import bcrypt from 'bcrypt';
import UsuarioRepository from '../repositories/UsuarioRepository.js';
import GrupoRepository from '../repositories/GrupoRepository.js';
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';
import minioClient from '../config/MinIO.js';
import path from 'path';
import compress from '../config/SharpConfig.js';
// import AuthHelper from '../utils/AuthHelper.js';

class UsuarioService {
    constructor() {
        this.repository = new UsuarioRepository();
        this.grupoRepository = new GrupoRepository();
    };

    async criar(parsedData, req) {
        await this.validateEmail(parsedData.email, null, req.user_id);

        if (parsedData.senha) {
            const saltRounds = 10;
            parsedData.senha = await bcrypt.hash(parsedData.senha, saltRounds);
        };

        // Buscar grupo "Usuario" padrão se não foram fornecidas permissões
        if (!parsedData.permissoes || parsedData.permissoes.length === 0) {
            try {
                const grupoUsuario = await this.grupoRepository.buscarPorNome("Usuario", null, req.user_id);
                if (grupoUsuario) {
                    parsedData.permissoes = grupoUsuario.permissoes || [];
                }
            } catch (error) {
                // Se não conseguir buscar o grupo, continua sem definir permissões padrão
                console.warn('Não foi possível buscar o grupo "Usuario" padrão:', error.message);
            }
        }

        parsedData.usuarioId = req.user_id;
        const data = await this.repository.criar(parsedData);

        return data;
    };

    async listar(req) {
        const data = await this.repository.listar(req);

        return data;
    };

    async atualizar(id, parsedData, req) {
        delete parsedData.senha;
        delete parsedData.email; 

        await this.ensureUserExists(id, req.user_id);

        const data = await this.repository.atualizar(id, parsedData, req.user_id);

        return data;
    };

    async deletar(id, req) {
        await this.ensureUserExists(id, req.user_id);

        const data = await this.repository.deletar(id, req.user_id);

        return data;
    };

    // Métodos auxiliares.

    async validateEmail(email, id = null, usuarioId) {
        const usuarioExistente = await this.repository.buscarPorEmail(email, id, usuarioId);
        if (usuarioExistente) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'email',
                details: [{ path: 'email', message: 'Email já está em uso.' }],
                customMessage: 'Email já está em uso.',
            });
        };
    };

    async ensureUserExists(id, usuarioId) {
        const usuarioExistente = await this.repository.buscarPorId(id, usuarioId);
        if (!usuarioExistente) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.resourceNotFound('Usuário'),
            });
        };

        return usuarioExistente;
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
            const data = await minioClient.putObject(process.env.MINIO_BUCKET, objectName, newFile, {
                'Content-Type': file.mimetype,
            });

            return data;
        } catch (err) {
            throw new Error(err);
        };
    }
};

export default UsuarioService;