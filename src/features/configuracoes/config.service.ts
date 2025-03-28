import { HttpClient } from '../../infrastructure/httpclient.component';

export enum ConfigName {
    trello_teste_listaid = 'trello.teste.listaid',
    trello_teste_checklistitems = 'trello.teste.checklistitems',
    slack_teste_groupoid = 'slack.teste.groupoid',
}

export interface Config {
    id: number,
    nome: ConfigName,
    valor: string
}

export class ConfigurationService {
    private readonly request: HttpClient;
    private readonly BASE_URL: string = 'configs';

    constructor() {
        this.request = new HttpClient();
    }

    public async getAll(): Promise<Config[]> {
        const result = await this.request.get(`${this.BASE_URL}`);

        return result.data ?? [];
    }

    public async get(nome: ConfigName, configs: Config[] | undefined = undefined): Promise<Config | undefined> {
        if (!configs) {

            const { data } = await this.request.get(`${this.BASE_URL}`);
            configs = data ?? [];
        }

        return configs!.find((c: Config) => c.nome === nome);
    }
}

export default ConfigurationService;