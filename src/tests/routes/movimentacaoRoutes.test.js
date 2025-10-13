import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import "../../../src/routes/movimentacaoRoutes.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

let token;
const criarMovimentacaoValida = async (tipo = 'entrada', override = {}) => {
    // Gera nomes únicos para categoria e localizacao
    const unique = Date.now() + '-' + Math.floor(Math.random() * 10000);
    const categoriaNome = `Categoria Teste ${unique}`;
    const localizacaoNome = `Localizacao Teste ${unique}`;
    
    // Cria categoria
    const catRes = await request(BASE_URL)
        .post('/categorias')
        .set('Authorization', `Bearer ${token}`)
        .send({ nome: categoriaNome });
    const categoria = catRes.body?.data?._id;
    expect(categoria).toBeTruthy();
    
    // Cria localizacao
    const locRes = await request(BASE_URL)
        .post('/localizacoes')
        .set('Authorization', `Bearer ${token}`)
        .send({ nome: localizacaoNome });
    const localizacao = locRes.body?.data?._id;
    expect(localizacao).toBeTruthy();
    
    // Aguarda persistência das entidades dependentes
    await new Promise(r => setTimeout(r, 200));
    
    // Cria componente com todos os campos obrigatórios
    const componenteNome = `Resistor ${unique}`;
    const compRes = await request(BASE_URL)
        .post('/componentes')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
            nome: componenteNome, 
            categoria, 
            quantidade: 100, 
            estoque_minimo: "10", 
            valor_unitario: "0.5"
        });
    const componente = compRes.body?.data?._id;
    expect(componente).toBeTruthy();
    
    // Aguarda mais um pouco para garantir que todas as entidades estejam persistidas
    await new Promise(r => setTimeout(r, 150));
    
    return {
        componente,
        tipo,
        quantidade: "10",
        localizacao,
        ...override,
    };
};

describe('Rotas de Movimentação', () => {
    let movimentacaoId;

    beforeAll(async () => {
        // Testa se o servidor está online
        try {
            await request(BASE_URL).get('/');
        } catch (err) {
            // Se o servidor não estiver rodando, o teste falhará naturalmente
        }
        // Cria usuário admin e faz login
        const senhaAdmin = 'Senha@123';
        try {
            await request(BASE_URL)
                .post('/signup')
                .send({
                    nome: 'Admin',
                    email: 'admin@admin.com',
                    senha: senhaAdmin,
                    ativo: true
                });
        } catch (err) { }
        const loginRes = await request(BASE_URL)
            .post('/login')
            .send({ email: 'admin@admin.com', senha: senhaAdmin });
        token = loginRes.body?.data?.user?.accesstoken;
        expect(token).toBeTruthy();
    });

    describe('POST /movimentacoes', () => {
        it('deve cadastrar movimentação válida', async () => {
            const dados = await criarMovimentacaoValida();
            const res = await request(BASE_URL).post('/movimentacoes').set('Authorization', `Bearer ${token}`).send(dados);
            expect([200, 201]).toContain(res.status);
            expect(res.body.data).toHaveProperty('_id');
            expect(res.body.data._id).toBeTruthy();
            movimentacaoId = res.body.data._id;
        });
        it('deve falhar ao cadastrar sem campos obrigatórios', async () => {
            const res = await request(BASE_URL).post('/movimentacoes').set('Authorization', `Bearer ${token}`).send({});
            expect([400, 422]).toContain(res.status);
        });

    });

    describe('GET /movimentacoes', () => {
        it('deve listar todas as movimentações', async () => {
            const dados = await criarMovimentacaoValida();
            await request(BASE_URL).post('/movimentacoes').set('Authorization', `Bearer ${token}`).send(dados);
            const res = await request(BASE_URL).get('/movimentacoes').set('Authorization', `Bearer ${token}`);
            expect([200, 201]).toContain(res.status);
            expect(res.body.data).toHaveProperty('docs');
            expect(Array.isArray(res.body.data.docs)).toBe(true);
        }, 10000);
    });
    describe('GET /movimentacoes/:id', () => {
        it('deve retornar movimentação por id', async () => {
            const dados = await criarMovimentacaoValida();
            const movRes = await request(BASE_URL).post('/movimentacoes').set('Authorization', `Bearer ${token}`).send(dados);
            expect(movRes.body.data).toBeTruthy();
            const id = movRes.body.data._id;
            const res = await request(BASE_URL).get(`/movimentacoes/${id}`).set('Authorization', `Bearer ${token}`);
            expect([200, 201]).toContain(res.status);
            expect(res.body.data).toHaveProperty('_id', id);
        });
        it('deve retornar 404 para movimentação inexistente', async () => {
            const id = new mongoose.Types.ObjectId();
            const res = await request(BASE_URL).get(`/movimentacoes/${id}`).set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(404);
        });
    });
});