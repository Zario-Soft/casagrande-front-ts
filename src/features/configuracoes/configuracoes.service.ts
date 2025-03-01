import { HttpClient } from '../../infrastructure/httpclient.component';
import { UsuarioDTO, UsuarioResponse } from './configuracoes.contracts';

export class ConfiguracaoService {
    private readonly request: HttpClient;
    private readonly BASE_URL: string = 'usuarios';

    constructor() {
        this.request = new HttpClient();
    }

    public async getAll(): Promise<UsuarioResponse[]> {
        const { data } = await this.request.get(`${this.BASE_URL}`);

        if (data) {
            const result = data
                .slice()
                .sort((a: UsuarioResponse, b: UsuarioResponse) => a.id > b.id ? -1 : 1);

            return result;
        }

        return [];
    }

    public async new(usuario: UsuarioDTO): Promise<any> {
        await this.request.post(`${this.BASE_URL}`, usuario);
    }

    public async edit(usuario: UsuarioDTO): Promise<any> {
        await this.request.put(`${this.BASE_URL}/${usuario.id}`, usuario);
    }

    public async delete(id: number): Promise<void> {
        await this.request.delete(`${this.BASE_URL}/${id}`);
    }
}

export default ConfiguracaoService;