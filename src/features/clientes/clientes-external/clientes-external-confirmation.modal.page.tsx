import { Dialog, DialogTitle, DialogContent, DialogActions, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, styled, tableCellClasses } from "@mui/material";
import { NormalButton, WarningButton } from "src/components/buttons";
import { PaperComponent } from "src/components/dialogs";
import { ClienteExternalResponse } from "../clientes.contracts";
import { useMemo, useState } from "react";
import { Line } from "src/components/line/line.component";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

export interface ClienteExternalConfirmationProps {
    current?: ClienteExternalResponse,
    onConfirm: () => void,
    onClose: () => void,
}

interface RowValue {
    name: string,
    value?: string
}

export default function ClienteExternalConfirmation(props: ClienteExternalConfirmationProps) {
    const [current, setCurrent] = useState(props.current);

    const [rows, setRows] = useState<RowValue[]>([]);
    const [invoiceRows, setInvoiceRows] = useState<RowValue[]>();

    useMemo(() => {
        const calculateRows = () => {
            let localRows: RowValue[] = [
                { name: 'Nome', value: current?.nome },
                { name: 'Nome do destinatário / Nome do responsável pelo pedido', value: current?.responsavel },
                { name: 'E-mail', value: current?.email },
                { name: current?.pessoafisica === 1 ? 'CPF' : 'CNPJ', value: current?.cpfcnpj },
                { name: 'Telefone', value: current?.telefone },
                { name: 'Celular', value: current?.celular },
                { name: 'CEP', value: current?.cep },
                { name: 'Endereço', value: current?.endereco },
                { name: 'Número', value: current?.numero },
                { name: 'Complemento', value: current?.complemento },
                { name: 'Bairro', value: current?.bairro },
                { name: 'Cidade', value: current?.cidade },
                { name: 'Estado', value: current?.estado },
                { name: 'Ponto de referência / observações', value: current?.observacao },
            ]

            setRows(localRows);

            if (current?.issamedataforinvoice === false) {
                let localRows: RowValue[] = [];

                if (current?.clienteinvoicedata?.nome)
                    localRows = localRows.concat([{ name: 'Nome', value: current?.clienteinvoicedata?.nome }]);
                if (current?.clienteinvoicedata?.email)
                    localRows = localRows.concat([{ name: 'E-mail', value: current?.clienteinvoicedata?.email }]);
                if (current?.clienteinvoicedata?.cpfcnpj)
                    localRows = localRows.concat([{ name: current?.clienteinvoicedata?.pessoafisica === 1 ? '\nCPF' : '\nCNPJ', value: current?.clienteinvoicedata?.cpfcnpj },]);
                if (current?.clienteinvoicedata?.telefone)
                    localRows = localRows.concat([{ name: 'Telefone', value: current?.clienteinvoicedata?.telefone },]);
                if (current?.clienteinvoicedata?.celular)
                    localRows = localRows.concat([{ name: 'Celular', value: current?.clienteinvoicedata?.celular },]);
                if (current?.clienteinvoicedata?.cep)
                    localRows = localRows.concat([{ name: 'CEP', value: current?.clienteinvoicedata?.cep },]);
                if (current?.clienteinvoicedata?.endereco)
                    localRows = localRows.concat([{ name: 'Endereço', value: current?.clienteinvoicedata?.endereco },]);
                if (current?.clienteinvoicedata?.numero)
                    localRows = localRows.concat([{ name: 'Número', value: current?.clienteinvoicedata?.numero },]);
                if (current?.clienteinvoicedata?.complemento)
                    localRows = localRows.concat([{ name: 'Complemento', value: current?.clienteinvoicedata?.complemento },]);
                if (current?.clienteinvoicedata?.bairro)
                    localRows = localRows.concat([{ name: 'Bairro', value: current?.clienteinvoicedata?.bairro },]);
                if (current?.clienteinvoicedata?.cidade)
                    localRows = localRows.concat([{ name: 'Cidade', value: current?.clienteinvoicedata?.cidade },]);
                if (current?.clienteinvoicedata?.estado)
                    localRows = localRows.concat([{ name: 'Estado', value: current?.clienteinvoicedata?.estado },]);
                if (current?.clienteinvoicedata?.observacao)
                    localRows = localRows.concat([{ name: 'Ponto de referência / observações', value: current?.clienteinvoicedata?.observacao },]);

                setInvoiceRows(localRows);
            }
        }

        setCurrent(props.current);
        calculateRows();
    }, [current, props]);

    return <>
        {current && <Dialog
            open
            maxWidth="md"
            fullWidth
            aria-labelledby="draggable-dialog-title"
            PaperComponent={PaperComponent}
        >
            <DialogTitle id="draggable-dialog-title" style={{ cursor: 'move' }}>
                {'Confirme os dados'}
            </DialogTitle>
            <DialogContent>
                <div className='flex-container'>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell>Campo</StyledTableCell>
                                    <StyledTableCell align="right">Valor</StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow
                                        key={row.name}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {row.name}
                                        </TableCell>
                                        <TableCell align="right">{row.value}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* INVOICE */}
                    {invoiceRows && <div className='inner-flex-container' style={{
                        flexDirection: 'column',
                        marginTop: '10px'
                    }}>
                        <Line />
                        <h3>Dados para Nota Fiscal</h3>
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <StyledTableCell>Campo</StyledTableCell>
                                        <StyledTableCell align="right">Valor</StyledTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {invoiceRows.map((row) => (
                                        <TableRow
                                            key={row.name}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell component="th" scope="row">
                                                {row.name}
                                            </TableCell>
                                            <TableCell align="right">{row.value}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>}
                </div>
            </DialogContent>
            <DialogActions>
                <NormalButton onClick={() => props.onConfirm()} color="primary">
                    Confirmar
                </NormalButton>
                <WarningButton onClick={() => props.onClose()} color="secondary">
                    Cancelar
                </WarningButton>
            </DialogActions>
        </Dialog>}
    </>
}