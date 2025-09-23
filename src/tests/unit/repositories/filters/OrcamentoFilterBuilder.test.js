import OrcamentoFilterBuilder from '../../../../repositories/filters/OrcamentoFilterBuilder.js';

describe('OrcamentoFilterBuilder', () => {
    //garantir que o objeto de filtro inicial seja vazio.
    it('build deve retornar objeto vazio por padrão', () => {
        const builder = new OrcamentoFilterBuilder();
        // A asserção confirma que o método build() retorna um objeto vazio por padrão.
        expect(builder.build()).toEqual({});
    });

    it('comNome adiciona filtro regex de nome', () => {
        const builder = new OrcamentoFilterBuilder();
        builder.comNome('Teste');
        // A asserção verifica se o filtro de nome foi adicionado corretamente.
        expect(builder.build()).toEqual({ nome: { $regex: 'Teste', $options: 'i' } });
    });

    it('comProtocolo adiciona filtro regex de protocolo', () => {
        const builder = new OrcamentoFilterBuilder();
        builder.comProtocolo('ABC123');
        // Verifica se o filtro de protocolo foi adicionado como esperado.
        expect(builder.build()).toEqual({ protocolo: { $regex: 'ABC123', $options: 'i' } });
    });

    it('comNome e comProtocolo juntos', () => {
        const builder = new OrcamentoFilterBuilder();
        // Encadeia as chamadas dos métodos para adicionar múltiplos filtros.
        builder.comNome('A').comProtocolo('B');
        expect(builder.build()).toEqual({ nome: { $regex: 'A', $options: 'i' }, protocolo: { $regex: 'B', $options: 'i' } });
    });

    // Isso garante que a classe é robusta e não cria filtros inúteis ou inválidos.
    it('ignora filtros se valores falsy', () => {
        const builder = new OrcamentoFilterBuilder();
        builder.comNome('').comProtocolo(null);
        expect(builder.build()).toEqual({});
    });
});