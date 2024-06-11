import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import NativeSelect from '@mui/material/NativeSelect';
import { SxProps, Theme } from '@mui/material';
import { SearchBoolean } from '../interfaces/search-boolean.interface';

interface NakedSelectProps {
    value: number,
    name: string,
    label: string,
    id: string,
    items: { value: number, label: string }[],
    sx?: SxProps<Theme>,
    onChange: (item: number) => Promise<any>
}

export default function NakedSelect(props: NakedSelectProps) {
    const defaultValue = SearchBoolean.Indiferente().value;
    
    return (
        <Box>
            <FormControl>
                <InputLabel variant="standard" htmlFor={props.id}>
                    {props.label}
                </InputLabel>
                <NativeSelect
                    inputProps={{
                        name: props.name,
                        id: props.id,
                    }}
                    sx={{ ...props.sx! }}
                    value={props.value! ?? defaultValue}
                    onChange={async (e) => await props.onChange(Number(e.target.value))}
                >
                    {props.items.map((item, k) => <option value={item.value} key={k}>{item.label}</option>)}
                </NativeSelect>
            </FormControl>
        </Box>
    );
}