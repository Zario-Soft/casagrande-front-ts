import { SxProps, Theme } from "@mui/material";

export class Paging {
    constructor(
        public page: number = 0,
        public filter?: PagingFilter,
    ) { }

    
    /** Transform fields to backend format 
     * The default result is:
     * 
     * `?page=0`
    */
    stringify(): string {
        let result = `?page=${this.page}`;
        if (this.filter) {
            let filterString = this.mountColumnFilter();

            if (filterString === '')
                filterString = this.mountDefaultFilter();

            result += `&filter=${encodeURIComponent(filterString)}`;
        }

        return result;
    }

    mountColumnFilter(): string {
        const filter = this.filter!;

        if (filter.column === 'id') {
            return `${filter.column}+identical=${filter.value}`;
        }
        return '';
    }

    private mountDefaultFilter(): string {
        return `${this.filter!.column}+${this.filter!.comparer}=${this.filter!.value}`
    }
}

export interface PagingFilter {
    column: string,
    comparer: string,
    value: string
}

/* Lookup */
export interface LookupProps<T> {
    onChange?: (item?: T) => void,
    /** Cover the style of the autocomplete */
    sx?: SxProps<Theme>,
    /** Cover the entire style of the component */
    style?: React.CSSProperties,
    selectedId?: number,
}