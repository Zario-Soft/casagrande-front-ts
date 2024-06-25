import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, FormControl, InputLabel, Select } from "@mui/material";
import { NormalButton, WarningButton } from "src/components/buttons";
import { PaperComponent } from "src/components/dialogs";
import { useState } from "react";
import { toast } from "react-toastify";
import { FormasPagamento, VendaDTO } from "./vendas.contracts";
import VendasService from "./vendas.service";
import OrcamentoLookup from "../orcamentos/orcamento-lookup.component";
import moment from "moment";

export interface UpsertModalProductProps {
    current?: VendaDTO,
    onClose: (message?: string) => void
}

export default function UpsertModalVendas(props: UpsertModalProductProps) {
    const isNew = !props.current || !props.current?.id;
    const produtosService = new VendasService();

    const [current, setCurrent] = useState(props.current ?? { meiopagamento: 0, desconto: 0 } as VendaDTO);

    const onSave = async () => {
        try {
            if (!await isSavingValid()) return;

            if (isNew) {

                await produtosService.new(current);

                await props.onClose("Registro criado com sucesso");
            }
            else {
                await produtosService.edit(current);

                await props.onClose("Registro alterado com sucesso");
            }

        } catch (error: any) {
            toast.error(error);
        }
        finally {
        }
    }

    const isValidDataLimiteEntrega = () => moment(current.datalimiteentrega) >= moment(moment().format('yyyy-MM-DD'));

    const isSavingValid = async (): Promise<boolean> => {
        const validDate = current.id || isValidDataLimiteEntrega();

        const valid = (current.orcamentoid &&
            current.percpagamentoinicial !== undefined && current.percpagamentoinicial >= 0 && current.percpagamentoinicial <= 100 &&
            current.meiopagamento !== undefined) && validDate;

        if (!valid) {
            await toast.error('Preencha os campos obrigatórios');
            return false;
        }

        return true;
    }

    return <>
        <Dialog
            open
            maxWidth="lg"
            fullWidth
            aria-labelledby="draggable-dialog-title"
            PaperComponent={PaperComponent}
        >
            <DialogTitle id="draggable-dialog-title" style={{ cursor: 'move' }}>{!isNew ? `Editando Venda '${current.id}'` : "Nova Venda"}
            </DialogTitle>
            <DialogContent>
                <div className='flex-container'>
                    <OrcamentoLookup
                        sx={{
                            minWidth: '94%',
                            marginBottom: 5
                        }}
                        onChange={async (c) => {
                            const local = { ...current, orcamentoid: c?.id ?? 0 };
                            console.log(local)
                            await setCurrent(local);
                        }}
                        selectedId={current?.orcamentoid}
                    />

                    <div className='inner-flex-container' style={{ gap: '10px' }}>
                        <TextField
                            className='txt-box txt-box-small'
                            id="percpagamentoinicial"
                            label="% Pagamento Inicial"
                            variant="outlined"
                            type="number"
                            value={current.percpagamentoinicial}
                            onChange={(e) => setCurrent({ ...current, percpagamentoinicial: parseFloat(e.target.value) })}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            error={!current.percpagamentoinicial || current.percpagamentoinicial < 0 || current.percpagamentoinicial > 100}
                            helperText={!current.percpagamentoinicial ? 'Campo obrigatório' : (current.percpagamentoinicial >= 0 && current.percpagamentoinicial <= 100 ? '' : 'Porcentagem inválida')}
                        />

                        <TextField
                            className='txt-box txt-box-medium'
                            id="datalimiteentrega"
                            label="Data Limite Entrega"
                            variant="outlined"
                            type="date"
                            error={!current.id && !isValidDataLimiteEntrega()}
                            helperText={!current.datalimiteentrega ? 'Campo obrigatório' : (!current.id && !isValidDataLimiteEntrega() ? 'Insira uma data posterior à atual' : '')}
                            value={current.datalimiteentrega}
                            onChange={(e) => setCurrent({ ...current, datalimiteentrega: e.target.value })}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />

                        <TextField
                            className='txt-box txt-box-medium'
                            id="desconto"
                            label="Desconto/Taxa de teste (R$)"
                            variant="outlined"
                            type="number"
                            value={current.desconto}
                            onChange={(e) => setCurrent({ ...current, desconto: parseFloat(e.target.value) })}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                    </div>

                    <div className='inner-flex-container'>
                        <FormControl variant="outlined" style={{ minWidth: 180 }}>
                            <InputLabel
                                htmlFor="meiopagamento-id"
                                id="meiopagamento-label"
                                shrink>Meio de Pagamento</InputLabel>
                            <Select
                                native
                                label="Meio de Pagamento"
                                fullWidth
                                value={current.meiopagamento}
                                onChange={async (e) => await setCurrent({ ...current, meiopagamento: parseInt(e.target.value.toString()) })}
                                inputProps={{
                                    name: 'meiopagamento',
                                    id: 'meiopagamento-id'
                                }}
                            >
                                {FormasPagamento.map((value: string, index: number) => <option value={index} key={index}>{value}</option>)}
                            </Select>
                        </FormControl>
                    </div>
                </div>
            </DialogContent>
            <DialogActions>
                <NormalButton onClick={onSave} color="primary">
                    Salvar
                </NormalButton>
                <WarningButton onClick={() => props.onClose()} color="secondary">
                    Cancelar
                </WarningButton>
            </DialogActions>
        </Dialog>
    </>
}