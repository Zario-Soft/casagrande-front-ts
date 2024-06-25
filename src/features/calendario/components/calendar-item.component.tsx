import { TableCell, TableRow, TableContainer, Paper, Table, TableHead, TableBody } from '@mui/material';
import { CalendarioDate } from '../calendario.contracts';
import { generalTheme } from "src/theme";

export interface CalendarioDateProps extends CalendarioDate {
    onDoubleClick: (e: any) => void
}

export default function CalendarItem(props: CalendarioDateProps) {
    return <div>
        <TableContainer component={Paper} style={{ overflowY: 'auto', height: 300 }}>
            <Table stickyHeader aria-label="customized table" sx={{
                minWidth: 90,
                maxHeight: 90
            }}>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{
                            backgroundColor: generalTheme.palette.primary.main,
                            color: 'white',
                            fontSize: 12
                        }}>
                            {props.titulo}
                            </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.itens && props.itens.map((row, k) => (
                        <TableRow key={k} sx={{
                            '&:nth-of-type(odd)': {
                                backgroundColor: '#dddddd',
                            }
                        }}>
                            <TableCell align="left" style={{ cursor: 'pointer', fontSize: 12 }} onDoubleClick={props.onDoubleClick}>
                                {`${row.vendaid} ${row.clientenome}`}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </div>
}