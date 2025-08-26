import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

class Componente {
    constructor() {
        const componenteSchema = new mongoose.Schema({
            nome: {
                type: String,
                index: true,
                unique: true,
                required: true
            },
            quantidade: {
                type: Number,
                required: false,
                default: 0
            },
            estoque_minimo: {
                type: Number,
                required: true
            },
            valor_unitario: {
                type: Number,
                required: true
            },
            descricao: {
                type: String,
                required: false
            },
            imagem: {
                type: String,
                required: false
            },
            localizacao: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "localizacoes", required: true
            },
            categoria: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "categorias", required: true
            },
            ativo: {
                type: Boolean,
                default: true
            },
        });

        componenteSchema.plugin(mongoosePaginate);

        this.model = mongoose.model("componentes", componenteSchema);
    };
};

export default new Componente().model;