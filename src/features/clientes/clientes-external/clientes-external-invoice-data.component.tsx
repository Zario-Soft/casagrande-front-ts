import { useEffect, useState } from "react"
import { ClienteInvoiceData } from "../clientes.contracts";
import { TextField, FormControlLabel, Checkbox, FormControl, InputLabel, Input, CircularProgress, Select } from "@mui/material";
import { CPFMaskCustom, CNPJMaskCustom, TelMaskCustom, CelMaskCustom, CEPMaskCustom } from "src/components/masks";
import { fillState, preencheCEP } from "../clientes-common";
import ClientesService from "../clientes.service";
import { Line } from "src/components/line/line.component";

export interface ClienteExternalInvoiceDataPartProps {
    current?: ClienteInvoiceData,
    clientesService: ClientesService,
    onChange?: (data: ClienteInvoiceData) => void,
}

export default function ClienteExternalInvoiceDataPart(props: ClienteExternalInvoiceDataPartProps) {
    const [current, setCurrent] = useState<ClienteInvoiceData>(props.current ?? {
        pessoafisica: 1
    } as ClienteInvoiceData);
    const [isLoadingCEP, setIsLoadingCEP] = useState(false);

    useEffect(() => {
            if (props.onChange)
                props.onChange(current);
    }, [current, props])

    return <div className='flex-container' style={{
        flexDirection: 'column',
        width: '-webkit-fill-available',
    }}>
        <Line />
        <h3>Dados para a nota fiscal</h3>
        <TextField
            InputLabelProps={{ shrink: true }}
            className='txt-box txt-box-medium'
            id="nome"
            label="Nome"
            variant="outlined"
            value={current.nome}
            onChange={(e) => setCurrent({ ...current, nome: e.target.value })}
            error={!current.nome}
            helperText={!current.nome ? 'Campo obrigatório' : ''}
        />

        <div className='inner-flex-container'>
            <TextField
                InputLabelProps={{ shrink: true }}
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
                        checked={current.pessoafisica === 1}
                        onChange={(e) => setCurrent({ ...current, pessoafisica: e.target.checked ? 1 : 0 })}
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
                    {current.pessoafisica === 1 && <Input
                        value={current.cpfcnpj?.trim()}
                        onChange={(e) => setCurrent({ ...current, cpfcnpj: e.target.value.trim() })}
                        name="cpfcnpj"
                        id="cpfcnpj-input"
                        inputComponent={CPFMaskCustom}
                    />}
                    {current.pessoafisica === 0 && <Input
                        value={current.cpfcnpj?.trim()}
                        onChange={(e) => setCurrent({ ...current, cpfcnpj: e.target.value.trim() })}
                        name="cpfcnpj"
                        id="cpfcnpj-input"
                        inputComponent={CNPJMaskCustom}
                    />}
                </FormControl>
            </div>
        </div>
        <div className='inner-flex-container'>
            <FormControl>
                <InputLabel htmlFor="formatted-text-mask-input" shrink>Telefone</InputLabel>
                <Input
                    value={current.telefone}
                    onChange={(e) => setCurrent({ ...current, telefone: e.target.value })}
                    name="telefone"
                    id="telefone-input"
                    inputComponent={TelMaskCustom}
                    onBlur={async (e: any) => {
                        const estado = await fillState(e, props.clientesService);

                        if (estado) {
                            await setCurrent({ ...current, estado: estado })
                        }
                    }}
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
                    onBlur={async (e: any) => {
                        const estado = await fillState(e, props.clientesService);

                        if (estado) {
                            await setCurrent({ ...current, estado: estado })
                        }
                    }}
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
                        await setIsLoadingCEP(true);

                        await preencheCEP(e, current, setCurrent);
                        
                        await setIsLoadingCEP(false);
                    }}
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
            <TextField
                id="observacao"
                label="Ponto de referência / observações"
                variant="outlined"
                value={current.observacao}
                onChange={(e) => setCurrent({ ...current, observacao: e.target.value })}
                multiline
                rows={8}
                fullWidth />
        </div>
    </div>
}