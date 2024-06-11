import { AxiosResponse } from 'axios';
import { HttpClient } from '../../infrastructure/httpclient.component';

export interface DoLoginRequest {
    username: string,
    password: string,
}

export class LoginService {
    private readonly request: HttpClient;

    constructor(){
        this.request = new HttpClient();
    }

    public async doLogin(data: DoLoginRequest): Promise<AxiosResponse<any, any>> {
        return this.request.post(`auth/login`, data);
    }
}


export default LoginService;