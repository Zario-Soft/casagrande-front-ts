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
    images: (string | undefined)[],
}

export interface ReportContentSummaryItem {
    title?: string,
    value: string,
    fontSize?: number,
    visible?: boolean,
}

export interface ReportControlDialogProps {
    /** Texto que mostra dentro do formulário, abaixo do CNPJ  */
    formTitle?: string,
    /** Texto da janela de PDF */
    reportTitle?: string,
    onClose: () => Promise<void>,
    content?: ReportContent,
}
