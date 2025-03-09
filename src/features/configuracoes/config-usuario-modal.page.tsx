import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { NormalButton, WarningButton } from "src/components/buttons";
import { PaperComponent } from "src/components/dialogs";
import { UsuarioDTO } from "./configuracoes.contracts"
import { useState } from "react";
import { toast } from "react-toastify";
import UserService from "./config-usuario.service";
import md5 from "md5";
import { useAppSelector } from "src/redux-ts/hooks";
import { getAllRoutes } from "src/redux-ts";
import { IsAdmin } from "src/infrastructure/helpers";
export interface UpsertModalUsuarioProps {
    usuario?: UsuarioDTO,
    onClose: (message?: string) => void
}

export default function UpsertModalUsuario(props: UpsertModalUsuarioProps) {
    const isNew = !props.usuario || !props.usuario?.id;
    const userService = new UserService();
    const all_routes_components = useAppSelector(getAllRoutes);
    const [current, setCurrent] = useState<UsuarioDTO>(props.usuario ?
        { ...props.usuario, allowed_routes: props.usuario.allowed_routes || [] }
        : {
            allowed_routes: [],
            id: 0,
            login: '',
            password: '',
            confirmPassword: '',
            is_admin: false
        });

    const onSave = async () => {
        try {
            if (!isSavingValid()) return;

            if (isNew) {

                await userService.new({ ...current, password: md5(current.password) });

                props.onClose("Registro criado com sucesso");
            }
            else {
                await userService.edit({ ...current, password: current.password ? md5(current.password) : '' });

                props.onClose("Registro alterado com sucesso");
            }

        } catch (error: any) {
            toast.error(error);
        }
        finally {
        }
    }

    const isSavingValid = (): boolean => {

        let valid = true;
        if (props.usuario) {
            valid = (!current.password && !current.confirmPassword) || (!!current.password && !!current.confirmPassword);
        }
        else {
            valid = !!current.login && !!current.password && !!current.confirmPassword;
        }

        if (!valid) {
            toast.error('Preencha os campos obrigatórios');
            return false;
        }

        if (current.password !== current.confirmPassword) {
            toast.error('As senhas não conferem');
            return false;
        }

        return true;

    }

    const handlePermissionChange = (e: any) => {
        const value = e.target.value;
        const isChecked = e.target.checked;

        if (value === "all") {
            setCurrent({ ...current, allowed_routes: isChecked ? all_routes_components.map(route => route.route) : [] });
            return;
        }

        let local_routes = current.allowed_routes;
        if (isChecked) {
            local_routes = [...local_routes, value];
        } else {
            local_routes = local_routes.filter(route => route !== value);
        }

        setCurrent({ ...current, allowed_routes: local_routes });
    }

    const form_field_controls = all_routes_components.map(component => {
        return <FormControlLabel key={component.route} control={<Checkbox onChange={handlePermissionChange} checked={current.allowed_routes.includes(component.route)} />} label={component.label} value={component.route} />
    })

    return <>
        <Dialog
            open
            maxWidth="md"
            fullWidth
            aria-labelledby="draggable-dialog-title"
            PaperComponent={PaperComponent}
        >
            <DialogTitle id="draggable-dialog-title" style={{ cursor: 'move' }}>
                {isNew ? 'Novo Usuário' : `Editando Usuário '${current!.login}'`}
            </DialogTitle>
            <DialogContent>
                <div className='flex-container'>
                    <div className='inner-flex-container'>
                        <TextField
                            className='txt-box txt-box-large'
                            id="login"
                            label="Login"
                            variant="outlined"
                            value={current.login}
                            onChange={(e) => setCurrent({ ...current, login: e.target.value })}
                            error={!current.login}
                            helperText={!current.login ? 'Campo obrigatório' : ''}
                        />
                    </div>

                    <div className='inner-flex-container'>
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
                    </div>

                    {IsAdmin() && <div className='inner-flex-container'>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={current.is_admin}
                                    onChange={(e) => setCurrent({ ...current, is_admin: e.target.checked })}
                                    name="is_admin"
                                    color="primary"
                                />
                            }
                            label="Administrador?"
                        />
                    </div>}
                    {!current.is_admin && <div className='inner-flex-container'>
                        <FormGroup aria-label="Permissões" style={{ marginTop: 10 }}>
                            <FormControlLabel control={<label></label>} label="Permissões de acesso" />
                            <FormControlLabel control={<Checkbox
                                indeterminate={current.allowed_routes.length < all_routes_components.length && current.allowed_routes.length > 0}
                                checked={current.allowed_routes.length === all_routes_components.length}
                                onChange={handlePermissionChange}
                                value="all"
                            />} label="Marcar / Desmarcar todos" />
                            {form_field_controls}
                        </FormGroup>

                    </div>}

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