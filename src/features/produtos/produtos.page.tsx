import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import ButtonsLine from "src/components/buttons-line";
import ScreenHeader from "src/components/screen-header";
import { SideBar } from "src/components/sidebar";
import ZGrid, { ZGridColDef } from "src/components/z-grid";
import { LoadingContext } from "src/providers/loading.provider";
import { ProdutosService } from "./produtos.service";
import { ProdutoDTO } from "./produtos.contracts";
import ConfirmationDialog from "src/components/dialogs/confirmation.dialog";
import UpsertModalClient from "./produtos-modal.page";

const columns: ZGridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'descricao', headerName: 'Descrição', width: 300 },
    {
        field: 'valorunitario', headerName: 'Valor Unitário', width: 200, valueFormatter: (value: string) => {
            console.log(value);
            return parseFloat(value).toFixed(2)
        }
    },
    { field: 'isactive', headerName: 'Ativo?', width: 150, valueFormatter: (value: boolean) => value ? "Sim" : "Não" }
];

export default function Produtos() {
    const produtosService = new ProdutosService();
    const { setIsLoading } = useContext(LoadingContext);
    const [data, setData] = useState<ProdutoDTO[]>([]);
    const [selected, setSelected] = useState<ProdutoDTO>();

    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    const [upsertDialogOpen, setUpsertDialogOpen] = useState(false);
    const [shouldClearGridSelection, setShouldClearGridSelection] = useState(false);

    useEffect(() => {
        refresh();
        // eslint-disable-next-line
    }, []);

    const getAll = async () => {
        try {
            await setIsLoading(true);

            const data = await produtosService.getAll();
            await setData(data);

        } catch {
            toast.error('Não foi possivel carregar os dados. Verifique a internet.');
        }
        finally {
            await setIsLoading(false);
        }
    }

    const refresh = async () => {
        await getAll();
        await setSelected(undefined);
    }

    const onExcludeClick = async () => {
        if (!selected) return;

        await setConfirmationDialogOpen(true);
    }

    const onNewClick = async () => {
        await setSelected(undefined);
        await setUpsertDialogOpen(true);
        await setShouldClearGridSelection(!shouldClearGridSelection);
    }

    const onRowDoubleClick = async (e: any) => {
        const localCurrent = data.find(c => c.id === (e as ProdutoDTO).id);
        await setSelected(localCurrent);
        await setUpsertDialogOpen(true);
    }

    const onConfirmExclusion = async () => {
        if (!selected) return;

        await produtosService.delete(selected.id);

        await refresh();

        toast.success("Registro excluído com sucesso");
    }

    return <>
        <div className="page-container">
            <SideBar>
                <div className="page-content">
                    <ScreenHeader
                        title="Produtos"
                        onUpdateClick={() => refresh()}
                    />
                    {data && <>
                        <ZGrid
                            shouldClearSelection={shouldClearGridSelection}
                            rows={data}
                            columns={columns}
                            onRowDoubleClick={async (e: any) => await onRowDoubleClick(e.row)}
                            onRowClick={async (e: any) => await setSelected(e.row)}
                        />
                        <ButtonsLine
                            onNewClick={onNewClick}
                            onEditClick={() => setUpsertDialogOpen(true)}
                            onExcludeClick={onExcludeClick}
                            excludeEnabled={selected === undefined}
                            editEnabled={selected === undefined}
                        />
                    </>}
                </div>
            </SideBar>
        </div>
        {confirmationDialogOpen && <ConfirmationDialog
            title="Excluir cliente"
            onConfirm={onConfirmExclusion}
            onClose={() => setConfirmationDialogOpen(false)}
        />}
        {upsertDialogOpen && <UpsertModalClient
            produto={selected}
            onClose={async (message: string | undefined) => {
                if (message) {
                    await toast.success(message);
                    await refresh();
                }

                await setUpsertDialogOpen(false);
            }}
        />}
    </>
}