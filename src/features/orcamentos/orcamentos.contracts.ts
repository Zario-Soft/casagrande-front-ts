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
            const item = StatusOrcamentoOptions.find(o => o.status === filter.value)!;

            return `status+identical=${item.index}`
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
    observacao?: string,
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
    clienteid: number,
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
    clientenome: string,
    generodescricao: string,
    produtodescricao: string,
    trellosaved?: boolean
}

export interface OrcamentoGetAllResponse {
    clientenome: string,
    clienteresponsavel: string,
    orcamento: OrcamentoDTO,
}

export interface StatusOrcamento {
    index: number,
    status: string,
    visible: boolean
}

export const StatusOrcamentoOptions: StatusOrcamento[] =
    [
        { index: 0, status: 'Pendente', visible: true },
        { index: 1, status: 'Aprovado', visible: true },
        { index: 2, status: 'Aprovado com ressalva', visible: true },
        { index: 3, status: 'Reprovado', visible: true },
        { index: 4, status: 'Teste Feito', visible: true },
        { index: 5, status: 'Desenho Feito', visible: true },
        { index: 6, status: 'Ajuste', visible: true },
        { index: 7, status: 'Ajuste Feito', visible: true },
        { index: 8, status: 'Ajuste Enviado', visible: true },
        { index: 9, status: 'Aprovado com ressalva feito', visible: true },
        { index: 10, status: 'Amostra', visible: true },
        { index: 11, status: 'Envio de documento', visible: true },
        { index: 12, status: 'Aguardando aprovação de documento', visible: true },
        { index: 13, status: 'Novo Pedido', visible: true },
        { index: 14, status: 'Recompra', visible: true },
        { index: 15, status: 'Recompra com Ressalva', visible: true },
        { index: 16, status: 'Novo Pedido Feito', visible: true },
        { index: 17, status: 'Recompra Feito', visible: true },
        { index: 18, status: 'Recompra com Ressalva Feito', visible: true }
    ]

export interface OrcamentoLookupItem {
    id: number,
    clienteid: number,
    clientenome: string,
}