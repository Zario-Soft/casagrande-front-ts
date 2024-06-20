import { Dialog, DialogTitle, DialogContent, TextField, DialogActions } from "@mui/material";
import { NormalButton, WarningButton } from "src/components/buttons";
import { PaperComponent } from "src/components/dialogs";
import { useState } from "react";
import { toast } from "react-toastify";
import CorService from "./cor.service";
import { CorDTO } from "./cor.contracts";

export interface UpsertModalCorProps {
    cor?: CorDTO,
    onClose: (message?: string) => void
}

export default function UpsertModalCor(props: UpsertModalCorProps) {
    const isNew = !props.cor || !props.cor?.id;
    const corService = new CorService();

    const [current, setCurrent] = useState(props.cor ?? {} as CorDTO);

    const onSave = async () => {
        try {
            if (!await isSavingValid()) return;

            if (isNew) {

                await corService.new(current);

                await props.onClose("Registro criado com sucesso");
            }
            else {
                await corService.edit(current);

                await props.onClose("Registro alterado com sucesso");
            }

        } catch (error: any) {
            toast.error(error);
        }
        finally {
        }
    }

    const isSavingValid = async (): Promise<boolean> => {
        if (!current.nome || current.nome === '') {
            await toast.error('Preencha o nome da cor');
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
                {isNew ? 'Nova Cor' : `Editando Cor '${current!.nome}'`}
            </DialogTitle>
            <DialogContent>
                <div className='flex-container'>
                    <TextField
                        className='txt-box txt-box-big'
                        id="nome"
                        label="Nome"
                        variant="outlined"
                        value={current.nome}
                        onChange={(e) => setCurrent({ ...current, nome: e.target.value })}
                        error={!current.nome}
                        helperText={!current.nome ? 'Campo obrigatório' : ''}
                    />
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