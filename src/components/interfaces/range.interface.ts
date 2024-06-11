export interface Range<Field, Input> {
    from: Field;
    to: Field;
    compare: (input: Input) => boolean
}