import SearchCombobox from "src/components/combobox/search-combo";
import { useEffect, useState } from "react";
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

    const [upsertDialogOpen, setUpsertDialogOpen] = useState(false);

    useEffect(() => { getAll() },
        // eslint-disable-next-line
        []);

    const getAll = async () => {
        try {
            const data = await service.getAll();
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

    const onAfter = async (items?: ProdutoDTO[]): Promise<ProdutoDTO | undefined> => {
        const st = items?.find(f => f.id === selected?.id);

        await setSelected(st);

        return st;
    }

    const onChange = async (s: ProdutoDTO) => {
        await setSelected(s);
        if (props.onChange)
            props.onChange(s);
    }

    const onAddClick = async (_?: ProdutoDTO) => {
        await setModalSelected(undefined);
        await setUpsertDialogOpen(true);
    }

    const onShowClick = async (s?: ProdutoDTO) => {
        await setModalSelected(s);
        await setUpsertDialogOpen(true);
    }

    return <>
        <SearchCombobox<ProdutoDTO>
            value={selected}
            id="produto-search-modal"
            label="Produto"
            onChange={onChange}
            onAddClick={
                IsAuthorized('/produtos') ? onAddClick : undefined
            }
            onShowClick={
                IsAuthorized('/produtos') ? onShowClick : undefined
            }
            options={data}
            getOptionLabel={(o: ProdutoDTO) => o.descricao ?? ''}
            onAfter={onAfter}
            sx={props.sx}
            style={props.style}
        />
        {upsertDialogOpen && <UpsertModalProduct
            produto={modalSelected}
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