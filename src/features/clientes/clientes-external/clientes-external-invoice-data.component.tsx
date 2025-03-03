import { useEffect, useState, useContext } from "react"
import { ClienteInvoiceData } from "../clientes.contracts";
import { TextField, FormControlLabel, Checkbox, FormControl, InputLabel, Input, CircularProgress } from "@mui/material";
import { CPFMaskCustom, CNPJMaskCustom, TelMaskCustom, CelMaskCustom, CEPMaskCustom } from "src/components/masks";
import { fillState, preencheCEP, GetInfoFromCNPJ } from "../clientes-common";
import ClientesService from "../clientes.service";
import { Line } from "src/components/line/line.component";
import ClientStateSelect from "../clientes-estado.component";
import { LoadingContext } from "src/providers/loading.provider";
import { toast } from "react-toastify";
import { ToPascalCase } from "src/infrastructure/helpers";
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
    const { setIsLoading } = useContext(LoadingContext);

    useEffect(() => {
        if (props.onChange)
            props.onChange(current);
    }, [current, props])

    const fillInfoFromCNPJ = async () => {

        if (!current || !current.cpfcnpj || current.cpfcnpj.trim().length !== 18) return;
    
        await setIsLoading(true);
    
        try {
          const data = await GetInfoFromCNPJ(current.cpfcnpj);
          if (!data){
            toast.error("CNPJ inválido");
            return;
          }

          toast.success("Informações coletadas do CNPJ com sucesso!");
    
          await setCurrent({
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
            cep: data.cep ?? current.cep
          });
        } finally {
          await setIsLoading(false);
        }
      }

      const disableTextFieldByCNPJ = () => {
        return current?.cpfcnpj?.trim().length === 18 && current?.pessoafisica === 0;
      }

    return <div className='flex-container' style={{
        flexDirection: 'column',
        width: '-webkit-fill-available',
    }}>
        <Line />
        <h3>Dados para a nota fiscal</h3>
        {current.pessoafisica === 0 && <h5>⚠️ Se o CNPJ for informado, a maioria das informações será preenchida automaticamente com dados da Receita Federal e não poderão ser alteradas.</h5>}
        <div className='inner-flex-container'>
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
                        {current.pessoafisica === 1 ? 'CPF' : 'CNPJ'}
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
                        onBlur={fillInfoFromCNPJ}
                    />}
                </FormControl>
            </div>
        </div>
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
            disabled={disableTextFieldByCNPJ()}
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
                    disabled={disableTextFieldByCNPJ()}
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
                    disabled={disableTextFieldByCNPJ()}
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
                disabled={disableTextFieldByCNPJ()}
            />

            <TextField
                id="enderecoNr"
                label="Nº"
                variant="outlined"
                type="number"
                value={current.numero}
                onChange={(e) => setCurrent({ ...current, numero: e.target.value })}

                InputLabelProps={{ shrink: true }}
                disabled={disableTextFieldByCNPJ()}
            />
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

                InputLabelProps={{ shrink: true }}
                disabled={disableTextFieldByCNPJ()}
            />

        </div>

        <div className='inner-flex-container'>
            <TextField
                className='txt-box-large'
                id="enderecoCidade"
                label="Cidade"
                variant="outlined"
                value={current.cidade}
                onChange={(e) => setCurrent({ ...current, cidade: e.target.value })}

                InputLabelProps={{ shrink: true }}
                disabled={disableTextFieldByCNPJ()}
            />

            <ClientStateSelect
                current={current.estado}
                onChange={async (e) => await setCurrent({ ...current, estado: e.target.value })}
                disabled={disableTextFieldByCNPJ()}
            />
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