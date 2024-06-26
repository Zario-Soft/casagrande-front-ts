import { ClienteEndereco } from "./clientes.contracts";
//import ClientesService from "./clientes.service";

//const clientesService = new ClientesService();

export const fillState = async (e: any): Promise<string | undefined> => {
    let s = e.target.value as String;
    const match = s.match("([0-9]+)");

    if (!!match) {
        //const { data } = await clientesService.getStateByDDD(match[0]);

        return undefined;
    }

    return undefined;
}

export const trySplitEndereco = (rawEndereco?: string): ClienteEndereco | undefined => {
    if (rawEndereco && rawEndereco.includes("|")) {
        const splitted = rawEndereco.split("|");

        return {
            endereco: splitted[0],
            bairro: splitted[1],
            cidade: splitted[2],
            numero: splitted[3],
            complemento: splitted[4],
            estado: splitted[5]
        }
    }

    return undefined;
}

export const preencheCEP = async (e: any): Promise<ClienteEndereco | undefined> => {
    const cep = e.target.value.replace("-", "");

    if (cep.trim() === "") return undefined;

    const url = `https://viacep.com.br/ws/${cep}/json/`;

    const result = (await fetch(url)).json() as any;

    return {
        bairro: result.bairro,
        cidade: result.localidade,
        endereco: result.logradouro,
        estado: result.uf
    }
}