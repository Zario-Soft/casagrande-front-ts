import { useSearchParams } from "react-router-dom";
import TopBar from "src/components/top-bar/top-bar.index";
import OrcamentosService from "../../orcamentos/orcamentos.service";
import { useContext, useEffect, useState } from "react";
import { ClienteExternalResponse } from "../clientes.contracts";
import { LoadingContext } from "src/providers/loading.provider";
import { TextField, FormControlLabel, Checkbox, FormControl, InputLabel, Input } from "@mui/material";
import { CPFMaskCustom, CNPJMaskCustom, TelMaskCustom, CelMaskCustom, CEPMaskCustom } from "src/components/masks";
import { fillState, GetInfoFromCNPJ, preencheCEP } from "../clientes-common";
import { NormalButton } from "src/components/buttons";
import ClienteExternalInvoiceDataPart from "./clientes-external-invoice-data.component";
import ClienteExternalConfirmation from "./clientes-external-confirmation.modal.page";
import ClientesService from "../clientes.service";
import ConfirmedPage from "./cliente-external-confirmed.page";
import ClientStateSelect from "../clientes-estado.component";
import { toast } from "react-toastify";
import { ToPascalCase } from "src/infrastructure/helpers";
import CircularLoader from "src/components/circular-loader";
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
      setIsLoading(true);

      const result = await orcamentoService.getByCode(code!);

      if (!result) {
        window.location.href = "https://www.casagrandemeias.com.br";
        return;
      }

      setCurrent(result);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    tryLoadInfo();
    // eslint-disable-next-line
  }, [])

  const onConfirm = async () => {
    setIsLoading(true);
    setShowConfirmation(false);

    await clientesService.editExternal(current!);
    // await orcamentoService.editObservacao({ id: current!.orcamentoid, observacao: ''});

    setIsConfirmed(true);
    setIsLoading(false);
  }

  const checkShowConfirmation = async () => {
    // validate

    const isValid = current?.nome && current.bairro && current?.responsavel &&
      current.celular && current.cep && current.cidade &&
      current.cpfcnpj && current.email && current.endereco &&
      current.estado && current.numero;

    const isSameValid = (!current?.issamedataforinvoice && current?.clienteinvoicedata?.nome && current.clienteinvoicedata.bairro && current.clienteinvoicedata.cep && current.clienteinvoicedata.cidade &&
      current.clienteinvoicedata.cpfcnpj && current.clienteinvoicedata.endereco &&
      current.clienteinvoicedata.estado && current.clienteinvoicedata.numero) || (current?.issamedataforinvoice === undefined || current.issamedataforinvoice === true);

    if (!isValid || !isSameValid) {

      toast.error("Há campos obrigatórios a serem preenchidos!");
      return;
    }

    setShowConfirmation(true);
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

  const disableTextFieldByCNPJ = () => {
    return ((current?.issamedataforinvoice === undefined || current?.issamedataforinvoice === true) && current?.cpfcnpj?.trim().length === 18 && current?.pessoafisica === 0);
  }


  return (<>
    {current && !isConfirmed && <>
      <TopBar />
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px'
      }}>
        <h2>Finalize seu cadastro</h2>
        <h5>Ao final você poderá confirmar os dados informados</h5>
        {current.pessoafisica === 0 && <h5>⚠️ Se o CNPJ for informado, a maioria das informações será preenchida automaticamente com dados da Receita Federal. Para alterá-las, desmarque a opção "Os dados acima são os mesmos para Nota Fiscal"</h5>}
        <div className='flex-container' style={{
          width: '90%',
          marginTop: '50px'
        }}>
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
                error={!current.cpfcnpj}
              />}
              {current.pessoafisica === 0 && <Input
                value={current.cpfcnpj?.trim()}
                onChange={(e) => setCurrent({ ...current, cpfcnpj: e.target.value.trim() })}
                name="cpfcnpj"
                id="cpfcnpj-input"
                inputComponent={CNPJMaskCustom}
                onBlur={fillInfoFromCNPJ}
                error={!current.cpfcnpj}
              />}
            </FormControl>
          </div>

          <TextField
            InputLabelProps={{ shrink: true }}
            className='txt-box txt-box-medium'
            id="resp"
            label="Nome do destinatário"
            variant="outlined"
            value={current.nome}
            onChange={(e) => setCurrent({ ...current, nome: e.target.value })}
            error={!current.nome}
            helperText={!current.nome ? 'Campo obrigatório' : ''}
            disabled={disableTextFieldByCNPJ()}
          />

          <TextField
            InputLabelProps={{ shrink: true }}
            className='txt-box txt-box-medium'
            id="nome"
            label="Nome do responsável pelo pedido"
            variant="outlined"
            value={current.responsavel}
            onChange={(e) => setCurrent({ ...current, responsavel: e.target.value })}
            error={!current.responsavel}
            helperText={!current.responsavel ? 'Campo obrigatório' : ''}
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
              error={!current.email}
              helperText={!current.email ? 'Campo obrigatório' : ''}
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
                  const estado = await fillState(e, clientesService);

                  if (estado) {
                    setCurrent({ ...current, estado: estado })
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
                  const estado = await fillState(e, clientesService);

                  if (estado) {
                    setCurrent({ ...current, estado: estado })
                  }
                }}
                error={!current.celular}
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
                error={!current.cep}
                disabled={disableTextFieldByCNPJ()}
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
              error={!current.endereco}
              helperText={!current.endereco ? 'Campo obrigatório' : ''}
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
              error={!current.numero}
              helperText={!current.numero ? 'Campo obrigatório' : ''}
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
              InputLabelProps={{ shrink: true }}
              disabled={disableTextFieldByCNPJ()}
            />

            <TextField
              className='txt-box-large'
              id="enderecoBairro"
              label="Bairro"
              variant="outlined"
              value={current.bairro}
              onChange={(e) => setCurrent({ ...current, bairro: e.target.value })}
              InputLabelProps={{ shrink: true }}
              error={!current.bairro}
              helperText={!current.bairro ? 'Campo obrigatório' : ''}
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
              error={!current.cidade}
              helperText={!current.cidade ? 'Campo obrigatório' : ''}
              InputLabelProps={{ shrink: true }}
              disabled={disableTextFieldByCNPJ()}
            />

            <ClientStateSelect
              current={current.estado}
              onChange={async (e) => setCurrent({ ...current, estado: e.target.value })}
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
            <NormalButton onClick={checkShowConfirmation} color="primary" sx={{ marginBottom: '10px' }}>
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
