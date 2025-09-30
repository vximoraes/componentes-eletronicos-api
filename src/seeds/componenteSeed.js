import { fakeMappings } from "./globalFakeMapping.js";
import Componente from "../models/Componente.js";
import Categoria from "../models/Categoria.js";
import Usuario from "../models/Usuario.js";

export default async function componenteSeed() {
    const categoriaList = await Categoria.find({});
    const usuarios = await Usuario.find({});

    await Componente.deleteMany({});

    const nomesFixos = fakeMappings.Componente.nomesFixos;
    for (let nome of nomesFixos) {
        const categoriaRandom = categoriaList[Math.floor(Math.random() * categoriaList.length)];
        const usuarioRandom = usuarios[Math.floor(Math.random() * usuarios.length)];

        const componente = {
            nome,
            quantidade: fakeMappings.Componente.quantidade.apply(),
            estoque_minimo: fakeMappings.Componente.estoque_minimo.apply(),
            descricao: fakeMappings.Componente.descricao.apply(),
            imagem: fakeMappings.Componente.imagem.apply(),
            categoria: categoriaRandom._id,
            usuario: usuarioRandom._id,
            ativo: fakeMappings.Componente.ativo.apply(),
            status: fakeMappings.Componente.status.apply()
        };

        await Componente.create(componente);
    };
};