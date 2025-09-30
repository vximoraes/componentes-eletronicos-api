import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

class Estoque {
    constructor() {
        const estoqueSchema = new mongoose.Schema({
            quantidade: {
                type: Number,
                required: true,
                default: 0,
                min: 0
            },
            componente_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'componentes',
                required: true
            },
            localizacao_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'localizacoes',
                required: true
            },
            usuario_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'usuarios',
                required: true
            }
        }, {
            timestamps: true
        });

        // Index composto para garantir unicidade de componente por localização
        estoqueSchema.index({ componente_id: 1, localizacao_id: 1 }, { unique: true });

        // Middleware para atualizar quantidade total do componente após salvar
        estoqueSchema.post('save', async function() {
            await this.constructor.atualizarQuantidadeComponente(this.componente_id);
        });

        // Middleware para atualizar quantidade total do componente após remoção
        estoqueSchema.post('deleteOne', async function() {
            const doc = await this.model.findOne(this.getQuery());
            if (doc) {
                await this.model.atualizarQuantidadeComponente(doc.componente_id);
            }
        });

        // Middleware para atualizar quantidade total do componente após update
        estoqueSchema.post(['updateOne', 'findOneAndUpdate'], async function() {
            const doc = await this.model.findOne(this.getQuery());
            if (doc) {
                await this.model.atualizarQuantidadeComponente(doc.componente_id);
            }
        });

        // Método estático para atualizar quantidade total do componente
        estoqueSchema.statics.atualizarQuantidadeComponente = async function(componenteId) {
            const Componente = mongoose.model('componentes');
            
            // Soma todas as quantidades do componente em todas as localizações
            const resultado = await this.aggregate([
                { $match: { componente_id: componenteId } },
                { $group: { _id: null, quantidadeTotal: { $sum: '$quantidade' } } }
            ]);

            const quantidadeTotal = resultado.length > 0 ? resultado[0].quantidadeTotal : 0;

            // Atualiza a quantidade total no componente
            await Componente.findByIdAndUpdate(componenteId, { quantidade: quantidadeTotal });
        };

        estoqueSchema.plugin(mongoosePaginate);

        this.model = mongoose.model("estoques", estoqueSchema);
    };
};

export default new Estoque().model;