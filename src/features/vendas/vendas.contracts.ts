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