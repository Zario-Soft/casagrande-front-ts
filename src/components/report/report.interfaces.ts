export interface ReportContent {
    summaries: ReportContentSummary[]
}

export interface ReportContentSummary {
    title: string,
    image?: boolean,
    description?: string,
    breakPage?: boolean,    
    visible?: boolean,    
    items: ReportContentSummaryItem[],
    images?: string[],
}

export interface ReportContentSummaryItem {
    title?: string,
    value: string,
    fontSize?: number,
    visible?:boolean,
}
