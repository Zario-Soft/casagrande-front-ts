import SearchCombobox from "src/components/combobox/search-combo";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { ProdutoDTO } from "./produtos.contracts";
import ProdutosService from "./produtos.service";
import UpsertModalProduct from "./produtos-modal.page";
import { LookupProps } from "../common/base-contracts";
import { IsAuthorized } from "src/infrastructure/helpers";
export interface ProdutosLookupProps
    extends LookupProps<ProdutoDTO> { }

export default function ProdutosLookup(props: ProdutosLookupProps) {
    const service = new ProdutosService();

    const [selected, setSelected] = useState<ProdutoDTO>();
    const [modalSelected, setModalSelected] = useState<ProdutoDTO>();
    const [data, setData] = useState<ProdutoDTO[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [upsertDialogOpen, setUpsertDialogOpen] = useState(false);

    useEffect(() => { getAll() },
        // eslint-disable-next-line
        []);

    const getAll = async () => {
        setIsLoading(true);
        try {
            const data = await service.getAll();
            setData(data);

            if (data && props.selectedId) {
                const localSelected = data.find(f => f.id === props.selectedId);

                if (localSelected)
                    setSelected(localSelected);
            }

        } catch {
            toast.error('Não foi possivel carregar os dados. Verifique a internet.');
        }
        finally {
            setIsLoading(false);
        }
    }

    const onAfter = useCallback(async (items?: ProdutoDTO[]): Promise<ProdutoDTO | undefined> => {
        const st = items?.find(f => f.id === selected?.id);

        setSelected(st);

        return st;
    }, [selected?.id]);

    const onChange = useCallback(async (s: ProdutoDTO) => {
        setSelected(s);
        if (props.onChange)
            props.onChange(s);
    }, [props]);

    const onAddClick = useCallback(async (_?: ProdutoDTO) => {
        setModalSelected(undefined);
        setUpsertDialogOpen(true);
    }, []);

    const onShowClick = useCallback(async (s?: ProdutoDTO) => {
        setModalSelected(s);
        setUpsertDialogOpen(true);
    }, []);

    const isAuthorized = useMemo(() => IsAuthorized('/produtos'), []);

    return <>
        <SearchCombobox<ProdutoDTO>
            value={selected}
            id="produto-search-modal"
            label="Produto"
            onChange={onChange}
            onAddClick={
                isAuthorized ? onAddClick : undefined
            }
            onShowClick={
                isAuthorized ? onShowClick : undefined
            }
            options={data}
            getOptionLabel={(o: ProdutoDTO) => o.descricao ?? ''}
            onAfter={onAfter}
            sx={props.sx}
            style={{
                ...props.style,
                opacity: isLoading ? 0.4 : 1,
                transition: 'opacity 0.2s ease-in-out',
                pointerEvents: isLoading ? 'none' : 'auto'
            }}
        />
        {upsertDialogOpen && <UpsertModalProduct
            produto={modalSelected}
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