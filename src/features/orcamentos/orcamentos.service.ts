import { formatDate } from 'src/infrastructure/helpers';
import { HttpClient } from '../../infrastructure/httpclient.component';
import { OrcamentoGetAllResponse, StatusOrcamento, OrcamentoPaging, OrcamentoProdutoResponse, OrcamentoUpsertRequest, OrcamentoGrid, OrcamentoLookupItem } from './orcamentos.contracts';
import { ClienteExternalResponse } from '../clientes/clientes.contracts';
import { trySplitEndereco } from '../clientes/clientes-common';

export class OrcamentosService {
    private readonly request: HttpClient;
    private readonly BASE_URL: string = 'orcamento';

    constructor() {
        this.request = new HttpClient();
    }

    public async getAllAprovados(): Promise<OrcamentoLookupItem[]> {
        const { data } = await this.request.get(`${this.BASE_URL}/aprovado`);

        return data;
    }

    public async getById(orcamentoId: number): Promise<OrcamentoGrid> {
        const { data } = await this.request.get(`${this.BASE_URL}/${orcamentoId}`);

        return data;
    }

    public async getByCode(code: string): Promise<ClienteExternalResponse> {
        let { data } = await this.request.get(`${this.BASE_URL}-code/${code}`);

        if (data) {
            let endereco = trySplitEndereco(data.endereco);
            data = {...data, ...endereco}
        }

        return data;
    }

    public async getAll<T>(filter?: OrcamentoPaging): Promise<T[]> {
        const { data } = filter
            ? await this.request.get(`${this.BASE_URL}${filter.stringify()}`)
            : await this.request.get(this.BASE_URL);

        return this.mapToResponse<T>(data);
    }

    private mapToResponse<T>(data: any): T[] {
        console.log(data);

        if (data && data.length) {
            const result = data
                .sort((a: OrcamentoGetAllResponse, b: OrcamentoGetAllResponse) => (a.orcamento.id > b.orcamento.id) ? -1 : ((b.orcamento.id > a.orcamento.id) ? 1 : 0))
                .map((o: OrcamentoGetAllResponse) => {
                    return {
                        id: o.orcamento.id,
                        clienteid: o.orcamento.clienteid,
                        clientenome: o.clientenome,
                        clienteresponsavel: o.clienteresponsavel,
                        dataorcamento: formatDate(o.orcamento.dataorcamento),
                        dataenvioteste: o.orcamento.dataenvioteste,
                        observacao: o.orcamento.observacao,
                        statusdescricao: StatusOrcamento[o.orcamento.status],
                        status: o.orcamento.status,
                        frete: o.orcamento.frete,
                        valortotal: o.orcamento.valortotal,
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