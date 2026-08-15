import { Paging, PagingFilter } from "../common/base-contracts";

export class VendaPaging extends Paging {
    constructor(
        public page: number = 0,
        public filter?: PagingFilter,
    ) {
        super(page, filter);
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
    'Cartão Débito', 'Cartão Crédito', 'Cheque', 'Transferência', 'PIX'
]