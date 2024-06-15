import MaskedInput from 'react-text-mask';

export function CelMaskCustom(props: any) {
    return TextMaskCustom({ ...props, mask: ['(', /[1-9]/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/] });
}

export function TelMaskCustom(props: any) {
    return TextMaskCustom({ ...props, mask: ['(', /[1-9]/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/] });
}

export function CPFMaskCustom(props: any) {
    return TextMaskCustom({ ...props, mask: [/\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/] });
}

export function CNPJMaskCustom(props: any) {
    return TextMaskCustom({ ...props, mask: [/\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/] });
}

export function CEPMaskCustom(props: any) {
    return TextMaskCustom({ ...props, mask: [/\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/] });
}

function TextMaskCustom(props: any) {
    const { inputRef, ...other } = props;

    return <>
        <MaskedInput
            {...other}
            ref={(ref) => {
                inputRef(ref ? ref.inputElement : null);
            }}
            mask={props.mask}
            placeholderChar={'\u2000'}
            showMask
        />
    </>
}