import { toast } from "react-toastify";
import ButtonsLine from "src/components/buttons-line";
import ConfirmationDialog from "src/components/dialogs/confirmation.dialog";
import ScreenHeader from "src/components/screen-header";
import { SideBar } from "src/components/sidebar";
import ZGrid, { ZGridColDef } from "src/components/z-grid";
import { useContext, useEffect, useState } from "react";
import { LoadingContext } from "src/providers/loading.provider";
import { UsuarioDTO } from "./configuracoes.contracts";
import { ConfiguracaoService } from "./configuracoes.service";
import UpsertModalUsuario from "./config-usuario-modal.page";
import { getAllRoutes } from "src/redux-ts";
import { useAppSelector } from "src/redux-ts/hooks";


export default function CadastroUsuario() {
    const configuracaoService = new ConfiguracaoService();
    const { setIsLoading } = useContext(LoadingContext);
    const [data, setData] = useState<UsuarioDTO[]>([]);
    const [selected, setSelected] = useState<UsuarioDTO>();

    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    const [upsertDialogOpen, setUpsertDialogOpen] = useState(false);
    const [shouldClearGridSelection, setShouldClearGridSelection] = useState(false);
    const all_routes_components = useAppSelector(getAllRoutes);

    const columns: ZGridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'login', headerName: 'Login', width: 200 },
        { field: 'is_admin', headerName: 'É Administrador?', width: 130,
            valueFormatter: (value: boolean) => {
                return value ? '✅ Sim' : '❌ Não';
            }
         },
        {
            field: 'allowed_routes',
            headerName: 'Permissões',
            width: 400,
            valueFormatter: (params: string[]) => {
                if (!params) return '';
    
                const routes_components = all_routes_components
                .filter(component => params.includes(component.route));
    
                return routes_components.map(route => route.label).join(', ');
            }
        }
    ];

    useEffect(() => {
        refresh();
        // eslint-disable-next-line
    }, []);

    const getAll = async () => {
        try {
            await setIsLoading(true);

            const data = await configuracaoService.getAll();
            await setData(data.map(d => ({ ...d, is_admin: d.isadmin, allowed_routes: d.allowed_routes.split(',') })));

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

    const onRowDoubleClick = async (e: UsuarioDTO) => {
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
                            excludeEnabled={!!selected}
                            editEnabled={!!selected}
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
