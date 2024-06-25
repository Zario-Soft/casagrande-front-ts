import { HttpClient } from '../../infrastructure/httpclient.component';
import { CalendarioResponse } from './calendario.contracts';

export class CalendarioService {
    private readonly request: HttpClient;
    private readonly BASE_URL: string = 'calendario';

    constructor() {
        this.request = new HttpClient();
    }

    public async getAll(amount: number = 0): Promise<CalendarioResponse> {
        const { data } = await this.request.get(`${this.BASE_URL}/${amount}`)

        return data;
    }
}


export default CalendarioService;