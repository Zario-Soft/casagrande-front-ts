import { AxiosResponse } from 'axios';
import { HttpClient } from '../../infrastructure/httpclient.component';
import { Paging } from '../common/base-contracts';
import { CorDTO } from './cor.contracts';

export class CorService {
    new(current: CorDTO) {
        throw new Error("Method not implemented.");
    }
    edit(current: CorDTO) {
        throw new Error("Method not implemented.");
    }
    private readonly request: HttpClient;
    private readonly BASE_URL: string = 'cor';

    constructor() {
        this.request = new HttpClient();
    }

    public async getAll(): Promise<CorDTO[]> {
        const { data } = await this.request.get(`${this.BASE_URL}`);

        return data;
    }   
}


export default CorService;