import { AxiosResponse } from 'axios';
import { HttpClient } from '../../infrastructure/httpclient.component';
import { Paging } from '../common/base-contracts';
import { ClienteEndereco, ClienteResponse, ClienteDTO } from './clientes.contracts';

export class ClientesService {
    private readonly request: HttpClient;
    private readonly BASE_URL: string = 'cliente';

    constructor() {
        this.request = new HttpClient();
    }

    public async getById(clienteId: number): Promise<ClienteDTO> {
        const { data } = await this.request.get(`${this.BASE_URL}/${clienteId}`);

        return this.mapResponse(data);
    }

    public async getAll(filter?: Paging): Promise<ClienteDTO[]> {
        const { data } = filter
            ? await this.request.get(`${this.BASE_URL}${filter.stringify()}`)
            : await this.request.get(`${this.BASE_URL}`);

        if (data) {
            let localCurrent = data as ClienteResponse[];

            const result = localCurrent
                .slice()
                .sort((a: ClienteResponse, b: ClienteResponse) => a.id > b.id ? -1 : 1)
                .map(this.mapResponse);

            return result;
        }

        return [];
    }

    public async getStateByDDD(ddd: string): Promise<AxiosResponse<string>> {
        return await this.request.get(`util/getstatebyddd/${ddd}`);
    }

    public async new(cliente: ClienteDTO): Promise<any> {
        cliente.endereco = this.concatEndereco(cliente);
        await this.request.post(`${this.BASE_URL}`, cliente);
    }

    public async edit(cliente: ClienteDTO): Promise<any> {
        cliente.endereco = this.concatEndereco(cliente);
        await this.request.put(`${this.BASE_URL}/${cliente.id}`, cliente);
    }

    private static trySplitEndereco(rawEndereco: string): ClienteEndereco | undefined {
        if (rawEndereco && rawEndereco.includes("|")) {
            const splitted = rawEndereco.split("|");

            return {
                endereco: splitted[0],
                bairro: splitted[1],
                cidade: splitted[2],
                numero: splitted[3],
                complemento: splitted[4],
                estado: splitted[5]
            }
        }

        return undefined;
    }

    private mapResponse(c: ClienteResponse): ClienteDTO {
       
        let endereco = ClientesService.trySplitEndereco(c.endereco);

        let result: ClienteDTO = {
            ...c,
            isvip: c.isvip === 1,
            isparceiro: c.isparceiro === 1,
            pessoafisica: c.pessoafisica === 1,
            percparceiro: c.percparceiro,
            ...endereco
        }

        return result;
    }

    private concatEndereco(cliente: ClienteDTO): string {
        const endereco = [cliente.endereco,
        cliente.bairro,
        cliente.cidade,
        cliente.numero,
        cliente.complemento,
        cliente.estado].join("|");

        return endereco;
    }

    // public async getById(id: number): Promise<AxiosResponse<StudentsResponseItem>> {
    //     return await this.request.get(`${this.BASE_URL}/${id}`);
    // }

    public async delete(id: number): Promise<void> {
        await this.request.delete(`${this.BASE_URL}/${id}`);
    }
}


export default ClientesService;