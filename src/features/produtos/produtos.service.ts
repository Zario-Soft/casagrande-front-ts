import { AxiosResponse } from 'axios';
import { HttpClient } from '../../infrastructure/httpclient.component';
import { ClienteEndereco, ProdutoDTO, ProdutoResponse } from './produtos.contracts';

export class ProdutosService {
    private readonly request: HttpClient;
    private readonly BASE_URL: string = 'produto';

    constructor() {
        this.request = new HttpClient();
    }

    public async getAll(): Promise<ProdutoDTO[]> {
        const { data } = await this.request.get(`${this.BASE_URL}`);

        if (data) {
            const result = data
                .slice()
                .sort((a: ProdutoDTO, b: ProdutoDTO) => a.id > b.id ? -1 : 1); 
                
                

            return result;
        }

        return [];
    }

    public async getStateByDDD(ddd: string): Promise<AxiosResponse<string>> {
        return await this.request.get(`util/getstatebyddd/${ddd}`);
    }

    public async new(cliente: ProdutoDTO): Promise<any> {
        cliente.endereco = this.concatEndereco(cliente);
        await this.request.post(`${this.BASE_URL}`, cliente);
    }

    public async edit(cliente: ProdutoDTO): Promise<any> {
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

    private concatEndereco(cliente: ProdutoDTO): string {
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

export default ProdutosService;