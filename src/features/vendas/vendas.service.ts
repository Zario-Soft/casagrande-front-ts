import { HttpClient } from '../../infrastructure/httpclient.component';
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

    public async getAll(): Promise<VendaDTO[]> {
        const { data } = await this.request.get(`${this.BASE_URL}`);

        if (data) {
            const result = data
                .slice()
                .sort((a: VendaDTO, b: VendaDTO) => a.id > b.id ? -1 : 1);

            return result;
        }

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