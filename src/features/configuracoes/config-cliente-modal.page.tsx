import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Checkbox, CircularProgress, FormControl, FormControlLabel, Input, InputLabel } from "@mui/material";
import { NormalButton, WarningButton } from "src/components/buttons";
import { PaperComponent } from "src/components/dialogs";
import { UsuarioDTO } from "./configuracoes.contracts"
import { useState } from "react";
import { toast } from "react-toastify";
import ConfiguracaoService from "./configuracoes.service";

export interface UpsertModalUsuarioProps {
    usuario?: UsuarioDTO,
    onClose: (message?: string) => void
}

export default function UpsertModalUsuario(props: UpsertModalUsuarioProps) {
    const isNew = !props.usuario || !props.usuario?.id;
    const configuracaoService = new ConfiguracaoService();

    const [current, setCurrent] = useState(props.usuario ?? {} as UsuarioDTO);

    const onSave = async () => {
        try {
            if (!isSavingValid()) return;

            if (isNew) {

                await configuracaoService.new(current);

                props.onClose("Registro criado com sucesso");
            }
            else {
                await configuracaoService.edit(current);

                props.onClose("Registro alterado com sucesso");
            }

        } catch (error: any) {
            toast.error(error);
        }
        finally {
        }
    }

    const isSavingValid = (): boolean => {
        if (!current.login || current.login === '') {
            toast.error('Preencha o login do usuário');
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
                {isNew ? 'Novo Usuário' : `Editando Usuário '${current!.login}'`}
            </DialogTitle>
            <DialogContent>
                <div className='flex-container'>
                    <TextField
                        className='txt-box txt-box-medium'
                        id="login"
                        label="Login"
                        variant="outlined"
                        value={current.login}
                        onChange={(e) => setCurrent({ ...current, login: e.target.value })}
                        error={!current.login}
                        helperText={!current.login ? 'Campo obrigatório' : ''}
                    />

                    <TextField
                        className='txt-box txt-box-medium'
                        id="password"
                        label="Senha"
                        type="password"
                        variant="outlined"
                        value={current.password}
                        onChange={(e) => setCurrent({ ...current, password: e.target.value })}
                    />

                    <TextField
                        className='txt-box txt-box-medium'
                        id="confirmPassword"
                        label="Confirmar Senha"
                        type="password"
                        variant="outlined"
                        value={current.confirmPassword}
                        onChange={(e) => setCurrent({ ...current, confirmPassword: e.target.value })}
                    />

                    <div className='inner-flex-container'>

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