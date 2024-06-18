import { Autocomplete, SxProps, TextField, Theme } from "@mui/material";
import { useMemo, useState } from "react";

interface MuiComboboxProps<T> {
    id: string,
    label: string,
    options: T[],
    value?: T,
    onChange: (e: T) => void,
    style?: React.CSSProperties,
    getOptionLabel?: (option: T) => string
    onAfter?: (options?: T[]) => Promise<T | undefined>,
    sx?: SxProps<Theme>
}

export default function SearchCombobox<T extends { id: number }>(props: MuiComboboxProps<T>) {
    const empty: T = {} as T;
    const [value, setValue] = useState<T>(empty);

    const { options, onAfter } = props;

    useMemo(() => {
        if (onAfter && options) {
            onAfter(options)
                .then(async result => {
                    if (result)
                        await setValue(result);
                });
        }
        // eslint-disable-next-line
    }, [options]);

    const [inputValue, setInputValue] = useState("");

    const onChange = async (_: any, value: any) => {
        await setValue(value);

        await props.onChange(value);
    }

    return <>
        {<Autocomplete
            getOptionKey={(c) => c.id}
            key={props.id}
            style={props.style}
            getOptionLabel={props.getOptionLabel}
            onChange={onChange}
            disablePortal
            inputValue={inputValue}
            onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
            id={props.id}
            value={value}
            options={props.options}
            sx={props.sx}
            renderInput={(params) => <TextField {...params} label={props.label} />}
        />}
    </>
}
