export interface ReportContent {
    summaries: ReportContentBaseSummary[]
}

export interface ReportContentBaseSummary {
    title: string,
    description?: string,
    breakPage?: boolean,
    visible?: boolean,
}
export interface ReportContentSummary
    extends ReportContentBaseSummary {
    items: ReportContentSummaryItem[],

}
export interface ReportContentImageSummary
    extends ReportContentBaseSummary {
    images: (ReportContentImageSummaryItem | undefined)[],
    imageItems?: ImageItem[],
}

export interface ImageItem {
    images: (ReportContentImageSummaryItem | undefined)[],
    description: string
}

export interface ReportContentImageSummaryItem {
    guid: string,
    index: number,
    description?: string,
}

export interface ReportContentSummaryItem {
    title?: string,
    value: string,
    fontSize?: number,
    visible?: boolean,
}

export interface ReportContentTableSummary
    extends ReportContentBaseSummary {
    columns: ReportTableColumn[],
    rows: (string | number)[][],
}

export interface ReportTableColumn {
    key: string,
    label: string,
    kind?: 'text' | 'number' | 'currency' | 'date',
}

export interface ReportControlDialogProps {
    /** Texto que mostra dentro do formulário, abaixo do CNPJ  */
    formTitle?: string,
    /** Texto da janela de PDF */
    reportTitle?: string,
    onClose: () => Promise<void>,
    content?: ReportContent,
}
