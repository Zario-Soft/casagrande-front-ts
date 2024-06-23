import SearchCombobox from "src/components/combobox/search-combo";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { LookupProps } from "../common/base-contracts";
import UpsertModalOrcamento from "./orcamentos-modal.page";
import { OrcamentoDTO, OrcamentoGetAllResponse, OrcamentoGrid } from "./orcamentos.contracts";
import OrcamentosService from "./orcamentos.service";

export interface OrcamentoLookupProps
    extends LookupProps<OrcamentoLookupItem> { }

export interface OrcamentoLookupItem {
    id: number,
    clienteid: number,
    clientenome: string,
}

export default function OrcamentoLookup(props: OrcamentoLookupProps) {
    const orcamentosService = new OrcamentosService();

    const [selected, setSelected] = useState<OrcamentoLookupItem>();
    const [modalSelected, setModalSelected] = useState<OrcamentoGrid>();
    const [dataMapped, setDataMapped] = useState<OrcamentoLookupItem[]>([]);
    const [data, setData] = useState<OrcamentoGrid[]>([]);

    const [upsertDialogOpen, setUpsertDialogOpen] = useState(false);

    useEffect(() => { getAll() },
        // eslint-disable-next-line
        []);

    const getAll = async () => {
        try {
            let localData = await orcamentosService.getAllAprovados();

            const dataMapped = localData.map((o: OrcamentoGrid) => {
                const item: OrcamentoLookupItem = {
                    clienteid: o.clienteid,
                    clientenome: o.clientenome,
                    id: o.id,
                }

                return item;
            })

            await setDataMapped(dataMapped);
            await setData(localData);

            if (localData && props.selectedId) {
                const localSelected = dataMapped.find(f => f.id === props.selectedId);

                if (localSelected) {
                    await setSelected(localSelected);
                }
            }

        } catch {
            toast.error('Não foi possivel carregar os dados. Verifique a internet.');
        }
    }

    const onAfter = async (items?: OrcamentoLookupItem[]): Promise<OrcamentoLookupItem | undefined> => {
        const st = items?.find(f => f.id === selected?.id);

        await setSelected(st);

        return st;
    }

    const onChange = async (s: OrcamentoLookupItem) => {
        await setSelected(s);
        if (props.onChange)
            props.onChange(s);
    }

    const onAddClick = async (_?: OrcamentoLookupItem) => {
        await setModalSelected(undefined);
        await setUpsertDialogOpen(true);
    }

    const onShowClick = async (s?: OrcamentoLookupItem) => {
        await setModalSelected(data.find(f => f.id === s!.id));
        await setUpsertDialogOpen(true);
    }

    return <>
        <SearchCombobox<OrcamentoLookupItem>
            value={selected}
            id="cliente-search-modal"
            label="Orcamento"
            onChange={onChange}
            onAddClick={onAddClick}
            onShowClick={onShowClick}
            options={dataMapped}
            getOptionLabel={(o: OrcamentoLookupItem) => `${o.id} (${o.clienteid} ${o.clientenome})` }
            onAfter={onAfter}
            sx={props.sx}
            style={props.style}
        />
        {upsertDialogOpen && <UpsertModalOrcamento
            orcamento={modalSelected}
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