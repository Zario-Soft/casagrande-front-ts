import { toast } from "react-toastify";
import ButtonsLine from "src/components/buttons-line";
import ConfirmationDialog from "src/components/dialogs/confirmation.dialog";
import ScreenHeader from "src/components/screen-header";
import { SideBar } from "src/components/sidebar";
import ZGrid, { ZGridColDef } from "src/components/z-grid";
import UpsertModalClient from "../clientes/clientes-modal.page";
import { useContext, useEffect, useState } from "react";
import { LoadingContext } from "src/providers/loading.provider";
import { UsuarioDTO } from "./configuracoes.contracts";
import { ConfiguracaoService } from "./configuracoes.service";
import UpsertModalUsuario from "./config-cliente-modal.page";
const columns: ZGridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'login', headerName: 'Login', width: 200 },
    { field: 'isadmin', headerName: 'É Admin?', width: 130 },
    { field: 'permissions', headerName: '', width: 200, hide: true }
];

export default function CadastroUsuario() {
    const configuracaoService = new ConfiguracaoService();
    const { setIsLoading } = useContext(LoadingContext);
    const [data, setData] = useState<UsuarioDTO[]>([]);
    const [selected, setSelected] = useState<UsuarioDTO>();

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

            const data = await configuracaoService.getAll();
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

    const onRowDoubleClick = async (e: any) => {
        const localCurrent = data.find(c => c.id === (e as UsuarioDTO).id);
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

        await configuracaoService.delete(selected.id);
    }


    return <>
        <div className="page-container">
            <SideBar>
                <div className="page-content">
                    <ScreenHeader
                        title="Controle de Acesso"
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
        {upsertDialogOpen && <UpsertModalUsuario
            usuario={selected}
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
