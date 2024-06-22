import { formatDate } from 'src/infrastructure/helpers';
import { HttpClient } from '../../infrastructure/httpclient.component';
import { OrcamentoDTO, OrcamentoGetAllResponse, StatusOrcamento, OrcamentoPaging, OrcamentoProdutoResponse, OrcamentoUpsertRequest } from './orcamentos.contracts';

export class OrcamentosService {
    private readonly request: HttpClient;
    private readonly BASE_URL: string = 'orcamento';

    constructor() {
        this.request = new HttpClient();
    }

    public async getAll(filter: OrcamentoPaging): Promise<OrcamentoDTO[]> {
        const { data } = await this.request.get(`${this.BASE_URL}${filter.stringify()}`);
        console.log(data);

        if (data && data.length) {
            const result = data
                .sort((a: OrcamentoGetAllResponse, b: OrcamentoGetAllResponse) => (a.orcamento.id > b.orcamento.id) ? -1 : ((b.orcamento.id > a.orcamento.id) ? 1 : 0))
                .map((o: OrcamentoGetAllResponse) => {
                    return {
                        id: o.orcamento.id,
                        clienteid: o.orcamento.clienteid,
                        clientenome: o.clientenome,
                        clienteResponsavel: o.clienteresponsavel,
                        dataorcamento: formatDate(o.orcamento.dataorcamento),
                        dataenvioteste: o.orcamento.dataenvioteste,
                        observacao: o.orcamento.observacao,
                        statusDescricao: StatusOrcamento[o.orcamento.status],
                        status: o.orcamento.status,
                        frete: parseFloat(o.orcamento.frete).toFixed(2),
                        valorTotal: parseFloat(o.orcamento.valortotal).toFixed(2),
                    };
                });

                console.log(result);
                return result;
        }

        return [];
    }



    public async getAllOrcamentoProdutos(orcamentoId: number): Promise<OrcamentoProdutoResponse[]> {
        const { data } = await this.request.get(`${this.BASE_URL}/${orcamentoId}/produto`);

        return data.produtos as OrcamentoProdutoResponse[];
    }

    public async new(request: OrcamentoUpsertRequest): Promise<any> {
        await this.request.post(`${this.BASE_URL}`, request);
    }

    public async edit(request: OrcamentoUpsertRequest): Promise<any> {
        await this.request.put(`${this.BASE_URL}/${request.orcamento.id}`, request);
    }

    public async delete(id: number): Promise<void> {
        await this.request.delete(`${this.BASE_URL}/${id}`);
    }
}

export default OrcamentosService;