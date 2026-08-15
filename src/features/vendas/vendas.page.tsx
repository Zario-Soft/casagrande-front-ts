import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import ButtonsLine from "src/components/buttons-line";
import ScreenHeader from "src/components/screen-header";
import { SideBar } from "src/components/sidebar";
import ZGrid, { ZGridColDef } from "src/components/z-grid";
import { LoadingContext } from "src/providers/loading.provider";
import ConfirmationDialog from "src/components/dialogs/confirmation.dialog";
import moment from 'moment';
import VendasService from "./vendas.service";
import { FormasPagamento, VendaDTO, VendaPaging } from "./vendas.contracts";
import UpsertModalVendas from "./vendas-modal.page";
import { Box, FormControl, Select } from "@mui/material";
import { GridFilterItem, GridColDef } from "@mui/x-data-grid";

function MeioPagamentoInputValue(props: any) {
    const { item, applyValue } = props;
    const [current, setCurrent] = useState(item.value);

    const handleFilterChange = async (newValue: any) => {
        setCurrent(newValue)

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
                        name: 'meiopagamento',
                        id: 'meiopagamento-venda-id'
                    }}
                >
                    {FormasPagamento.map((value: string) => <option value={value} key={value}>{value}</option>)}
                </Select>
            </FormControl>
        </Box>
    );
}

const columns: ZGridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'vendaclientenome', headerName: 'Cliente', width: 250 },
    { field: 'percpagamentoinicial', headerName: 'Pagamento Inicial (R$)', width: 220, valueFormatter: (params: string) => parseFloat(params).toFixed(2) },
    { field: 'datalimiteentrega', headerName: 'Data limite da entrega', width: 210, valueFormatter: (params: string) => moment(params).format('DD/MM/yyyy') },
    {
        field: 'meiopagamentodescricao',
        headerName: 'Meio de Pagamento',
        width: 180,
        filterOperators: [
            {
                label: '=',
                value: 'Dinheiro',
                getApplyFilterFn: (filterItem: GridFilterItem, _: GridColDef<any, any, any>) => {
                    return (value: string) => {
                        return !filterItem.value || value.toUpperCase() === filterItem.value.toUpperCase();
                    };
                },

                InputComponent: MeioPagamentoInputValue,
            }
        ],
    },
    { field: 'desconto', headerName: 'Desconto/Taxa de teste (R$)', width: 250, valueFormatter: (params: string) => parseFloat(params).toFixed(2) },
]

export default function Vendas() {
    const vendasService = new VendasService();
    const { setIsLoading } = useContext(LoadingContext);
    const [data, setData] = useState<VendaDTO[]>([]);
    const [selected, setSelected] = useState<VendaDTO>();
    const [filter, setFilter] = useState(new VendaPaging());

    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    const [upsertDialogOpen, setUpsertDialogOpen] = useState(false);
    const [shouldClearGridSelection, setShouldClearGridSelection] = useState(false);

    useEffect(() => {
        refresh();
        // eslint-disable-next-line
    }, []);

    const getAll = async (filter: VendaPaging) => {
        try {
            setIsLoading(true);

            const data = await vendasService.getAll(filter);
            setData(data);

        } catch {
            toast.error('Não foi possivel carregar os dados. Verifique a internet.');
        }
        finally {
            setIsLoading(false);
        }
    }

    const refresh = async (paramFilter?: VendaPaging) => {
        await getAll(paramFilter ?? filter);
        setSelected(undefined);
    }

    const onExcludeClick = async () => {
        if (!selected) return;

        setConfirmationDialogOpen(true);
    }

    const onNewClick = async () => {
        setSelected(undefined);
        setUpsertDialogOpen(true);
        setShouldClearGridSelection(!shouldClearGridSelection);
    }

    const onRowDoubleClick = async (e: any) => {
        const localCurrent = data.find(c => c.id === (e as VendaDTO).id);
        setSelected(localCurrent);
        setUpsertDialogOpen(true);
    }

    const onFilter = async (localFilter: VendaPaging | undefined) => {
        const newFilter = new VendaPaging(localFilter?.page ?? 0, localFilter?.filter);

        setFilter(newFilter);

        refresh(newFilter);
    }

    const onConfirmExclusion = async () => {
        if (!selected) return;

        await vendasService.delete(selected.id);

        await refresh();

        toast.success("Registro excluído com sucesso");
    }

    return <>
        <div className="page-container">
            <SideBar>
                <div className="page-content">
                    <ScreenHeader
                        title="Vendas"
                        onUpdateClick={() => refresh()}
                    />
                    {data && <>
                        <ZGrid
                            shouldClearSelection={shouldClearGridSelection}
                            rows={data}
                            columns={columns}
                            onRowDoubleClick={(e: any) => onRowDoubleClick(e.row)}
                            onRowClick={(e: any) => setSelected(e.row)}
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
            title="Excluir venda"
            onConfirm={onConfirmExclusion}
            onClose={() => setConfirmationDialogOpen(false)}
        />}
        {upsertDialogOpen && <UpsertModalVendas
            current={selected}
            onClose={async (message: string | undefined) => {
                if (message) {
                    toast.success(message);
                    await refresh();
                }

                setUpsertDialogOpen(false);
            }}
        />}
    </>
}