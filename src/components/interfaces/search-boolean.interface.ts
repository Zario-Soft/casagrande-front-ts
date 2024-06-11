export class SearchBoolean {
    constructor(public value: number, public label: string) { }

    static Indiferente(): SearchBoolean { return new SearchBoolean(-3, 'Indiferente') }
    static Nao(): SearchBoolean { return new SearchBoolean(-2, 'Não') }
    static Sim(): SearchBoolean { return new SearchBoolean(-1, 'Sim') }

    ToBoolean(): boolean | undefined {
        return SearchBoolean.TooBoolean(this.value);
    }

    static TooBoolean(i: number): boolean | undefined {
        if (i === -3) return undefined;

        return i === -1
    }
}