import { fakeMappings } from "./globalFakeMapping.js";
import Movimentacao from "../models/Movimentacao.js";
import Componente from "../models/Componente.js";
import Localizacao from "../models/Localizacao.js";
import Usuario from "../models/Usuario.js";

export default async function movimentacaoSeed() {
    const componenteList = await Componente.find({});
    const localizacaoList = await Localizacao.find({});
    const usuarios = await Usuario.find({});

    await Movimentacao.deleteMany({});

    for (let i = 0; i < 20; i++) {
        const tipo = fakeMappings.Movimentacao.tipo.apply();
        const componenteRandom = componenteList[Math.floor(Math.random() * componenteList.length)];
        const localizacaoRandom = localizacaoList[Math.floor(Math.random() * localizacaoList.length)];
        const usuarioRandom = usuarios[Math.floor(Math.random() * usuarios.length)];

        const movimentacao = {
            tipo,
            data_hora: fakeMappings.Movimentacao.data_hora.apply(),
            quantidade: fakeMappings.Movimentacao.quantidade.apply(),
            componente: componenteRandom._id,
            localizacao: localizacaoRandom._id,
            usuario: usuarioRandom._id,
        };

        await Movimentacao.create(movimentacao);
    };
};