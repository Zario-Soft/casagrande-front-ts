import { ClienteEndereco } from "./clientes.contracts";
import ClientesService from "./clientes.service";

export const fillState = async (e: any, clientesService: ClientesService): Promise<string | undefined> => {
    let s = e.target.value as String;
    const match = s.match("([0-9]+)");

    if (!!match) {
        const { data } = await clientesService.getStateByDDD(match[0]);

        return data;
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

export const preencheCEP = async (e: any, current: any, setCurrent: any): Promise<ClienteEndereco | undefined> => {
    const cep = e.target.value.replace("-", "");

    if (cep.trim() === "") return undefined;

    const url = `https://viacep.com.br/ws/${cep}/json/`;

    fetch(url)
        .then(r => r.json())
        .then(async r => {
            await setCurrent(
                {
                    ...current,
                    bairro: r.bairro,
                    cidade: r.localidade,
                    endereco: r.logradouro,
                    estado: r.uf
                })
        })
}