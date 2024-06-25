import { HttpClient } from '../../infrastructure/httpclient.component';
import { Paging } from '../common/base-contracts';
import { VendaDTO } from './vendas.contracts';

export class VendasService {
    private readonly request: HttpClient;
    private readonly BASE_URL: string = 'venda';

    constructor() {
        this.request = new HttpClient();
    }

    public async getById(clienteId: number): Promise<VendaDTO> {
        const { data } = await this.request.get(`${this.BASE_URL}/${clienteId}`);

        return data;
    }

    public async getAll(filter?: Paging): Promise<VendaDTO[]> {
        const { data } = filter
            ? await this.request.get(`${this.BASE_URL}${filter.stringify()}`)
            : await this.request.get(`${this.BASE_URL}`);

        return data;
    }

    public async new(cliente: VendaDTO): Promise<any> {
        await this.request.post(`${this.BASE_URL}`, cliente);
    }

    public async edit(cliente: VendaDTO): Promise<any> {
        await this.request.put(`${this.BASE_URL}/${cliente.id}`, cliente);
    }

    public async delete(id: number): Promise<void> {
        await this.request.delete(`${this.BASE_URL}/${id}`);
    }
}


export default VendasService;