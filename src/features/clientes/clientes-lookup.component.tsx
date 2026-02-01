import SearchCombobox from "src/components/combobox/search-combo";
import { ClienteDTO } from "./clientes.contracts";
import { useEffect, useState } from "react";
import ClientesService from "./clientes.service";
import { toast } from "react-toastify";
import UpsertModalClient from "./clientes-modal.page";
import { LookupProps } from "../common/base-contracts";
import { IsAuthorized } from "src/infrastructure/helpers";
import { useGetAllComboQuery } from "./api";

export interface ClientesLookupProps
    extends LookupProps<ClienteDTO> { }

export default function ClientesLookup(props: ClientesLookupProps) {
    const clientesService = new ClientesService();

    const [selected, setSelected] = useState<ClienteDTO>();
    const [modalSelected, setModalSelected] = useState<ClienteDTO>();
    //const [data, setData] = useState<ClienteDTO[]>([]);

    const [upsertDialogOpen, setUpsertDialogOpen] = useState(false);
    const { data = [], refetch } = useGetAllComboQuery(undefined, {
        refetchOnReconnect: true,
        pollingInterval: 3600_000, // 1 hour
    });

    useEffect(() => {
        if (data.length > 0 && props.selectedId) {
            const localSelected = data.find(f => f.id === props.selectedId);
            if (localSelected) {
                setSelected(localSelected);
                props.onChange?.(localSelected);
            }
        }
    }, [data, props]);

    const onAfter = async (items?: ClienteDTO[]): Promise<ClienteDTO | undefined> => {
        const st = items?.find(f => f.id === selected?.id);

        setSelected(st);

        return st;
    }

    const onChange = async (s: ClienteDTO) => {
        setSelected(s);
        if (props.onChange)
            props.onChange(s);
    }

    const onAddClick = async (_?: ClienteDTO) => {
        setModalSelected(undefined);
        setUpsertDialogOpen(true);
    }

    const onShowClick = async (client?: ClienteDTO) => {
        if (client && client.id) {
            client = await clientesService.getById(client.id);
        }

        setModalSelected(client);
        setUpsertDialogOpen(true);
    }

    const isClientAuthorized = IsAuthorized('/clientes');

    return <><SearchCombobox<ClienteDTO>
        value={selected}
        id="cliente-search-modal"
        label="Cliente"
        onChange={onChange}
        onAddClick={
            isClientAuthorized ? onAddClick : undefined
        }
        onShowClick={
            isClientAuthorized ? onShowClick : undefined
        }
        options={data}
        getOptionLabel={(o: ClienteDTO) => o.nome ?? ''}
        onAfter={onAfter}
        sx={props.sx}
    />
        {upsertDialogOpen && <UpsertModalClient
            cliente={modalSelected}
            onClose={async (message: string | undefined) => {
                if (message) {
                    toast.success(message);
                    refetch();
                }
                setUpsertDialogOpen(false);
            }}
        />}
    </>
}
