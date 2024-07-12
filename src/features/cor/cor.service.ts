import { HttpClient } from '../../infrastructure/httpclient.component';
import { CorDTO } from './cor.contracts';

export class CorService {
    
    private readonly request: HttpClient;
    private readonly BASE_URL: string = 'cor';

    constructor() {
        this.request = new HttpClient();
    }

    public async getAll(): Promise<CorDTO[]> {
        const { data } = await this.request.get(`${this.BASE_URL}`);

        return (data as CorDTO[]).sort((a,b) => a.nome > b.nome ? 1 : -1);
    }   

    public async new(cor: CorDTO) {
        await this.request.post(`${this.BASE_URL}`, cor);
    }
    async edit(cor: CorDTO) {
        await this.request.put(`${this.BASE_URL}/${cor.id}`, cor);
    }
}


export default CorService;