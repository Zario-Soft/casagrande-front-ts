import SearchCombobox from "src/components/combobox/search-combo";
import { useCallback, useEffect, useMemo, useState } from "react";
import CorService from "./cor.service";
import { toast } from "react-toastify";
import { CorDTO } from "./cor.contracts";
import UpsertModalCor from "./cor-modal.page";
import { LookupProps } from "../../common/base-contracts";
import { IsAuthorized } from "src/infrastructure/helpers";

export interface CorLookupProps
    extends LookupProps<CorDTO> { }

export default function CorLookup(props: CorLookupProps) {
    const corService = new CorService();

    const [selected, setSelected] = useState<CorDTO>();
    const [modalSelected, setModalSelected] = useState<CorDTO>();
    const [data, setData] = useState<CorDTO[]>([]);

    const [upsertDialogOpen, setUpsertDialogOpen] = useState(false);

    useEffect(() => { getAll() },
        // eslint-disable-next-line
        []);

    const getAll = async () => {
        try {
            const data = await corService.getAll();
            setData(data);

            if (data && props.selectedId) {
                const localSelected = data.find(f => f.id === props.selectedId);

                if (localSelected)
                    setSelected(localSelected);
            }

        } catch {
            toast.error('Não foi possivel carregar os dados. Verifique a internet.');
        }
    }

    const onAfter = useCallback(async (items?: CorDTO[]): Promise<CorDTO | undefined> => {
        const st = items?.find(f => f.id === selected?.id);

        setSelected(st);

        return st;
    }, [selected?.id]);

    const onChange = useCallback(async (s: CorDTO) => {
        setSelected(s);
        if (props.onChange)
            props.onChange(s);
    }, [props]);

    const onAddClick = useCallback(async (_?: CorDTO) => {
        setModalSelected(undefined);
        setUpsertDialogOpen(true);
    }, []);

    const onShowClick = useCallback(async (s?: CorDTO) => {
        setModalSelected(s);
        setUpsertDialogOpen(true);
    }, []);

    const isAuthorized = useMemo(() => IsAuthorized('/configuracoes'), []);

    return <>
        <SearchCombobox<CorDTO>
            value={selected}
            id="cliente-search-modal"
            label="Cor"
            onChange={onChange}
            onAddClick={
                isAuthorized ? onAddClick : undefined
            }
            onShowClick={
                isAuthorized ? onShowClick : undefined
            }
            options={data}
            getOptionLabel={(o: CorDTO) => o.nome ?? ''}
            onAfter={onAfter}
            sx={props.sx}
            style={props.style}
        />
        {upsertDialogOpen && <UpsertModalCor
            cor={modalSelected}
            onClose={async (message: string | undefined) => {
                if (message) {
                    toast.success(message);
                    await getAll();
                }

                setUpsertDialogOpen(false);
            }}
        />}
    </>
}