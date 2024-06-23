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
    images: string[],
}

export interface ReportContentSummaryItem {
    title?: string,
    value: string,
    fontSize?: number,
    visible?: boolean,
}
