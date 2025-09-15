import { fakeMappings } from "./globalFakeMapping.js";
import Fornecedor from "../models/Fornecedor.js";
import Usuario from "../models/Usuario.js";

export default async function fornecedorSeed() {
    const usuarios = await Usuario.find({});
    
    await Fornecedor.deleteMany({});

    for (let i = 0; i < 10; i++) {
        const usuarioRandom = usuarios[Math.floor(Math.random() * usuarios.length)];
        
        const fornecedor = {
            nome: fakeMappings.Fornecedor.nome.apply(),
            usuario: usuarioRandom._id
        };

        await Fornecedor.create(fornecedor);
    };
};