import SearchCombobox from "src/components/combobox/search-combo";
import { ClienteDTO } from "./clientes.contracts";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import UpsertModalClient from "./clientes-modal.page";
import { LookupProps } from "../common/base-contracts";
import { IsAuthorized } from "src/infrastructure/helpers";
import { useGetAllComboQuery, useLazyGetByIdQuery } from "./api";

export interface ClientesLookupProps
    extends LookupProps<ClienteDTO> { }

export default function ClientesLookup(props: ClientesLookupProps) {
    const [selected, setSelected] = useState<ClienteDTO>();
    const [modalSelected, setModalSelected] = useState<ClienteDTO>();

    const [upsertDialogOpen, setUpsertDialogOpen] = useState(false);
    const { data = [], refetch, isLoading } = useGetAllComboQuery(undefined, {
        refetchOnReconnect: true,
        pollingInterval: 600_000, // 10 minutos
    });

    const [getById] = useLazyGetByIdQuery();



    useEffect(() => {
        if (data.length > 0 && props.selectedId) {
            const localSelected = data.find(f => f.id === props.selectedId);
            if (localSelected) {
                setSelected(localSelected);
                props.onChange?.(localSelected);
            }
        }
    }, [data, props]);

    const onAfter = useCallback(async (items?: ClienteDTO[]): Promise<ClienteDTO | undefined> => {
        const st = items?.find(f => f.id === selected?.id);
        setSelected(st);
        return st;
    }, [selected?.id]);

    const onChange = useCallback((value: ClienteDTO) => {
        setSelected(value);
        props.onChange?.(value);
    }, [props]);

   const onAddClick = useCallback((_?: ClienteDTO) => {
        setModalSelected(undefined);
        setUpsertDialogOpen(true);
    }, []);

    const onShowClick = useCallback(async (client?: ClienteDTO) => {
        if (client && client.id) {
            client = await getById(client.id).unwrap();
        }

        setModalSelected(client);
        setUpsertDialogOpen(true);
        // eslint-disable-next-line
    }, []);

    const canAccessClientes = useMemo(() => IsAuthorized('/clientes'), []);

    return <><SearchCombobox<ClienteDTO>
        value={selected}
        id="cliente-search-modal"
        label="Cliente"
        onChange={onChange}
        onAddClick={
            canAccessClientes ? onAddClick : undefined
        }
        onShowClick={
            canAccessClientes ? onShowClick : undefined
        }
        options={data}
        getOptionLabel={(o: ClienteDTO) => o.nome ?? ''}
        onAfter={onAfter}
        sx={props.sx}
        style={{ 
          opacity: isLoading ? 0.4 : 1,
          transition: 'opacity 0.2s ease-in-out',
          pointerEvents: isLoading ? 'none' : 'auto' 
        }}
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
