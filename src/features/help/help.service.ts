import { HttpClient } from '../../infrastructure/httpclient.component';

export class HelpService {
    private readonly request: HttpClient;
    private readonly BASE_URL: string = 'help';

    constructor() {
        this.request = new HttpClient();
    }

    public async sendToAdmin(message: string) {
        try {
            await this.request.post(`${this.BASE_URL}/send-to-admin`, { message });
        }
        catch (error) {
            console.error('Erro ao enviar mensagem para o admin:', error);
        }
    }
}

export default HelpService;