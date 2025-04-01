import { toast } from "react-toastify";
import ButtonsLine from "src/components/buttons-line";
import ConfirmationDialog from "src/components/dialogs/confirmation.dialog";
import ScreenHeader from "src/components/screen-header";
import { SideBar } from "src/components/sidebar";
import ZGrid, { ZGridColDef } from "src/components/z-grid";
import { useContext, useEffect, useState } from "react";
import { LoadingContext } from "src/providers/loading.provider";
import CorService from "./cor.service";
import { CorDTO } from "./cor.contracts";
import UpsertModalCor from "./cor-modal.page";

export default function Cor() {
    const service = new CorService();
    const { setIsLoading } = useContext(LoadingContext);
    const [data, setData] = useState<CorDTO[]>([]);
    const [selected, setSelected] = useState<CorDTO>();

    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    const [upsertDialogOpen, setUpsertDialogOpen] = useState(false);
    const [shouldClearGridSelection, setShouldClearGridSelection] = useState(false);

    const columns: ZGridColDef[] = [
        { field: 'nome', headerName: 'Nome', width: 200 },        
    ];

    useEffect(() => {
        refresh();
        // eslint-disable-next-line
    }, []);

    const getAll = async () => {
        try {
            await setIsLoading(true);

            const data = await service.getAll();
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

    const onRowDoubleClick = async (e: CorDTO) => {
        const localCurrent = data.find(c => c.id === e.id);
        await setSelected(localCurrent);
        await setUpsertDialogOpen(true);
    }

    const onNewClick = async () => {
        await setSelected(undefined);
        await setUpsertDialogOpen(true);
        await setShouldClearGridSelection(!shouldClearGridSelection);
    }

    const onExcludeClick = async () => {
        if (!selected) return;

        await setConfirmationDialogOpen(true);
    }

    const onConfirmExclusion = async () => {
        if (!selected) return;

        await service.delete(selected.id);
        await toast.success('Registro excluído com sucesso');
        await refresh();
    }


    return <>
        <div className="page-container">
            <SideBar>
                <div className="page-content">
                    <ScreenHeader
                        title="Cor"
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
            title="Excluir usuário"
            onConfirm={onConfirmExclusion}
            onClose={() => setConfirmationDialogOpen(false)}
        />}
        {upsertDialogOpen && <UpsertModalCor
            cor={selected}
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
