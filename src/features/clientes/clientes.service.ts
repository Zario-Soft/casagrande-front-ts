import { AxiosResponse } from 'axios';
import { HttpClient } from '../../infrastructure/httpclient.component';
import { Paging } from '../common/base-contracts';
import { ClienteResponse, ClienteDTO, ClienteExternalResponse } from './clientes.contracts';
import { trySplitEndereco } from './clientes-common';

export class ClientesService {
    private readonly request: HttpClient;
    private readonly BASE_URL: string = 'cliente';

    constructor() {
        this.request = new HttpClient();
    }

    public async getById(clienteId: number): Promise<ClienteDTO> {
        const { data } = await this.request.get(`${this.BASE_URL}/${clienteId}`);

        return this.mapResponse(data);
    }

    public async getAll(filter?: Paging): Promise<ClienteDTO[]> {
        const { data } = filter
            ? await this.request.get(`${this.BASE_URL}${filter.stringify()}`)
            : await this.request.get(`${this.BASE_URL}`);

        if (data) {
            let localCurrent = data as ClienteResponse[];

            const result = localCurrent
                .slice()
                .sort((a: ClienteResponse, b: ClienteResponse) => a.id > b.id ? -1 : 1)
                .map(this.mapResponse);

            return result;
        }

        return [];
    }

    public async getAllCombo(filter?: Paging): Promise<ClienteDTO[]> {
        const { data } = filter
            ? await this.request.get(`${this.BASE_URL}-combo${filter.stringify()}`)
            : await this.request.get(`${this.BASE_URL}-combo`);

        if (data) {
            let localCurrent = data as ClienteResponse[];

            const result = localCurrent
                .slice()
                .sort((a: ClienteResponse, b: ClienteResponse) => a.id > b.id ? -1 : 1)
                .map((c) => {
                    return ({
                        id: c.id,
                        nome: c.nome,
                    } as ClienteDTO);
                });

            return result;
        }

        return [];
    }

    public async getStateByDDD(ddd: string): Promise<AxiosResponse<string>> {
        return await this.request.get(`util/getstatebyddd/${ddd}`);
    }

    public async new(cliente: ClienteDTO): Promise<any> {
        cliente.endereco = this.concatEndereco(cliente);
        await this.request.post(`${this.BASE_URL}`, cliente);
    }

    public async edit(cliente: ClienteDTO): Promise<any> {
        cliente.endereco = this.concatEndereco(cliente);
        await this.request.put(`${this.BASE_URL}/${cliente.id}`, cliente);
    }

    public async editExternal(cliente: ClienteExternalResponse): Promise<any> {
        let req: ClienteDTO = {
            ...cliente,
            isvip: false,
            pessoafisica: cliente.pessoafisica === 1,
            endereco: this.concatEndereco(cliente)
        }

        if (cliente.issamedataforinvoice === false) {

            req.observacao = req.observacao ? '\n\n' : '';

            req.observacao += '-- Dados para Nota Fiscal --\n';

            if (cliente.clienteinvoicedata?.nome)
                req.observacao += `\nNome = ${cliente.clienteinvoicedata?.nome}`;

            if (cliente.clienteinvoicedata?.email)
                req.observacao += `\nE-mail = ${cliente.clienteinvoicedata?.email}`;

            if (cliente.clienteinvoicedata?.cpfcnpj) {
                req.observacao += '\n' + (cliente.clienteinvoicedata?.pessoafisica === 1 ? 'CPF' : 'CNPJ');
                req.observacao += ` = ${cliente.clienteinvoicedata?.cpfcnpj}`;
            }

            if (cliente.clienteinvoicedata?.telefone)
                req.observacao += `\nTelefone = ${cliente.clienteinvoicedata?.telefone}`;

            if (cliente.clienteinvoicedata?.celular)
                req.observacao += `\nCelular = ${cliente.clienteinvoicedata?.celular}`;

            if (cliente.clienteinvoicedata?.cep)
                req.observacao += `\nCEP = ${cliente.clienteinvoicedata?.cep}`;

            if (cliente.clienteinvoicedata?.endereco)
                req.observacao += `\nEndereço = ${cliente.clienteinvoicedata?.endereco}`;

            if (cliente.clienteinvoicedata?.numero)
                req.observacao += `\nNúmero = ${cliente.clienteinvoicedata?.numero}`;

            if (cliente.clienteinvoicedata?.complemento)
                req.observacao += `\nComplemento = ${cliente.clienteinvoicedata?.complemento}`;

            if (cliente.clienteinvoicedata?.bairro)
                req.observacao += `\nBairro = ${cliente.clienteinvoicedata?.bairro}`;

            if (cliente.clienteinvoicedata?.cidade)
                req.observacao += `\nCidade = ${cliente.clienteinvoicedata?.cidade}`;

            if (cliente.clienteinvoicedata?.estado)
                req.observacao += `\nEstado = ${cliente.clienteinvoicedata?.estado}`;

            if (cliente.clienteinvoicedata?.observacao)
                req.observacao += `\nPonto de referência / observações = ${cliente.clienteinvoicedata?.observacao}`;
        }

        await this.request.put(`${this.BASE_URL}-external/${cliente.id} `, req);
    }


    private mapResponse(c: ClienteResponse): ClienteDTO {

        let endereco = trySplitEndereco(c.endereco);

        let result: ClienteDTO = {
            ...c,
            isvip: c.isvip === 1,
            isparceiro: c.isparceiro === 1,
            pessoafisica: c.pessoafisica === 1,
            percparceiro: c.percparceiro,
            ...endereco
        }

        return result;
    }

    private concatEndereco(cliente: { endereco?: string, bairro?: string, cidade?: string, numero?: string, complemento?: string, estado?: string }): string {
        const endereco = [cliente.endereco,
        cliente.bairro,
        cliente.cidade,
        cliente.numero,
        cliente.complemento,
        cliente.estado].join("|");

        return endereco;
    }

    // public async getById(id: number): Promise<AxiosResponse<StudentsResponseItem>> {
    //     return await this.request.get(`${ this.BASE_URL } /${id}`);
    // }

    public async delete(id: number): Promise<void> {
        await this.request.delete(`${this.BASE_URL}/${id}`);
    }
}


export default ClientesService;