import mongoose from "mongoose";
import DbConnect from "../config/DbConnect.js";
import categoriaSeed from "./categoriaSeed.js";
import localizacaoSeed from "./localizacaoSeed.js";
import componenteSeed from "./componenteSeed.js";
import estoqueSeed from "./estoqueSeed.js";
import fornecedorSeed from "./fornecedorSeed.js";
import movimentacaoSeed from "./movimentacaoSeed.js";
import usuarioSeed from "./usuarioSeed.js";
import notificacaoSeed from "./notificacaoSeed.js";
import componenteOrcamentoSeed from "./componenteOrcamentoSeed.js";
import orcamentoSeed from "./orcamentoSeed.js";
import rotasSeed from "./rotasSeed.js"

await DbConnect.conectar();

try {
    console.log(`[${new Date().toLocaleString()}] - Iniciando criação das seeds...`);

    await rotasSeed();
    await usuarioSeed(); 
    await categoriaSeed();
    await localizacaoSeed();
    await componenteSeed();
    await estoqueSeed();
    await fornecedorSeed();
    await movimentacaoSeed();
    await notificacaoSeed();
    await componenteOrcamentoSeed();
    await orcamentoSeed();

    console.log(`[${new Date().toLocaleString()}] - Seeds criadas com sucesso!`);
} catch (error) {
    console.error("Erro ao criar seeds:", error);
} finally {
    mongoose.connection.close();
    process.exit(0);
};