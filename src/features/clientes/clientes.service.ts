import { AxiosResponse } from 'axios';
import { HttpClient } from '../../infrastructure/httpclient.component';
import { Paging } from '../common/base-contracts';
import { ClienteEndereco, ClienteResponse } from './clientes.contracts';

export class ClientesService {
    private readonly request: HttpClient;
    private readonly BASE_URL: string = 'cliente';

    constructor() {
        this.request = new HttpClient();
    }

    public async getAll(filter: Paging): Promise<ClienteResponse[]> {
        const result = await this.request.get(`${this.BASE_URL}${filter.stringify()}`);;

        if (result.data) {
            let localCurrent = result.data as ClienteResponse[];

            localCurrent = localCurrent
                .slice()
                .sort((a: ClienteResponse, b: ClienteResponse) => a.id > b.id ? -1 : 1)
                .map(c => {
                    let localEndereco = this.trySplitEndereco(c.endereco);

                    let result = {
                        ...c,
                        ...localEndereco
                    }

                    return result;
                });

            return localCurrent;

        }

        return [];
    }

    public async getStateByDDD(ddd: string): Promise<AxiosResponse<string>> {
        return await this.request.get(`util/getstatebyddd/${ddd}`);
    }

    public async new(cliente: ClienteResponse): Promise<any> {
        cliente.endereco = this.concatEndereco(cliente);
        await this.request.post(`${this.BASE_URL}`, cliente);
    }

    public async edit(cliente: ClienteResponse): Promise<any> {
        cliente.endereco = this.concatEndereco(cliente);
        await this.request.put(`${this.BASE_URL}/${cliente.id}`, cliente);
    }

    public trySplitEndereco(rawEndereco: string): ClienteEndereco | undefined {
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

    private concatEndereco(cliente: ClienteResponse): string {
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

    // public async edit(request : StudentsRequest): Promise<void> {
    //     await this.request.put(`${this.BASE_URL}/${request.id}`, request);
    // }

    // public async new(request : StudentsRequest): Promise<any> {
    //     return await this.request.post(this.BASE_URL, request);
    // }

    public async delete(id: number): Promise<void> {
        await this.request.delete(`${this.BASE_URL}/${id}`);
    }
}


export default ClientesService;