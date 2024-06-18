import { AxiosResponse } from 'axios';
import { HttpClient } from '../../infrastructure/httpclient.component';
import { OrcamentoDTO, OrcamentoGetAllResponse, StatusOrcamento, OrcamentoPaging } from './orcamentos.contracts';

export class OrcamentosService {
    private readonly request: HttpClient;
    private readonly BASE_URL: string = 'orcamento';

    constructor() {
        this.request = new HttpClient();
    }

    public async getAll(filter: OrcamentoPaging): Promise<OrcamentoDTO[]> {
        const { data } = await this.request.get(`${this.BASE_URL}${filter.stringify()}`);

        if (data && data.length) {
            const result = data
                .sort((a: OrcamentoGetAllResponse, b: OrcamentoGetAllResponse) => (a.orcamento.id > b.orcamento.id) ? -1 : ((b.orcamento.id > a.orcamento.id) ? 1 : 0))
                .map((o: OrcamentoGetAllResponse) => {
                    return {
                        id: o.orcamento.id,
                        clienteid: o.orcamento.clienteid,
                        clientenome: o.clientenome,
                        clienteResponsavel: o.clienteresponsavel,
                        dataorcamento: o.orcamento.dataorcamento,
                        dataenvioteste: o.orcamento.dataenvioteste,
                        observacao: o.orcamento.observacao,
                        statusDescricao: StatusOrcamento[o.orcamento.status],
                        status: o.orcamento.status,
                        frete: parseFloat(o.orcamento.frete).toFixed(2),
                        valorTotal: parseFloat(o.orcamento.valortotal).toFixed(2),
                    };
                });

            return result;
        }

        return [];
    }

    public async getStateByDDD(ddd: string): Promise<AxiosResponse<string>> {
        return await this.request.get(`util/getstatebyddd/${ddd}`);
    }

    public async new(orcamento: OrcamentoDTO): Promise<any> {
        // const request: OrcamentoRequest = {
        //     ...orcamento,
        //     valorunitario: parseFloat(orcamento.valorunitario),
        // }
        
        await this.request.post(`${this.BASE_URL}`, orcamento);
    }

    public async edit(orcamento: OrcamentoDTO): Promise<any> {
        // const request: OrcamentoRequest = {
        //     ...orcamento,
        //     valorunitario: parseFloat(orcamento.valorunitario),
        //}
        await this.request.put(`${this.BASE_URL}/${orcamento.id}`, orcamento);
    }

    // public async getById(id: number): Promise<AxiosResponse<StudentsResponseItem>> {
    //     return await this.request.get(`${this.BASE_URL}/${id}`);
    // }

    public async delete(id: number): Promise<void> {
        await this.request.delete(`${this.BASE_URL}/${id}`);
    }
}

export default OrcamentosService;