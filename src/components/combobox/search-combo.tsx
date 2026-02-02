import { Add, Visibility } from "@mui/icons-material";
import { Autocomplete, IconButton, SxProps, TextField, Theme } from "@mui/material";
import { useMemo, useState } from "react";

interface MuiComboboxProps<T> {
    id: string,
    label: string,
    options: T[],
    value?: T,
    style?: React.CSSProperties,
    sx?: SxProps<Theme>
    onChange: (e: T) => void,
    onAddClick?: (e?: T) => void,
    onShowClick?: (e?: T) => void,
    getOptionLabel?: (option: T) => string
    onAfter?: (options?: T[]) => Promise<T | undefined>,
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
                        setValue(result);
                });
        }
        // eslint-disable-next-line
    }, [options]);

    const [inputValue, setInputValue] = useState("");

    const onChange = async (_: any, value: any) => {
        setValue(value);

        props.onChange(value);
    }

    return <div style={{
        display: 'flex',
        width: '-webkit-fill-available',
        ...props.style,
    }}>
        <Autocomplete
            className="txt-box"
            getOptionKey={(c) => c.id}
            key={props.id}
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
        />
        {props.onAddClick && <IconButton color="primary" aria-label="Adicionar" component="span" onClick={() => props.onAddClick !== undefined && props.onAddClick(value)}
            style={{ marginTop: -5 }}>
            <Add />
        </IconButton>}
        {props.onShowClick && <IconButton color="primary" aria-label="Visualizar" component="span" onClick={() => props.onShowClick !== undefined && props.onShowClick(value)}
            style={{ marginTop: -5 }}>
            <Visibility />
        </IconButton>}
    </div>
}
