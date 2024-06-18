import SearchCombobox from "src/components/combobox/search-combo";
import { ClienteDTO } from "./clientes.contracts";
import { useEffect, useState } from "react";
import ClientesService from "./clientes.service";
import { toast } from "react-toastify";
import { SxProps, Theme } from "@mui/material";

export interface ClientesLookupProps {
    onChange?: (client?: ClienteDTO) => void,
    sx?: SxProps<Theme>
}

export default function ClientesLookup(props: ClientesLookupProps) {
    const clientesService = new ClientesService();

    const [selected, setSelected] = useState<ClienteDTO>();
    const [data, setData] = useState<ClienteDTO[]>([]);

    useEffect(() => { getAll() },
        // eslint-disable-next-line
        []);

    const getAll = async () => {
        try {
            const data = await clientesService.getAll();
            await setData(data);

        } catch {
            toast.error('Não foi possivel carregar os dados. Verifique a internet.');
        }
    }

    const onAfter = async (items?: ClienteDTO[]): Promise<ClienteDTO | undefined> => {
        const st = items?.find(f => f.id === selected?.id);

        await setSelected(st);

        return st;
    }

    const onChange = async (s: ClienteDTO) => {
        await setSelected(s);
        if (props.onChange)
            props.onChange(s);
    }

    return <SearchCombobox<ClienteDTO>
        value={selected}
        id="cliente-search-modal"
        label="Cliente"
        onChange={onChange}
        options={data}
        getOptionLabel={(o: ClienteDTO) => o.nome ?? ''}
        onAfter={onAfter}
        sx={props.sx}
    />
}