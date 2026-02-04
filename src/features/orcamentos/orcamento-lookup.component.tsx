import SearchCombobox from "src/components/combobox/search-combo";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { LookupProps } from "../common/base-contracts";
import UpsertModalOrcamento from "./orcamentos-modal.page";
import { OrcamentoGrid, OrcamentoLookupItem } from "./orcamentos.contracts";
import OrcamentosService from "./orcamentos.service";
import { IsAuthorized } from "src/infrastructure/helpers";
export interface OrcamentoLookupProps
    extends LookupProps<OrcamentoLookupItem> { }

export default function OrcamentoLookup(props: OrcamentoLookupProps) {
    const orcamentosService = new OrcamentosService();

    const [selected, setSelected] = useState<OrcamentoLookupItem>();
    const [modalSelected, setModalSelected] = useState<OrcamentoGrid>();
    const [data, setData] = useState<OrcamentoLookupItem[]>([]);

    const [isLoading, setIsLoading] = useState(false);

    const [upsertDialogOpen, setUpsertDialogOpen] = useState(false);

    useEffect(() => { getAll() },
        // eslint-disable-next-line
        []);

    const getAll = async () => {
        setIsLoading(true);
        try {
            const data = await orcamentosService.getAllAprovados();
            setData(data);

            if (data && props.selectedId) {
                const localSelected = data.find(f => f.id === props.selectedId);

                if (localSelected) {
                    setSelected(localSelected);
                }
            }

        } catch (e: any) {
            toast.error('Não foi possivel carregar os dados. Verifique a internet.');
            console.error(e);
        }
        finally {
            setIsLoading(false);
        }
    }

    const onAfter = useCallback(async (items?: OrcamentoLookupItem[]): Promise<OrcamentoLookupItem | undefined> => {
        const st = items?.find(f => f.id === selected?.id);

        setSelected(st);

        return st;
    }, [selected?.id]);

    const onChange = useCallback(async (s: OrcamentoLookupItem) => {
        setSelected(s);
        if (props.onChange)
            props.onChange(s);
    }, [props]);

    const onAddClick = useCallback(async (_?: OrcamentoLookupItem) => {
        setModalSelected(undefined);
        setUpsertDialogOpen(true);
    }, []);

    const onShowClick = useCallback(async (s?: OrcamentoLookupItem) => {
        const localOrcamento = await orcamentosService.getById(s!.id)

        setModalSelected(localOrcamento);
        setUpsertDialogOpen(true);
        // eslint-disable-next-line
    }, []);

    const isAuthorized = useMemo(() => IsAuthorized('/orcamentos'), []);

    return <>
        <SearchCombobox<OrcamentoLookupItem>
            value={selected}
            id="cliente-search-modal"
            label="Orçamento"
            onChange={onChange}
            onAddClick={
                isAuthorized ? onAddClick : undefined
            }
            onShowClick={
                isAuthorized ? onShowClick : undefined
            }
            options={data}
            getOptionLabel={(o: OrcamentoLookupItem) => o.clientenome ?? ''}
            onAfter={onAfter}
            sx={props.sx}
            style={{
                ...props.style,
                opacity: isLoading ? 0.4 : 1,
                transition: 'opacity 0.2s ease-in-out',
                pointerEvents: isLoading ? 'none' : 'auto'
            }}
        />
        {upsertDialogOpen && <UpsertModalOrcamento
            orcamento={modalSelected}
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