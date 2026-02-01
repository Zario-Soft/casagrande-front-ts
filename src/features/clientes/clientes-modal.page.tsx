import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Checkbox, FormControl, FormControlLabel, Input, InputLabel } from "@mui/material";
import { NormalButton, WarningButton } from "src/components/buttons";
import { PaperComponent } from "src/components/dialogs";
import { ClienteDTO } from "./clientes.contracts"
import { useState, useContext } from "react";
import { toast } from "react-toastify";
import ClientesService from "./clientes.service";
import { CPFMaskCustom, CNPJMaskCustom, TelMaskCustom, CelMaskCustom, CEPMaskCustom } from "src/components/masks";
import { fillState, preencheCEP } from "./clientes-common";
import ClientStateSelect from "./clientes-estado.component";
import { LoadingContext } from "src/providers/loading.provider";
import { GetInfoFromCNPJ } from "./clientes-common";
import { ToPascalCase } from "src/infrastructure/helpers";  
import CircularLoader from "src/components/circular-loader";
import { useAddMutation, useEditMutation } from "./api";
export interface UpsertModalClientProps {
    cliente?: ClienteDTO,
    onClose: (message?: string) => void
}

export default function UpsertModalClient(props: UpsertModalClientProps) {
    const isNew = !props.cliente || !props.cliente?.id;
    const clientesService = new ClientesService();

    const [current, setCurrent] = useState(props.cliente ?? {} as ClienteDTO);
    const [isLoadingCEP, setIsLoadingCEP] = useState(false);
    const { setIsLoading } = useContext(LoadingContext);

    const [add] = useAddMutation();
    const [edit] = useEditMutation();

    const onSave = async () => {
        try {
            if (!await isSavingValid()) return;

            if (isNew) {

                await add(current).unwrap();

                props.onClose(`Cliente '${current.nome}' criado com sucesso`);
            }
            else {
                await edit(current).unwrap();

                props.onClose(`Cliente '${current.nome}' alterado com sucesso`);
            }            

        } catch (error: any) {
            toast.error(error);
        }
    }

    const isSavingValid = async (): Promise<boolean> => {
        if (!current.nome || current.nome === '') {
            toast.error('Preencha o nome do cliente');
            return false;
        }

        return true;
    }

    const fillInfoFromCNPJ = async () => {

        if (!current || !current.cpfcnpj || current.cpfcnpj.trim().length !== 18) return;
    
        setIsLoading(true);
    
        try {
          const data = await GetInfoFromCNPJ(current.cpfcnpj);
    
          if (!data){
            toast.error("CNPJ inválido");
            return;
          }
    
          toast.success("Informações coletadas do CNPJ com sucesso!");
    
          setCurrent({
                ...current,
                nome: ToPascalCase(data.razao_social) ?? current.nome,
                email: data.email ?? current.email,
                telefone: data.ddd_telefone_1 ?? current.telefone,
                celular: data.celular ?? current.celular,
                cidade: ToPascalCase(data.municipio) ?? current.cidade,
                bairro: ToPascalCase(data.bairro) ?? current.bairro,
                endereco: data.logradouro ? `${ToPascalCase(data.descricao_tipo_de_logradouro)} ${ToPascalCase(data.logradouro)}` : current.endereco,
                numero: data.numero ?? current.numero,
                complemento: ToPascalCase(data.complemento) ?? current.complemento,
                estado: data.uf ?? current.estado,
                cep: data.cep ?? current.cep,
                responsavel: data.qsa.length > 0 ? ToPascalCase(data.qsa[0].nome_socio) ?? current.responsavel : current.responsavel
            });
        } finally {
          setIsLoading(false);
        }
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
                        InputLabelProps={{ shrink: true }}
                    />

                    <TextField
                        className='txt-box txt-box-medium'
                        id="resp"
                        label="Responsável"
                        variant="outlined"
                        value={current.responsavel}
                        onChange={(e) => setCurrent({ ...current, responsavel: e.target.value })}
                        InputLabelProps={{ shrink: true }}
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
                                    value={current.cpfcnpj?.trim()}
                                    onChange={(e) => setCurrent({ ...current, cpfcnpj: e.target.value.trim() })}
                                    name="cpfcnpj"
                                    id="cpfcnpj-input"
                                    inputComponent={CPFMaskCustom}
                                />}
                                {!current.pessoafisica && <Input
                                    value={current.cpfcnpj?.trim()}
                                    onChange={(e) => setCurrent({ ...current, cpfcnpj: e.target.value.trim() })}
                                    name="cpfcnpj"
                                    id="cpfcnpj-input"
                                    inputComponent={CNPJMaskCustom}
                                    onBlur={fillInfoFromCNPJ}
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
                                onBlur={(e: any) => fillState(e, clientesService)}
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
                                onBlur={(e: any) => fillState(e, clientesService)}
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
                                onBlur={async (e: any) => {
                                    setIsLoadingCEP(true);

                                    await preencheCEP(e, current, setCurrent);

                                    setIsLoadingCEP(false);
                                }}
                            />
                        </FormControl>
                        {isLoadingCEP && <CircularLoader />}
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

                        <ClientStateSelect
                            current={current.estado}
                            onChange={async (e) => setCurrent({ ...current, estado: e.target.value })}
                        />
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