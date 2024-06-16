export interface ClienteDTO {
    id: number,
    nome: string,
    responsavel: string,
    email: string,
    pessoafisica: boolean,
    isvip: boolean,
    isparceiro?: boolean,
    cpfcnpj: string,
    percparceiro?: number,
    telefone: string,
    celular: string,
    cep: string,
    endereco: string,
    estado?: string,
    numero?: string,
    complemento?: string,
    bairro?: string,
    cidade?: string,
    observacao: string,
}

export interface ClienteResponse {
    id: number,
    nome: string,
    responsavel: string,
    email: string,
    pessoafisica: number,
    isvip: number,
    isparceiro: number,
    cpfcnpj: string,
    percparceiro?: number,
    telefone: string,
    celular: string,
    cep: string,
    endereco: string,
    observacao: string,
}

export interface ClienteEndereco {
    endereco: string,
    bairro: string,
    cidade: string,
    numero: string,
    complemento: string,
    estado: string
}