import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Checkbox, FormControlLabel } from "@mui/material";
import { NormalButton, WarningButton } from "src/components/buttons";
import { PaperComponent } from "src/components/dialogs";
import { useState } from "react";
import { toast } from "react-toastify";
import ProdutosService from "./orcamentos.service";
import { OrcamentoDTO } from "./orcamentos.contracts";

export interface UpsertModalProductProps {
    produto?: OrcamentoDTO,
    onClose: (message?: string) => void
}

export default function UpsertModalProduct(props: UpsertModalProductProps) {
    const isNew = !props.produto || !props.produto?.id;
    const produtosService = new ProdutosService();

    const [current, setCurrent] = useState(props.produto ?? {} as OrcamentoDTO);

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

    const isSavingValid = async (): Promise<boolean> => {
        if (!current.clienteid) {
            await toast.error('Preencha o cliente');
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
            <DialogTitle id="draggable-dialog-title" style={{ cursor: 'move' }}>
                {isNew ? 'Novo Produto' : `Editando Produto '${current!.descricao}'`}
            </DialogTitle>
            <DialogContent>
                <div className='flex-container'>
                    <TextField
                        className='txt-box txt-box-medium'
                        id="descricao"
                        label="Descrição"
                        variant="outlined"
                        value={current.descricao}
                        onChange={(e) => setCurrent({ ...current, descricao: e.target.value })}
                        error={!current.descricao}
                        helperText={!current.descricao ? 'Campo obrigatório' : ''}
                    />

                    <TextField
                        className='txt-box txt-box-medium'
                        id="vl_unit"
                        type="number"
                        label="Valor Unitário"
                        variant="outlined"
                        value={current.valorunitario}
                        onChange={(e) => setCurrent({ ...current, valorunitario: e.target.value })}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        error={!current.valorunitario}
                        helperText={!current.valorunitario ? 'Campo obrigatório' : ''}
                    />

                    <div className='inner-flex-container'>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={current.isactive}
                                    onChange={(e) => setCurrent({ ...current, isactive: e.target.checked })}
                                    name="isActive"
                                    color="primary"
                                />
                            }
                            label="Ativo?"
                            style={{ marginTop: 15 }}
                        />
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