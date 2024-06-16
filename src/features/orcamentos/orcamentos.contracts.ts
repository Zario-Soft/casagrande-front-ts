export interface OrcamentoDTO {
    id: number,
    clienteid: number,
    status: number,
    frete: number,
    valortotal: number,
    observacao: string,
    dataorcamento?: string,
    dataenvioteste?: string,
}

export interface OrcamentoGetAllResponse {
    clientenome: string,
    clienteresponsavel: string,
    orcamento: OrcamentoResponse,
}

export interface OrcamentoResponse {
    id: number,
    clienteid: number,
    status: number,
    frete: string,
    valortotal: string,
    observacao: string,
    dataorcamento?: string,
    dataenvioteste?: string,
}

export interface OrcamentoRequest {
    id: number,
    descricao: string,
    valorunitario: number,
    responsavel: string,
    isactive: boolean,
}

export const StatusOrcamento =
    [
        'Pendente',
        'Aprovado',
        'Aprovado com ressalva',
        'Reprovado',
        'Teste Feito',
        'Desenho Feito',
        'Ajuste',
        'Ajuste Feito',
        'Ajuste Enviado',
        'Aprovado com ressalva feito',
        'Amostra',
    ]