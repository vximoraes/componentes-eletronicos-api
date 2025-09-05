import MovimentacaoService from '../../../services/MovimentacaoService.js';
import MovimentacaoRepository from '../../../repositories/MovimentacaoRepository.js';
import Componente from '../../../models/Componente.js';
import Fornecedor from '../../../models/Fornecedor.js';
import { CustomError } from '../../../utils/helpers/index.js';

jest.mock('../../../repositories/MovimentacaoRepository.js');
jest.mock('../../../models/Componente.js');
jest.mock('../../../models/Fornecedor.js');

const makeComponente = (props = {}) => ({
    _id: 'comp1',
    quantidade: 10,
    save: jest.fn().mockResolvedValue(undefined),
    ...props
});
const makeFornecedor = (props = {}) => ({ _id: 'forn1', ...props });
const makeMovimentacao = (props = {}) => ({ _id: 'mov1', ...props });

describe('MovimentacaoService', () => {
    let service, repositoryMock;
    beforeEach(() => {
        MovimentacaoRepository.mockClear();
        repositoryMock = {
            criar: jest.fn(),
            listar: jest.fn()
        };
        MovimentacaoRepository.mockImplementation(() => repositoryMock);
        service = new MovimentacaoService();
        jest.clearAllMocks();
    });

    describe('criar', () => {
        it('deve cadastrar movimentação de entrada com sucesso', async () => {
            const parsedData = {
                componente: 'comp1',
                tipo: 'entrada',
                quantidade: 5,
                fornecedor: 'forn1'
            };
            const req = { user_id: 'user123' };
            Componente.findOne.mockResolvedValue(makeComponente());
            Fornecedor.findOne.mockResolvedValue(makeFornecedor());
            repositoryMock.criar.mockResolvedValue(makeMovimentacao(parsedData));

            const result = await service.criar({ ...parsedData }, req);
            expect(result).toMatchObject(parsedData);
            expect(repositoryMock.criar).toHaveBeenCalled();
        });

        it('deve cadastrar movimentação de saída com sucesso (sem fornecedor)', async () => {
            const parsedData = {
                componente: 'comp1',
                tipo: 'saida',
                quantidade: 3
            };
            const req = { user_id: 'user123' };
            const componente = makeComponente({ quantidade: 10 });
            Componente.findOne.mockResolvedValue(componente);
            repositoryMock.criar.mockResolvedValue(makeMovimentacao(parsedData));

            const result = await service.criar({ ...parsedData }, req);
            expect(result).toMatchObject(parsedData);
            expect(componente.quantidade).toBe(7);
            expect(repositoryMock.criar).toHaveBeenCalled();
        });

        it('deve lançar erro se componente não existir', async () => {
            const req = { user_id: 'user123' };
            Componente.findOne.mockResolvedValue(null);
            await expect(service.criar({ componente: 'x', tipo: 'entrada', quantidade: 1, fornecedor: 'f' }, req))
                .rejects.toThrow(CustomError);
        });

        it('deve lançar erro se tipo entrada e fornecedor ausente', async () => {
            const req = { user_id: 'user123' };
            Componente.findOne.mockResolvedValue(makeComponente());
            await expect(service.criar({ componente: 'c', tipo: 'entrada', quantidade: 1 }, req))
                .rejects.toThrow(CustomError);
        });

        it('deve lançar erro se tipo entrada e fornecedor não existir', async () => {
            const req = { user_id: 'user123' };
            Componente.findOne.mockResolvedValue(makeComponente());
            Fornecedor.findOne.mockResolvedValue(null);
            await expect(service.criar({ componente: 'c', tipo: 'entrada', quantidade: 1, fornecedor: 'f' }, req))
                .rejects.toThrow(CustomError);
        });

        it('deve lançar erro se quantidade insuficiente na saída', async () => {
            const req = { user_id: 'user123' };
            Componente.findOne.mockResolvedValue(makeComponente({ quantidade: 2 }));
            await expect(service.criar({ componente: 'c', tipo: 'saida', quantidade: 5 }, req))
                .rejects.toThrow(CustomError);
        });        it('deve lidar corretamente com tipo diferente de entrada/saida', async () => {
            const parsedData = {
                componente: 'comp1',
                tipo: 'outro',  
                quantidade: 5
            };
            const req = { user_id: 'user123' };
            const componente = makeComponente({ quantidade: 10 });
            Componente.findOne.mockResolvedValue(componente);
            repositoryMock.criar.mockResolvedValue(makeMovimentacao(parsedData));

            const result = await service.criar({ ...parsedData }, req);
            
            expect(result).toMatchObject(parsedData);
            expect(componente.quantidade).toBe(10); 
            expect(componente.save).toHaveBeenCalled();
            expect(repositoryMock.criar).toHaveBeenCalled();
        });
    });

    describe('listar', () => {
        it('deve retornar todas as movimentações', async () => {
            const req = {};
            const movs = [makeMovimentacao(), makeMovimentacao({ _id: 'mov2' })];
            repositoryMock.listar.mockResolvedValue(movs);
            const result = await service.listar(req);
            expect(result).toEqual(movs);
        });

        it('deve lançar erro inesperado do repository', async () => {
            repositoryMock.listar.mockRejectedValue(new Error('DB error'));
            await expect(service.listar({})).rejects.toThrow('DB error');
        });
    });
});