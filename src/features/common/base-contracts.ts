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

            result += `&filter=${encodeURIComponent(filterString)}`;
        }

        return result;
    }

    mountColumnFilter(): string {
        const filter = this.filter!;
        let filterString = '';

        if (filter.column === 'id') {
            filterString = `${filter.column}+identical=${filter.value}`;
        }
        else {
            filterString = `${filter.column}+${filter.comparer}=${filter.value}`;
        }

        return filterString;
    }
}

export interface PagingFilter {
    column: string,
    comparer: string,
    value: string
}