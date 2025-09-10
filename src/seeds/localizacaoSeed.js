import { fakeMappings } from "./globalFakeMapping.js";
import Localizacao from "../models/Localizacao.js";
import Usuario from "../models/Usuario.js";

export default async function localizacaoSeed() {
    const usuarios = await Usuario.find({});
    
    await Localizacao.deleteMany({});

    for (let i = 0; i < 10; i++) {
        const usuarioRandom = usuarios[Math.floor(Math.random() * usuarios.length)];
        
        const localizacao = {
            nome: fakeMappings.Localizacao.nome.apply(),
            usuario: usuarioRandom._id
        };

        await Localizacao.create(localizacao);
    };
};