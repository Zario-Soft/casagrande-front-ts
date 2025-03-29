export interface CalendarioResponse {
    titulo: string,
    datas: CalendarioDate[]
}

export interface CalendarioDate {
    titulo: string,
    itens: CalendarioDateItem[]
}

export interface CalendarioDateItem {
    vendaid: number,
    clientenome: string,
    quantidade: number    
}