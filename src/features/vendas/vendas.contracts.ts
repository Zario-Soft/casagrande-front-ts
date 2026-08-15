import { Paging, PagingFilter } from "../common/base-contracts";

export class VendaPaging extends Paging {
    constructor(
        public page: number = 0,
        public filter?: PagingFilter,
    ) {
        super(page, filter);
    }

    override mountColumnFilter(): string {
        const filter = this.filter!;

        if (filter.column === 'id') {
            return `id+identical=${filter.value}`;
        }

        if (filter.column === 'meiopagamentodescricao') {
            const index = FormasPagamento.findIndex(f => f === filter.value);

            return `meiopagamento+identical=${index}`
        }

        return '';
    }
}

export interface VendaDTO {
    id: number,
    orcamentoid: number,
    percpagamentoinicial?: number,
    datalimiteentrega: string,
    desconto?: number,
    meiopagamento: number,
}

export const FormasPagamento = [
    'Dinheiro',
    'Cartão de débito', 'Cartão de crédito', 'Cheque', 'Transferência', 'PIX'
]