import { LabelDisplayedRowsArgs } from "@mui/material";
import { DataGrid, GridColDef, GridColumnVisibilityModel, GridRowIdGetter, GridRowSelectionModel, GridRowsProp } from "@mui/x-data-grid";
import { useEffect, useState } from "react";

export type ZGridColDef = GridColDef & {
    hide?: boolean
}

interface ZGridProps {
    columns: ZGridColDef[],
    rows: GridRowsProp,
    shouldClearSelection?: boolean,
    onRowDoubleClick?: (e: any) => void,
    onRowClick?: (e: any) => void,
    getRowId?: GridRowIdGetter<any> | undefined,
}

export default function ZGrid(props: ZGridProps) {
    const columns = props.columns as GridColDef[];
    const [gridRowSelectionModel, setGridRowSelectionModel] = useState<GridRowSelectionModel>([]);

    useEffect(() => setGridRowSelectionModel([]), [props.shouldClearSelection]);

    const hideColumns: GridColumnVisibilityModel = props.columns.filter(f => f.hide)
        .map(m => ({ [m.field]: false }))
        .reduce((p, c) => p = { ...p, ...c }, {});

    return <DataGrid
        getRowId={props.getRowId}
        rows={props.rows}
        columns={columns}
        columnVisibilityModel={hideColumns}
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
    />
}