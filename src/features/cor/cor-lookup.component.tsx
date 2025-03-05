import SearchCombobox from "src/components/combobox/search-combo";
import { useEffect, useState } from "react";
import CorService from "./cor.service";
import { toast } from "react-toastify";
import { CorDTO } from "./cor.contracts";
import UpsertModalCor from "./cor-modal.page";
import { LookupProps } from "../common/base-contracts";
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
            await setData(data);

            if (data && props.selectedId) {
                const localSelected = data.find(f => f.id === props.selectedId);

                if (localSelected)
                    await setSelected(localSelected);
            }

        } catch {
            toast.error('Não foi possivel carregar os dados. Verifique a internet.');
        }
    }

    const onAfter = async (items?: CorDTO[]): Promise<CorDTO | undefined> => {
        const st = items?.find(f => f.id === selected?.id);

        await setSelected(st);

        return st;
    }

    const onChange = async (s: CorDTO) => {
        await setSelected(s);
        if (props.onChange)
            props.onChange(s);
    }

    const onAddClick = async (_?: CorDTO) => {
        await setModalSelected(undefined);
        await setUpsertDialogOpen(true);
    }

    const onShowClick = async (s?: CorDTO) => {
        await setModalSelected(s);
        await setUpsertDialogOpen(true);
    }

    return <>
        <SearchCombobox<CorDTO>
            value={selected}
            id="cliente-search-modal"
            label="Cor"
            onChange={onChange}
            onAddClick={
                IsAuthorized('/configuracoes') ? onAddClick : undefined
            }
            onShowClick={
                IsAuthorized('/configuracoes') ? onShowClick : undefined
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
                    await toast.success(message);
                    await getAll();
                }

                await setUpsertDialogOpen(false);
            }}
        />}
    </>
}