import { fakeMappings } from "./globalFakeMapping.js";
import Categoria from "../models/Categoria.js";
import Usuario from "../models/Usuario.js";

export default async function categoriaSeed() {
    const usuarios = await Usuario.find({});
    
    await Categoria.deleteMany({});

    for (let i = 0; i < fakeMappings.Categoria.categorias.length; i++) {
        const usuarioRandom = usuarios[Math.floor(Math.random() * usuarios.length)];
        
        const categoria = {
            nome: fakeMappings.Categoria.nome(i),
            usuario: usuarioRandom._id
        };

        await Categoria.create(categoria);
    };
};