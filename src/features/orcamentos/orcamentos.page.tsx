import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import ButtonsLine from "src/components/buttons-line";
import ScreenHeader from "src/components/screen-header";
import { SideBar } from "src/components/sidebar";
import ZGrid, { ZGridColDef } from "src/components/z-grid";
import { LoadingContext } from "src/providers/loading.provider";
import { OrcamentosService } from "./orcamentos.service";
import { OrcamentoDTO, OrcamentoGrid, OrcamentoPaging, StatusOrcamentoOptions, StatusOrcamento } from "./orcamentos.contracts";
import ConfirmationDialog from "src/components/dialogs/confirmation.dialog";
import UpsertModalClient from "./orcamentos-modal.page";
import { Box, FormControl, Select } from "@mui/material";
import { GridFilterItem, GridColDef } from "@mui/x-data-grid";

function StatusInputValue(props: any) {
    const { item, applyValue } = props;
    const [current, setCurrent] = useState(item.value);

    const handleFilterChange = async (newValue: any) => {
        await setCurrent(newValue)

        await applyValue({ ...item, value: newValue });
    };

    return (
        <Box
            sx={{
                display: 'inline-flex',
                flexDirection: 'row',
                alignItems: 'center',
                height: 48,
                pl: '20px',
            }}
        >
            <FormControl variant="outlined">
                <Select
                    native
                    fullWidth
                    value={current}
                    onChange={async (e) => await handleFilterChange(e.target.value)}
                    inputProps={{
                        name: 'status',
                        id: 'status-orcamento-id'
                    }}
                >
                    {StatusOrcamentoOptions.filter(o => o.visible).map((value: StatusOrcamento) => <option value={value.status} key={value.index}>{value.status}</option>)}
                </Select>
            </FormControl>
        </Box>
    );
}

const columns: ZGridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70, hide: true },
    { field: 'clientenome', headerName: 'Cliente', width: 300 },
    { field: 'clienteresponsavel', headerName: 'Responsável', width: 200 },
    { field: 'dataorcamento', headerName: 'Data do Orçamento', width: 180 },
    { field: 'observacao', headerName: 'Observação', width: 270 },
    {
        field: 'statusdescricao',
        headerName: 'Status',
        width: 240,
        filterOperators: [
            {
                label: '=',
                value: 'Aprovado',
                getApplyFilterFn: (filterItem: GridFilterItem, _: GridColDef<any, any, any>) => {
                    return (value: string) => {
                        return !filterItem.value || value.toUpperCase() === filterItem.value.toUpperCase();
                    };
                },

                InputComponent: StatusInputValue,
            }
        ],
        valueFormatter: (value: string) => {           
            switch (value) {
                case 'Aprovado':
                    return `✅ ${value}`;
                case 'Reprovado':
                    return `❌ ${value}`;
                case 'Aprovado com ressalva':
                case 'Aprovado com ressalva feito':
                    return `⚠️ ${value}`;
                default:
                    return value;
            }
        }
    },
    { 
        field: 'frete', 
        headerName: 'Frete',
        width: 90, 
        valueFormatter: (value: number) => value.toFixed(2) 
    },
    { 
        field: 'valortotal', 
        headerName: 'Valor Total',
        width: 120,
        valueFormatter: (value?: number) => (value ?? 0).toFixed(2) 
    }
];

export default function Orcamentos() {
    const orcamentosService = new OrcamentosService();
    const { setIsLoading } = useContext(LoadingContext);
    const [data, setData] = useState<OrcamentoGrid[]>([]);
    const [selected, setSelected] = useState<OrcamentoGrid>();
    const [filter, setFilter] = useState(new OrcamentoPaging());

    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    const [upsertDialogOpen, setUpsertDialogOpen] = useState(false);
    const [shouldClearGridSelection, setShouldClearGridSelection] = useState(false);

    useEffect(() => {
        refresh();
        // eslint-disable-next-line
    }, []);

    const getAll = async (filter: OrcamentoPaging) => {
        try {
            await setIsLoading(true);

            const data = await orcamentosService.getAll<OrcamentoGrid>(filter);
            await setData(data);

        } catch (e: any) {
            toast.error('Não foi possivel carregar os dados. Verifique a internet.');
            console.error(e);
        }
        finally {
            await setIsLoading(false);
        }
    }

    const refresh = async (paramFilter?: OrcamentoPaging) => {
        await getAll(paramFilter ?? filter);
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
        console.log(e);
        const localCurrent = data.find(c => c.id === (e as OrcamentoDTO).id);
        await setSelected(localCurrent);
        await setUpsertDialogOpen(true);
    }

    const onFilter = async (localFilter: OrcamentoPaging | undefined) => {
        const newFilter = new OrcamentoPaging(localFilter?.page ?? 0, localFilter?.filter);

        await setFilter(newFilter);

        await refresh(newFilter);
    }

    const onConfirmExclusion = async () => {
        if (!selected) return;

        await orcamentosService.delete(selected.id);

        await refresh();

        toast.success("Registro excluído com sucesso");
    }

    return <>
        <div className="page-container">
            <SideBar>
                <div className="page-content">
                    <ScreenHeader
                        title="Orçamentos"
                        onUpdateClick={() => refresh()}
                    />
                    {data && <>
                        <ZGrid
                            shouldClearSelection={shouldClearGridSelection}
                            rows={data}
                            columns={columns}
                            onRowDoubleClick={async (e: any) => await onRowDoubleClick(e.row)}
                            onRowClick={async (e: any) => await setSelected(e.row)}
                            onPagination={onFilter}
                            onFilterModelChange={onFilter}
                            useCustomFooter
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
            orcamento={selected}
            onClose={async (message: string | undefined) => {
                if (message) {
                    await refresh();
                    toast.success(message);
                }

                await setUpsertDialogOpen(false);
            }}
        />}
    </>
}