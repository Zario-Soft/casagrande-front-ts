import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Checkbox, CircularProgress, FormControl, FormControlLabel, Input, InputLabel, Select } from "@mui/material";
import { NormalButton, WarningButton } from "src/components/buttons";
import { PaperComponent } from "src/components/dialogs";
import { ClienteDTO } from "./clientes.contracts"
import { useState } from "react";
import { toast } from "react-toastify";
import ClientesService from "./clientes.service";
import { CPFMaskCustom, CNPJMaskCustom, TelMaskCustom, CelMaskCustom, CEPMaskCustom } from "src/components/masks";
import { fillState } from "./clientes-common";

export interface UpsertModalClientProps {
    cliente?: ClienteDTO,
    onClose: (message?: string) => void
}

export default function UpsertModalClient(props: UpsertModalClientProps) {
    const isNew = !props.cliente || !props.cliente?.id;
    const clientesService = new ClientesService();

    const [current, setCurrent] = useState(props.cliente ?? {} as ClienteDTO);
    const [isLoadingCEP, setIsLoadingCEP] = useState(false);

    const preencheCEP = async (e: any) => {
        const cep = e.target.value.replace("-", "");

        if (cep.trim() === "") return;

        const url = `https://viacep.com.br/ws/${cep}/json/`;
        await setIsLoadingCEP(true);

        fetch(url)
            .then(r => r.json())
            .then(async r => {
                await setIsLoadingCEP(false);
                await setCurrent(
                    {
                        ...current,
                        bairro: r.bairro,
                        cidade: r.localidade,
                        endereco: r.logradouro,
                        estado: r.uf
                    })
            })
    }

    const onSave = async () => {
        try {
            if (!await isSavingValid()) return;

            if (isNew) {

                await clientesService.new(current);

                await props.onClose("Registro criado com sucesso");
            }
            else {
                await clientesService.edit(current);

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
            await toast.error('Preencha o nome do cliente');
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
                {isNew ? 'Novo Cliente' : `Editando Cliente '${current!.nome}'`}
            </DialogTitle>
            <DialogContent>
                <div className='flex-container'>
                    <TextField
                        className='txt-box txt-box-medium'
                        id="nome"
                        label="Nome"
                        variant="outlined"
                        value={current.nome}
                        onChange={(e) => setCurrent({ ...current, nome: e.target.value })}
                        error={!current.nome}
                        helperText={!current.nome ? 'Campo obrigatório' : ''}
                    />

                    <TextField
                        className='txt-box txt-box-medium'
                        id="resp"
                        label="Responsável"
                        variant="outlined"
                        value={current.responsavel}
                        onChange={(e) => setCurrent({ ...current, responsavel: e.target.value })}
                    />

                    <div className='inner-flex-container'>
                        <TextField
                            className='txt-box txt-box-medium'
                            id="email-cliente"
                            label="E-mail"
                            type={'email'}
                            variant="outlined"
                            value={current.email}
                            onChange={(e) => setCurrent({ ...current, email: e.target.value })}
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={current.pessoafisica}
                                    onChange={(e) => setCurrent({ ...current, pessoafisica: e.target.checked })}
                                    name="cpjCNPJ"
                                    color="primary"
                                />
                            }
                            label="Pessoa Fisica?"
                        />

                        <div>
                            <FormControl>
                                <InputLabel
                                    htmlFor="formatted-text-mask-input"
                                    shrink
                                >
                                    CPF/CNPJ
                                </InputLabel>
                                {current.pessoafisica && <Input
                                    value={current.cpfcnpj}
                                    onChange={(e) => setCurrent({ ...current, cpfcnpj: e.target.value })}
                                    name="cpfcnpj"
                                    id="cpfcnpj-input"
                                    inputComponent={CPFMaskCustom}
                                />}
                                {!current.pessoafisica && <Input
                                    value={current.cpfcnpj}
                                    onChange={(e) => setCurrent({ ...current, cpfcnpj: e.target.value })}
                                    name="cpfcnpj"
                                    id="cpfcnpj-input"
                                    inputComponent={CNPJMaskCustom}
                                />}
                            </FormControl>
                        </div>
                    </div>
                    <div className='inner-flex-container'>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={current?.isparceiro ?? false}
                                    onChange={(e) => setCurrent({ ...current, isparceiro: e.target.checked })}
                                    name="cpjCNPJ"
                                    color="primary"
                                />
                            }
                            label="Parceiro?"
                            style={{ marginLeft: -20 }}

                        />
                        <TextField
                            id="percParceria"
                            label="%"
                            variant="outlined"
                            type="number"
                            disabled={!current.isparceiro}
                            value={current.percparceiro}
                            onChange={(e) => setCurrent({ ...current, percparceiro: current.isparceiro ? parseInt(e.target.value) : undefined })}
                            InputLabelProps={{ shrink: true }}
                        />

                        <FormControl>
                            <InputLabel htmlFor="formatted-text-mask-input" shrink>Telefone</InputLabel>
                            <Input
                                value={current.telefone}
                                onChange={(e) => setCurrent({ ...current, telefone: e.target.value })}
                                name="telefone"
                                id="telefone-input"
                                inputComponent={TelMaskCustom}
                                onBlur={fillState}
                            />
                        </FormControl>

                        <FormControl>
                            <InputLabel htmlFor="formatted-text-mask-input" shrink>Celular</InputLabel>
                            <Input
                                value={current.celular}
                                onChange={(e) => setCurrent({ ...current, celular: e.target.value })}
                                name="celular"
                                id="celular-input"
                                inputComponent={CelMaskCustom}
                                onBlur={fillState}
                            />
                        </FormControl>
                    </div>

                    <div className='inner-flex-container'>
                        <FormControl>
                            <InputLabel htmlFor="formatted-text-mask-input" shrink>CEP</InputLabel>
                            <Input
                                className='txt-box'
                                value={current.cep}
                                onChange={(e) => setCurrent({ ...current, cep: e.target.value })}
                                name="cep"
                                id="cep-input"
                                inputComponent={CEPMaskCustom}
                                onBlur={preencheCEP}
                            />
                        </FormControl>
                        {isLoadingCEP && <CircularProgress
                            variant="indeterminate"
                            disableShrink
                            style={{
                                color: '#1a90ff',
                                animationDuration: '550ms',
                                left: 0
                            }}
                            size={40}
                            thickness={4}
                            {...props}
                        />}
                    </div>

                    <div className='inner-flex-container'>
                        <TextField
                            className='txt-box-large'
                            id="endereco"
                            label="Endereço"
                            variant="outlined"
                            value={current.endereco}
                            onChange={(e) => setCurrent({ ...current, endereco: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                        />

                        <TextField
                            id="enderecoNr"
                            label="Nº"
                            variant="outlined"
                            type="number"
                            value={current.numero}
                            onChange={(e) => setCurrent({ ...current, numero: e.target.value })}

                            InputLabelProps={{ shrink: true }} />
                    </div>
                    <div className='inner-flex-container'>

                        <TextField
                            className='txt-box-small'
                            id="enderecoCompl"
                            label="Complemento"
                            variant="outlined"
                            value={current.complemento}
                            onChange={(e) => setCurrent({ ...current, complemento: e.target.value })}

                            InputLabelProps={{ shrink: true }} />

                        <TextField
                            className='txt-box-large'
                            id="enderecoBairro"
                            label="Bairro"
                            variant="outlined"
                            value={current.bairro}
                            onChange={(e) => setCurrent({ ...current, bairro: e.target.value })}

                            InputLabelProps={{ shrink: true }} />
                    </div>

                    <div className='inner-flex-container'>
                        <TextField
                            className='txt-box-large'
                            id="enderecoCidade"
                            label="Cidade"
                            variant="outlined"
                            value={current.cidade}
                            onChange={(e) => setCurrent({ ...current, cidade: e.target.value })}

                            InputLabelProps={{ shrink: true }} />

                        <FormControl variant="outlined" sx={{
                            minWidth: 120
                        }}>
                            <InputLabel shrink>
                                Estado
                            </InputLabel>
                            <Select
                                native
                                label="Estado"
                                value={current.estado}
                                onChange={async (e) => await setCurrent({ ...current, estado: e.target.value })}
                                inputProps={{
                                    name: 'estado',
                                    id: 'enderecoEstado-id',
                                    shrink: true
                                }}
                            >
                                <option aria-label="None" value="" />
                                <option value={'AC'}>AC</option>
                                <option value={'AL'}>AL</option>
                                <option value={'AP'}>AP</option>
                                <option value={'AM'}>AM</option>
                                <option value={'BA'}>BA</option>
                                <option value={'CE'}>CE</option>
                                <option value={'DF'}>DF</option>
                                <option value={'ES'}>ES</option>
                                <option value={'GO'}>GO</option>
                                <option value={'MA'}>MA</option>
                                <option value={'MG'}>MG</option>
                                <option value={'MS'}>MS</option>
                                <option value={'MT'}>MT</option>
                                <option value={'PA'}>PA</option>
                                <option value={'PB'}>PB</option>
                                <option value={'PE'}>PE</option>
                                <option value={'PI'}>PI</option>
                                <option value={'PR'}>PR</option>
                                <option value={'RJ'}>RJ</option>
                                <option value={'RN'}>RN</option>
                                <option value={'RO'}>RO</option>
                                <option value={'RR'}>RR</option>
                                <option value={'RS'}>RS</option>
                                <option value={'SC'}>SC</option>
                                <option value={'SE'}>SE</option>
                                <option value={'SP'}>SP</option>
                                <option value={'TO'}>TO</option>
                            </Select>
                        </FormControl>
                    </div>
                    <div className='inner-flex-container'>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={current?.isvip ?? false}
                                    onChange={(e) => setCurrent({ ...current, isvip: e.target.checked })}
                                    name="vip"
                                    color="primary"
                                />
                            }
                            label="VIP?"
                        />
                    </div>
                    <div className='inner-flex-container'>
                        <TextField
                            id="observacao"
                            label="Observações"
                            variant="outlined"
                            value={current.observacao}
                            onChange={(e) => setCurrent({ ...current, observacao: e.target.value })}
                            multiline
                            rows={8}
                            fullWidth />
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