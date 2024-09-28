import SearchCombobox from "src/components/combobox/search-combo";
import { ClienteDTO } from "./clientes.contracts";
import { useEffect, useState } from "react";
import ClientesService from "./clientes.service";
import { toast } from "react-toastify";
import UpsertModalClient from "./clientes-modal.page";
import { LookupProps } from "../common/base-contracts";

export interface ClientesLookupProps
    extends LookupProps<ClienteDTO> { }

export default function ClientesLookup(props: ClientesLookupProps) {
    const clientesService = new ClientesService();

    const [selected, setSelected] = useState<ClienteDTO>();
    const [modalSelected, setModalSelected] = useState<ClienteDTO>();
    const [data, setData] = useState<ClienteDTO[]>([]);

    const [upsertDialogOpen, setUpsertDialogOpen] = useState(false);

    useEffect(() => { getAll() },
        // eslint-disable-next-line
        []);

    const getAll = async () => {
        try {
            const data = await clientesService.getAll();
            await setData(data);

            if (data && props.selectedId) {
                const localSelected = data.find(f => f.id === props.selectedId);

                if (localSelected) {
                    await setSelected(localSelected);
                    if (props.onChange)
                        props.onChange(localSelected);
                }
            }

        } catch (e: any) {
            toast.error('Não foi possivel carregar os dados. Verifique a internet.');
            console.error(e);
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

    const onAddClick = async (_?: ClienteDTO) => {
        await setModalSelected(undefined);
        await setUpsertDialogOpen(true);
    }

    const onShowClick = async (client?: ClienteDTO) => {
        if (client) {
            client = await clientesService.getById(client.id);
        }
        
        await setModalSelected(client);
        await setUpsertDialogOpen(true);
    }

    return <><SearchCombobox<ClienteDTO>
        value={selected}
        id="cliente-search-modal"
        label="Cliente"
        onChange={onChange}
        onAddClick={onAddClick}
        onShowClick={onShowClick}
        options={data}
        getOptionLabel={(o: ClienteDTO) => o.nome ?? ''}
        onAfter={onAfter}
        sx={props.sx}
    />
        {upsertDialogOpen && <UpsertModalClient
            cliente={modalSelected}
            onClose={async (message: string | undefined) => {
                if (message) {
                    await toast.success(message);
                    await getAll();
                }

                await setUpsertDialogOpen(false);
            }}
        />}
    </>
}