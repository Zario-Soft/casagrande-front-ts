export interface ProdutoDTO {
    id: number,
    descricao: string,
    valorunitario: string,
    responsavel: string,
    isactive: boolean,
}

export interface ProdutoRequest {
    id: number,
    descricao: string,
    valorunitario: number,
    responsavel: string,
    isactive: boolean,
}