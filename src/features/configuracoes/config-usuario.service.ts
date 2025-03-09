import { HttpClient } from '../../infrastructure/httpclient.component';
import { UsuarioDTO, UsuarioRequest, UsuarioResponse } from './configuracoes.contracts';

export class UserService {
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
        await this.request.post(`${this.BASE_URL}`, this.parse(usuario));
    }

    public async edit(usuario: UsuarioDTO): Promise<any> {
        await this.request.put(`${this.BASE_URL}/${usuario.id}`, this.parse(usuario));
    }

    public async delete(id: number): Promise<void> {
        await this.request.delete(`${this.BASE_URL}/${id}`);
    }

    private parse(usuario: UsuarioDTO): UsuarioRequest {
        return {
            ...usuario, 
            allowed_routes: !usuario.is_admin ? usuario.allowed_routes.join(',') : '',
            nome: usuario.login,
            secret: usuario.password === '' ? undefined : usuario.password,
            isadmin: usuario.is_admin
        }
    }
}

export default UserService;