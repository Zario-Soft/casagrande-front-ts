import { AxiosResponse } from 'axios';
import { HttpClient } from '../../infrastructure/httpclient.component';
import { ProdutoDTO, ProdutoRequest } from './produtos.contracts';

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

    public async new(produto: ProdutoDTO): Promise<any> {
        const request: ProdutoRequest = {
            ...produto,
            valorunitario: parseFloat(produto.valorunitario),
        }
        
        await this.request.post(`${this.BASE_URL}`, request);
    }

    public async edit(produto: ProdutoDTO): Promise<any> {
        const request: ProdutoRequest = {
            ...produto,
            valorunitario: parseFloat(produto.valorunitario),
        }
        await this.request.put(`${this.BASE_URL}/${produto.id}`, request);
    }

    // public async getById(id: number): Promise<AxiosResponse<StudentsResponseItem>> {
    //     return await this.request.get(`${this.BASE_URL}/${id}`);
    // }

    public async delete(id: number): Promise<void> {
        await this.request.delete(`${this.BASE_URL}/${id}`);
    }
}

export default ProdutosService;