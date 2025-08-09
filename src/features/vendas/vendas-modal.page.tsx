import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, FormControl, InputLabel, Select } from "@mui/material";
import { NormalButton, ReportButton, WarningButton } from "src/components/buttons";
import { PaperComponent } from "src/components/dialogs";
import { useState } from "react";
import { toast } from "react-toastify";
import { FormasPagamento, VendaDTO } from "./vendas.contracts";
import VendasService from "./vendas.service";
import OrcamentoLookup from "../orcamentos/orcamento-lookup.component";
import moment from "moment";
import ReportInvoiceVenda from "./vendas-invoice.report";
import { ReportContent, ReportContentSummary, ReportContentImageSummary, ReportContentImageSummaryItem } from "src/components/report/report.interfaces";
import ClientesService from "../clientes/clientes.service";
import OrcamentosService from "../orcamentos/orcamentos.service";
import { OrcamentoGrid } from "../orcamentos/orcamentos.contracts";
import { ClienteDTO } from "../clientes/clientes.contracts";

export interface UpsertModalProductProps {
    current?: VendaDTO,
    onClose: (message?: string) => void
}

export default function UpsertModalVendas(props: UpsertModalProductProps) {
    const isNew = !props.current || !props.current?.id;
    const vendasService = new VendasService();
    const clienteService = new ClientesService();
    const orcamentoService = new OrcamentosService();

    const [current, setCurrent] = useState(props.current ?? { meiopagamento: 0, desconto: 0 } as VendaDTO);

    const [orcamento, setOrcamento] = useState<OrcamentoGrid>();
    const [cliente, setCliente] = useState<ClienteDTO>();

    const [invoiceVisible, setInvoiceVisible] = useState(false);
    const [invoice, setInvoice] = useState<ReportContent>();

    const onSave = async () => {
        try {
            if (!await isSavingValid()) return;

            if (isNew) {

                await vendasService.new(current);

                await props.onClose("Registro criado com sucesso");
            }
            else {
                await vendasService.edit(current);

                await props.onClose("Registro alterado com sucesso");
            }

        } catch (error: any) {
            toast.error(error);
        }
        finally {
        }
    }

    const showInvoice = async () => {
        const orcamento = await orcamentoService.getById(current.orcamentoid);
        await setOrcamento(orcamento);

        const cliente = await clienteService.getById(orcamento.clienteid);
        await setCliente(cliente);

        await setInvoice(await mountInvoice());
        await setInvoiceVisible(true);
    }

    const isValidDataLimiteEntrega = () => moment(current.datalimiteentrega) >= moment(moment().format('yyyy-MM-DD'));

    const isSavingValid = async (): Promise<boolean> => {
        const validDate = current.id || isValidDataLimiteEntrega();

        const valid = (current.orcamentoid &&
            current.percpagamentoinicial !== undefined && current.percpagamentoinicial >= 0 && current.percpagamentoinicial <= 100 &&
            current.meiopagamento !== undefined) && validDate;

        if (!valid) {
            await toast.error('Preencha os campos obrigatórios');
            return false;
        }

        return true;
    }

    const mountInvoice = async (): Promise<ReportContent> => {

        const localOrcamento = orcamento ?? await orcamentoService.getById(current.orcamentoid);
        const orcamentoProdutos = await orcamentoService.getAllOrcamentoProdutos(current.orcamentoid);
        const localCliente = cliente ?? await clienteService.getById(localOrcamento.clienteid);

        const valorTotalPares = orcamentoProdutos
            .map(prod => prod.produtovalor * prod.orcamentoproduto.quantidade)
            .reduce((prev, curr) => prev += curr);

        const valorTotalCompra = valorTotalPares + (localOrcamento.frete ?? 0) - (current.desconto ?? 0);

        const sendingSummary: ReportContentSummary = {
            title: 'Dados para envio',
            items: [
                { title: 'Nome Completo: ', value: localCliente.nome, fontSize: localCliente.nome.length >= 54 ? 9 : undefined },
                { title: 'Telefone: ', value: localCliente.celular ?? localCliente.telefone },
                { title: 'E-mail: ', value: localCliente.email },
                { title: 'CPF/CNPJ: ', value: localCliente.cpfcnpj },
                { title: 'Endereço: ', value: `${localCliente.endereco}, ${localCliente.numero} ${localCliente.complemento ? `(${localCliente.complemento})` : ''}` },
                { title: 'Endereço (cont.): ', value: `${localCliente.bairro}, ${localCliente.cidade} - ${localCliente.estado}` },
                { title: 'CEP: ', value: localCliente.cep },
                { title: 'Observações: ', value: localCliente.observacao }
            ]
        }

        const prodSummary: ReportContentImageSummary = {
            title: 'Dados para Produção',
            description: localOrcamento.observacao,
            imageItems: orcamentoProdutos.map(item => {
                return (!item.orcamentoproduto.fotoreal && !item.orcamentoproduto.fotoreal2)
                    ? {
                        images: [{
                            guid: item.orcamentoproduto.fotoinicial,
                            index: item.orcamentoproduto.id
                        } as ReportContentImageSummaryItem],
                        description: item.orcamentoproduto.observacaotecnica1,
                    }
                    :
                    {
                        images: [{
                                guid: item.orcamentoproduto.fotoreal,
                                index: item.orcamentoproduto.id
                            } as ReportContentImageSummaryItem,
                            {
                                guid: item.orcamentoproduto.fotoreal2,
                                index: item.orcamentoproduto.id
                            } as ReportContentImageSummaryItem
                        ],
                        description: item.orcamentoproduto.observacaotecnica1
                    }
            }),
            images: orcamentoProdutos.map(item => {
                return (!item.orcamentoproduto.fotoreal && !item.orcamentoproduto.fotoreal2)
                    ? [{
                        guid: item.orcamentoproduto.fotoinicial,
                        index: item.orcamentoproduto.id
                    } as ReportContentImageSummaryItem]
                    : [{
                        guid: item.orcamentoproduto.fotoreal,
                        index: item.orcamentoproduto.id
                    } as ReportContentImageSummaryItem,
                    {
                        guid: item.orcamentoproduto.fotoreal2,
                        index: item.orcamentoproduto.id
                    } as ReportContentImageSummaryItem
                    ]
            })
                .reduce((a, b) => a.concat(b)),
            breakPage: !!localOrcamento.observacao && (localOrcamento.observacao.length >= 500 || localOrcamento.observacao.split('\n').length > 20)
        }

        const paymentSummary: ReportContentSummary = {
            title: 'Pagamentos e Prazos',
            breakPage: true,
            items: [
                { title: 'Data de fechamento: ', value: moment(localOrcamento.dataorcamento).format('DD/MM/yyyy') },
                { title: 'Valor dos pares: ', value: `R$${valorTotalPares.toFixed(2)}` },
                { title: 'Valor do frete: ', value: `R$${(localOrcamento.frete ?? 0).toFixed(2)}` },
                { title: 'Valor de desconto: ', value: `R$${(current.desconto ?? 0).toFixed(2)}` },
                { title: 'Valor total da compra: ', value: `R$${valorTotalCompra.toFixed(2)}` },
                { title: 'Valor pago até o momento: ', value: `R$${(((current.percpagamentoinicial ?? 0) / 100) * valorTotalCompra).toFixed(2)}` },
                { title: 'Forma de pagamento: ', value: FormasPagamento[current.meiopagamento] },
                { title: 'Previsão de envio: ', value: moment(current.datalimiteentrega).format('DD/MM/yyyy') },
            ],
        }

        const warningSummary: ReportContentSummary = {
            title: 'Atenção',
            items: [
                { value: '- Os dados contidos neste documento são de responsabilidade do cliente e não poderão ser alterados após confirmação do mesmo.' },
                { value: '- Não aceitamos trocas nem devolução do produto aprovado pelo cliente.' },
                { value: '- Data para envio é uma previsão, sujeita a alterações para mais ou para menos dias a depender de pagamento de parcela restante e condições de transporte.' },
                { value: '- O pedido é enviado após confirmação do pagamento integral da compra.' },
                { value: '- Pedidos não procurados/quitados no prazo de 90 dias após finalizados são descartados, e não há reembolso da primeira parcela paga.' },
            ],
            breakPage: true
        }

        return {
            summaries: [
                sendingSummary,
                prodSummary,
                paymentSummary,
                warningSummary
            ]
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
            <DialogTitle id="draggable-dialog-title" style={{ cursor: 'move' }}>{!isNew ? `Editando Venda '${current.id}'` : "Nova Venda"}
            </DialogTitle>
            <DialogContent>
                <div className='flex-container'>
                    <OrcamentoLookup
                        sx={{
                            minWidth: '94%',
                            marginBottom: 5
                        }}
                        onChange={async (c) => {
                            const local = { ...current, orcamentoid: c?.id ?? 0 };
                            console.log(local)
                            await setCurrent(local);
                        }}
                        selectedId={current?.orcamentoid}
                    />

                    <div className='inner-flex-container' style={{ gap: '10px' }}>
                        <TextField
                            className='txt-box txt-box-small'
                            id="percpagamentoinicial"
                            label="% Pagamento Inicial"
                            variant="outlined"
                            type="number"
                            value={current.percpagamentoinicial}
                            onChange={(e) => setCurrent({ ...current, percpagamentoinicial: parseFloat(e.target.value) })}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            error={!current.percpagamentoinicial || current.percpagamentoinicial < 0 || current.percpagamentoinicial > 100}
                            helperText={!current.percpagamentoinicial ? 'Campo obrigatório' : (current.percpagamentoinicial >= 0 && current.percpagamentoinicial <= 100 ? '' : 'Porcentagem inválida')}
                        />

                        <TextField
                            className='txt-box txt-box-medium'
                            id="datalimiteentrega"
                            label="Data Limite Entrega"
                            variant="outlined"
                            type="date"
                            error={!current.id && !isValidDataLimiteEntrega()}
                            helperText={!current.datalimiteentrega ? 'Campo obrigatório' : (!current.id && !isValidDataLimiteEntrega() ? 'Insira uma data posterior à atual' : '')}
                            value={current.datalimiteentrega}
                            onChange={(e) => setCurrent({ ...current, datalimiteentrega: e.target.value })}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />

                        <TextField
                            className='txt-box txt-box-medium'
                            id="desconto"
                            label="Desconto/Taxa de teste (R$)"
                            variant="outlined"
                            type="number"
                            value={current.desconto}
                            onChange={(e) => setCurrent({ ...current, desconto: parseFloat(e.target.value) })}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                    </div>

                    <div className='inner-flex-container'>
                        <FormControl variant="outlined" style={{ minWidth: 180 }}>
                            <InputLabel
                                htmlFor="meiopagamento-id"
                                id="meiopagamento-label"
                                shrink>Meio de Pagamento</InputLabel>
                            <Select
                                native
                                label="Meio de Pagamento"
                                fullWidth
                                value={current.meiopagamento}
                                onChange={async (e) => await setCurrent({ ...current, meiopagamento: parseInt(e.target.value.toString()) })}
                                inputProps={{
                                    name: 'meiopagamento',
                                    id: 'meiopagamento-id'
                                }}
                            >
                                {FormasPagamento.map((value: string, index: number) => <option value={index} key={index}>{value}</option>)}
                            </Select>
                        </FormControl>
                    </div>
                </div>
            </DialogContent>
            <DialogActions>
                <ReportButton onClick={showInvoice}>
                    Comprovante
                </ReportButton>
                <NormalButton onClick={onSave} color="primary">
                    Salvar
                </NormalButton>
                <WarningButton onClick={() => props.onClose()} color="secondary">
                    Cancelar
                </WarningButton>
            </DialogActions>
        </Dialog>

        {invoiceVisible && <ReportInvoiceVenda
            formTitle={`Venda ${current.id}`}
            reportTitle={`${cliente?.nome} - Venda ${current.id}`}
            onClose={async () => await setInvoiceVisible(false)}
            content={invoice}
        />}
    </>
}