import { Paging, PagingFilter } from "../common/base-contracts";

export class OrcamentoPaging extends Paging {
    constructor(
        public page: number = 0,
        public filter?: PagingFilter,
    ) {
        super(page, filter);
    }

    override mountColumnFilter(): string {
        const filter = this.filter!;

        if (filter.column === 'id') {
            return `orcamentoid+identical=${filter.value}`;
        }
        
        if (filter.column === 'statusdescricao') {
            const value = StatusOrcamento.indexOf(filter.value);
            return `status+identical=${value}`
        }

        if (filter.column === 'clienteresponsavel') {
            return `responsavel+contains=${filter.value}`
        }
        
        return '';
    }
}

export interface OrcamentoDTO {
    id: number,
    clienteid: number,
    status: number,
    frete?: number,
    valortotal: number,
    observacao: string,
    dataorcamento?: string,
    dataenvioteste?: string
}

export interface OrcamentoGrid extends OrcamentoDTO {
    clientenome?: string,
    clienteresponsavel: string,
    statusdescricao: string,
}

export interface OrcamentoUpsertRequest {
    orcamento: OrcamentoDTO,
    produtos: OrcamentoProdutoDTO[]
}

export interface OrcamentoProdutoResponse {
    produtovalor: number,
    cornome: string,
    generodescricao: string,
    produtodescricao: string,
    orcamentoproduto: OrcamentoProdutoDTO
}

export interface OrcamentoProdutoDTO {
    id: number,
    orcamentoid: number,
    produtoid: number,
    corid: number,
    quantidade: number,
    excluido: number,
    genero: number,
    fotoinicial?: string,
    fotoinicialbase64: string | undefined,
    fotoinicial2?: string,
    fotoinicial2base64: string | undefined,
    fotoreal?: string,
    fotorealbase64: string | undefined,
    fotoreal2?: string,
    fotoreal2base64: string | undefined,
    observacaotecnica1: string,
    observacaotecnica2: string,
    trellocardid: string | undefined,
}

export interface OrcamentoProdutoGrid
    extends OrcamentoProdutoDTO {
    produtovalor: number,
    cornome: string,
    generodescricao: string,
    produtodescricao: string,
}

export interface OrcamentoGetAllResponse {
    clientenome: string,
    clienteresponsavel: string,
    orcamento: OrcamentoDTO,
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
        'Envio de documento',
        'Aguardando aprovação de documento',
    ]

export interface OrcamentoLookupItem {
    id: number,
    clienteid: number,
    clientenome: string,
}