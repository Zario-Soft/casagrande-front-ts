import { AxiosResponse } from 'axios';
import { HttpClient } from '../../infrastructure/httpclient.component';

export interface DoLoginRequest {
    usuario: string,
    senha: string,
    rawSenha: string,
}

export class LoginService {
    private readonly request: HttpClient;

    constructor(){
        this.request = new HttpClient();
    }

    public async doLogin(data: DoLoginRequest): Promise<AxiosResponse<any, any>> {
        return this.request.post(`login`, data);
    }
}


export default LoginService;