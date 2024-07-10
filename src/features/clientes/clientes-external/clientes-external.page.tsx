import { useSearchParams } from "react-router-dom";
import TopBar from "src/components/top-bar/top-bar.index";
import OrcamentosService from "../../orcamentos/orcamentos.service";
import { useContext, useEffect, useState } from "react";
import { ClienteExternalResponse } from "../clientes.contracts";
import { LoadingContext } from "src/providers/loading.provider";
import { TextField, FormControlLabel, Checkbox, FormControl, InputLabel, Input, CircularProgress, Select } from "@mui/material";
import { CPFMaskCustom, CNPJMaskCustom, TelMaskCustom, CelMaskCustom, CEPMaskCustom } from "src/components/masks";
import { fillState, preencheCEP } from "../clientes-common";
import { NormalButton } from "src/components/buttons";
import ClienteExternalInvoiceDataPart from "./clientes-external-invoice-data.component";
import ClienteExternalConfirmation from "./clientes-external-confirmation.modal.page";
import ClientesService from "../clientes.service";
import ConfirmedPage from "./cliente-external-confirmed.page";

export default function ClienteExternal() {
  const [searchParams] = useSearchParams();
  const { setIsLoading } = useContext(LoadingContext);

  const code = searchParams.get("code");
  if (code === null || code === '') {
    window.location.href = "https://www.casagrandemeias.com.br";
  }

  const [current, setCurrent] = useState<ClienteExternalResponse>();
  const orcamentoService = new OrcamentosService();
  const clientesService = new ClientesService();
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const tryLoadInfo = async () => {
    if (!code) return;

    try {
      await setIsLoading(true);

      const result = await orcamentoService.getByCode(code!);

      if (!result) {
        window.location.href = "https://www.casagrandemeias.com.br";
        return;
      }

      await setCurrent(result);
    } finally {
      await setIsLoading(false);
    }
  }

  useEffect(() => {
    tryLoadInfo();
    // eslint-disable-next-line
  }, [])

  const onConfirm = async () => {
    await setIsLoading(true);
    await setShowConfirmation(false);

    await clientesService.editExternal(current!);

    await setIsConfirmed(true);
    await setIsLoading(false);
  }


  return (<>
    {current && !isConfirmed && <>
      <TopBar />
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <h2>Finalize seu cadastro</h2>
        <p>Ao final você poderá confirmar os dados informados</p>
        <div className='flex-container' style={{
          width: '90%',
          marginTop: '50px'
        }}>
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

          <TextField
            InputLabelProps={{ shrink: true }}
            className='txt-box txt-box-medium'
            id="resp"
            label="Responsável"
            variant="outlined"
            value={current.responsavel}
            onChange={(e) => setCurrent({ ...current, responsavel: e.target.value })}
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
                  value={current.cpfcnpj.trim()}
                  onChange={(e) => setCurrent({ ...current, cpfcnpj: e.target.value.trim() })}
                  name="cpfcnpj"
                  id="cpfcnpj-input"
                  inputComponent={CPFMaskCustom}
                />}
                {current.pessoafisica === 0 && <Input
                  value={current.cpfcnpj.trim()}
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
                  const estado = await fillState(e, clientesService);

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
                  const estado = await fillState(e, clientesService);

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
          <div className='inner-flex-container'>
            <FormControlLabel
              control={
                <Checkbox
                  checked={current?.issamedataforinvoice ?? true}
                  onChange={(e) => setCurrent({ ...current, issamedataforinvoice: e.target.checked })}
                  name="issamedataforinvoice"
                  color="primary"
                />
              }
              label="Os dados acima são os mesmos para Nota Fiscal"
            />
          </div>

          {current.issamedataforinvoice === false && <ClienteExternalInvoiceDataPart current={current.clienteinvoicedata}
            onChange={(d) => setCurrent({ ...current, clienteinvoicedata: d })}
            clientesService={clientesService}
          />}

          <div style={{
            display: 'flex',
            width: '-webkit-fill-available',
            justifyContent: 'center'
          }}>
            <NormalButton onClick={() => setShowConfirmation(true)} color="primary" sx={{ marginBottom: '10px' }}>
              Enviar Informações
            </NormalButton>
          </div>
        </div>
      </div>

      {showConfirmation && <ClienteExternalConfirmation
        current={current}
        onClose={() => setShowConfirmation(false)}
        onConfirm={onConfirm}
      />}
    </>}

    {isConfirmed && <ConfirmedPage />}
  </>);
}