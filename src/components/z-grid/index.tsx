import { NavigateBefore, NavigateNext } from "@mui/icons-material";
import { IconButton, LabelDisplayedRowsArgs } from "@mui/material";
import { DataGrid, GridCallbackDetails, GridColDef, GridColumnVisibilityModel, GridFilterModel, GridRowIdGetter, GridRowSelectionModel, GridRowsProp } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { Paging } from "src/features/common/base-contracts";

export type ZGridColDef = GridColDef & {
    hide?: boolean
}

interface ZGridProps {
    height?: number;
    columns: ZGridColDef[],
    rows: GridRowsProp,
    shouldClearSelection?: boolean,
    useCustomFooter?: boolean,
    onRowDoubleClick?: (e: any) => void,
    onRowClick?: (e: any) => void,
    getRowId?: GridRowIdGetter<any> | undefined,
    onFilterModelChange?: (filter: Paging | undefined) => void
    onPagination?: (filter: Paging | undefined) => void
}

export default function ZGrid(props: ZGridProps) {
    const columns = props.columns as GridColDef[];
    const [gridRowSelectionModel, setGridRowSelectionModel] = useState<GridRowSelectionModel>([]);
    const [filter, setFilter] = useState<Paging>();

    useEffect(() => setGridRowSelectionModel([]), [props.shouldClearSelection]);

    const hideColumns: GridColumnVisibilityModel = props.columns.filter(f => f.hide)
        .map(m => ({ [m.field]: false }))
        .reduce((p, c) => p = { ...p, ...c }, {});

    const onFilterModelChange = async (model: GridFilterModel, _: GridCallbackDetails<'filter'>) => {
        let result: Paging | undefined;
        if (props.useCustomFooter) {
            const validFilters = model.items.filter(b => b.value !== undefined);
            if (validFilters.length) {
                const newPaging = new Paging(0,
                    {
                        column: validFilters[0].field,
                        comparer: validFilters[0].operator,
                        value: validFilters[0].value
                    })

                result = newPaging;
                await setFilter(newPaging);
            }
            else {
                result = undefined;
                await setFilter(undefined);
            }

            if (props.onFilterModelChange)
                await props.onFilterModelChange(result);
        }
    }

    const operations: Record<string, (_: number) => number> = {
        '+': (page: number) => page + 1,
        '-': (page: number) => page > 0 ? page - 1 : 0,
    }
    const onPageChange = async (op: string) => {
        const localPage = operations[op](filter?.page ?? 0);
        const newPaging = new Paging(localPage, filter?.filter);
        await setFilter(newPaging);

        if (props.onPagination)
            props.onPagination(newPaging);
    }

    return <>
        <div style={{ height: props.height ?? 400, width: '100%' }}>
            <DataGrid
                getRowId={props.getRowId}
                rows={props.rows}
                columns={columns}
                hideFooterSelectedRowCount
                style={{
                    maxHeight: '700px',
                    minHeight: '300px'
                }}
                rowSelection
                pageSizeOptions={[25]}
                initialState={{
                    pagination: {
                        paginationModel: {
                            pageSize: 25,
                        },
                    },
                    columns: {
                        columnVisibilityModel: hideColumns
                    }
                }}
                onRowDoubleClick={props.onRowDoubleClick}
                onRowClick={props.onRowClick}
                rowSelectionModel={gridRowSelectionModel}
                onRowSelectionModelChange={(e: GridRowSelectionModel) => setGridRowSelectionModel(e)}
                slotProps={{
                    pagination: {
                        labelRowsPerPage: 'Registros por página',
                        labelDisplayedRows: (paginationInfo: LabelDisplayedRowsArgs) => {
                            return `${paginationInfo.from}-${paginationInfo.to} de ${paginationInfo.count}`
                        }
                    },
                }}
                onFilterModelChange={onFilterModelChange}
                hideFooter={props.useCustomFooter ?? false}
            />
        </div>
        {
            props.useCustomFooter && <div style={{
                display: 'flex',
                justifyContent: 'flex-end'
            }}>
                <IconButton color="primary" aria-label="Página anterior" component="span" onClick={async () => await onPageChange('-')}>
                    <NavigateBefore />
                </IconButton>
                <IconButton color="primary" aria-label="Próxima página" component="span" onClick={async () => await onPageChange('+')}>
                    <NavigateNext />
                </IconButton>
            </div>
        }
    </>
}