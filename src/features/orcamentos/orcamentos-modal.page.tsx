import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, FormControl, InputLabel, Select, IconButton } from "@mui/material";
import { NormalButton, ReportButton, WarningButton } from "src/components/buttons";
import { PaperComponent } from "src/components/dialogs";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import OrcamentosService from "./orcamentos.service";
import { OrcamentoDTO, OrcamentoUpsertRequest, OrcamentoProdutoGrid, StatusOrcamento, OrcamentoProdutoDTO, OrcamentoGrid } from "./orcamentos.contracts";
import ClientesLookup from "../clientes/clientes-lookup.component";
import { Remove, Add, Edit } from "@mui/icons-material";
import ZGrid, { ZGridColDef } from "src/components/z-grid";
import UpsertModalOrcamentoProdutos from "./orcamento-produtos.modal.page";
import ConfirmationDialog from "src/components/dialogs/confirmation.dialog";
import moment from "moment";
import ReportInvoiceOrcamento from "./orcamento-invoice.report";
import { ImageItem, ReportContent, ReportContentImageSummary, ReportContentImageSummaryItem, ReportContentSummary } from "src/components/report/report.interfaces";
import ClientesService from "../clientes/clientes.service";
import OrcamentoCodeModal from "./orcamento-code.modal.page";
import { nanoid } from "nanoid";
import { BASE_URL } from "src/infrastructure/env";

const columns: ZGridColDef[] = [
    { field: 'id', headerName: 'ID', width: 50, hide: true },
    { field: 'clienteid', headerName: 'clienteid', width: 50, hide: true },
    { field: 'produtodescricao', headerName: 'Produto', width: 290 },
    { field: 'quantidade', headerName: 'Quantidade', width: 150 },
    { field: 'cornome', headerName: 'Cor', width: 150 },
    { field: 'generodescricao', headerName: 'Gênero', width: 150 },
    {
        field: 'trellocardid',
        headerName: 'Vinculado ao Trello?',
        width: 150,
        valueFormatter: (value: any) => value ? '✅ Sim' : '❌ Não'
    },
]

export interface UpsertModalProps {
    orcamento?: OrcamentoGrid,
    onClose: (message?: string) => void
}

export default function UpsertModalOrcamento(props: UpsertModalProps) {
    const isNew = !props.orcamento || !props.orcamento?.id;
    const orcamentosService = new OrcamentosService();
    const clienteService = new ClientesService();

    const [current, setCurrent] = useState(
        props.orcamento ??
        {
            valortotal: 0,
            excluido: 0,
            status: 0,
            dataorcamento: moment().format("DD/MM/yyyy"),
        } as unknown as OrcamentoGrid);
    const [currentOrcamentoProduto, setCurrentOrcamentoProduto] = useState<OrcamentoProdutoGrid>();
    const [currentEditingOrcamentoProduto, setCurrentEditingOrcamentoProduto] = useState<OrcamentoProdutoGrid>();
    const [allOrcamentosProdutos, setAllOrcamentosProdutos] = useState<OrcamentoProdutoGrid[] | undefined>();

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [invoiceVisible, setInvoiceVisible] = useState(false);
    const [invoice, setInvoice] = useState<ReportContent>();
    const [codeModalVisible, setCodeModalVisible] = useState(false);
    const [showModalOrcamentoProduto, setShowModalOrcamentoProduto] = useState(false);
    const [codeUrl, setCodeUrl] = useState<string>('');

    useEffect(() => {
        if (props.orcamento) {
            getAllOrcamentosProdutos(props.orcamento);
        }
        // eslint-disable-next-line
    }, [props.orcamento]);

    const getAllOrcamentosProdutos = async (orcamento: OrcamentoDTO) => {
        try {
            const data = await orcamentosService.getAllOrcamentoProdutos(orcamento.id);
            if (data && data.length) {
                const localOrcamentoProdutos: OrcamentoProdutoGrid[] = data.map(p => {
                    return {
                        cornome: p.cornome,
                        generodescricao: p.generodescricao,
                        produtodescricao: p.produtodescricao,
                        produtovalor: p.produtovalor,
                        clientenome: current.clientenome,
                        ...p.orcamentoproduto,
                        clienteid: current.clienteid
                    } as OrcamentoProdutoGrid
                });

                await setAllOrcamentosProdutos(localOrcamentoProdutos.sort((a, b) => a.id > b.id ? 1 : -1));

                await handleFrete({
                    target: {
                        value: orcamento.frete
                    }
                }, localOrcamentoProdutos)
            }
        } catch (e: any) {
            toast.error(`Não foi possivel carregar os produtos do orçamento: ${e}`);
            console.log(e);
        }
    }

    const generateRegisterLink = async () => {
        const newCode = nanoid(5);

        orcamentosService.addCode({
            id: current!.id,
            code: newCode
        });

        await setCodeUrl(`${BASE_URL}/fill-data?code=${newCode}`);

        await setCodeModalVisible(true);
    }

    const onSave = async () => {
        try {
            if (!await isSavingValid()) return;

            let orcamentoProdutos = [...allOrcamentosProdutos!];

            orcamentoProdutos.forEach(f => { if (f.id < 0) f.id = 0; });

            const request: OrcamentoUpsertRequest = {
                orcamento: {
                    id: current!.id,
                    clienteid: current!.clienteid,
                    frete: current!.frete ?? 0,
                    status: current!.status,
                    valortotal: current!.valortotal,
                    dataorcamento: current!.dataorcamento
                        ? moment(current!.dataorcamento, "DD/MM/yyyy").format("yyyy-MM-DD")
                        : moment().format("yyyy-MM-DD"),
                    dataenvioteste: current!.dataenvioteste,
                    observacao: current!.observacao
                },
                produtos: orcamentoProdutos.map(op => {
                    const mapped: OrcamentoProdutoDTO = {
                        ...op
                    }
                    return mapped;
                })
            }

            if (isNew) {

                await orcamentosService.new(request);

                await props.onClose("Registro criado com sucesso");
            }
            else {
                await orcamentosService.edit(request);

                await props.onClose("Registro alterado com sucesso");
            }

        } catch (error: any) {
            toast.error(error);
        }
        finally {
        }
    }

    const isSavingValid = async (): Promise<boolean> => {
        if (!(allOrcamentosProdutos ?? []).filter(f => f.excluido === 0).length) {
            toast.error(`É necessário informar ao menos um produto.`);
            return false;
        }

        if (!current.observacao || current.observacao === '' || !current.clienteid)
            return false;

        return true;
    }

    const handleFrete = async (e: any, orcProds?: OrcamentoProdutoGrid[]) => {
        const localFrete = isNaN(e.target.value) ? 0 : e.target.value;

        const localCurrent = { ...current, frete: parseFloat(localFrete) };
        let vlTotal = calculateTotalValue(localCurrent, orcProds);

        await setCurrent({ ...localCurrent, valortotal: vlTotal });
    }

    const calculateTotalValue = (obj?: OrcamentoDTO, orcProds?: OrcamentoProdutoGrid[]): number => {
        let vlTotal = obj?.frete ?? current?.frete ?? 0;
        orcProds ??= allOrcamentosProdutos;

        let somaProdutos = orcProds && orcProds.filter(f => f.excluido === 0).length
            ? orcProds
                .filter(f => f.excluido === 0)
                .map(m => m.quantidade * m.produtovalor)
                .reduce((a, b) => a + b)
            : 0;

        if (isNaN(vlTotal))
            return 0;

        return vlTotal + (isNaN(somaProdutos) ? 0 : somaProdutos);
    }

    const onConfirmExclusion = async () => {
        //open dialog and remove item from grid
        if (!currentOrcamentoProduto)
            return;

        let localOrcamentoProdutos = allOrcamentosProdutos ?? [];

        try {
            let index = localOrcamentoProdutos.indexOf(currentOrcamentoProduto);
            localOrcamentoProdutos.splice(index, 1);

            if (currentOrcamentoProduto.id > 0) {
                let newCurrent = { ...currentOrcamentoProduto, excluido: 1 };
                localOrcamentoProdutos = [...localOrcamentoProdutos, newCurrent];
            }

            await setAllOrcamentosProdutos(localOrcamentoProdutos.sort((a, b) => a.id > b.id ? 1 : -1));
            let vlTotal = calculateTotalValue(current, localOrcamentoProdutos);
            await setCurrent({ ...current, valortotal: vlTotal });

            //Cleaning
            await setCurrentOrcamentoProduto(undefined);
        } catch (e) {
            toast.error(`Não foi possivel excluir o produto. ${e}`);
        }
    }

    const addProduct = async () => {
        //clear client
        await setCurrentOrcamentoProduto(undefined);

        await setCurrentEditingOrcamentoProduto(undefined);
        await setCurrentEditingOrcamentoProduto({} as OrcamentoProdutoGrid);

        await setShowModalOrcamentoProduto(true);
    }

    const editProduct = async (e: any) => {
        await setCurrentEditingOrcamentoProduto(undefined);
        await setCurrentEditingOrcamentoProduto(e.row ?? currentOrcamentoProduto);

        await setShowModalOrcamentoProduto(true);
    }

    async function handleCloseModalOrcamentoProduto(newOrcamentoProduto?: OrcamentoProdutoGrid) {
        let localOrcamentoProdutos = allOrcamentosProdutos ?? [];

        if (newOrcamentoProduto) {
            if (newOrcamentoProduto.id !== undefined && newOrcamentoProduto.id !== 0) {

                let orcamentoProduto = localOrcamentoProdutos.find(f => f.id === newOrcamentoProduto.id);

                let index = localOrcamentoProdutos.indexOf(orcamentoProduto!);
                if (index >= 0)
                    localOrcamentoProdutos.splice(index, 1);
            }
            else {
                newOrcamentoProduto.id = -(localOrcamentoProdutos.length + 1); //Temp id to show on grid
                newOrcamentoProduto.excluido = 0;
            }
            //Fixing formatting
            newOrcamentoProduto.genero ??= 0;
            newOrcamentoProduto.generodescricao = newOrcamentoProduto.genero ? 'Feminino' : 'Masculino';
            newOrcamentoProduto.clienteid = current.clienteid;

            const newAllOrcamentoProdutos = [...localOrcamentoProdutos, newOrcamentoProduto];

            await setAllOrcamentosProdutos(newAllOrcamentoProdutos.sort((a, b) => a.id > b.id ? 1 : -1));

            let vlTotal = calculateTotalValue(current, newAllOrcamentoProdutos);
            await setCurrent({ ...current, valortotal: vlTotal });
        }

        await setShowModalOrcamentoProduto(false);
    }

    const shouldShowInvoiceButton = () => {
        return (allOrcamentosProdutos && allOrcamentosProdutos.length > 0) && !isNaN(current.clienteid) && current.clienteid > 0
    }

    const showInvoiceButton = async () => {
        await setInvoice(await mountInvoice());
        await setInvoiceVisible(true);
    }

    const shouldShowLinkButton = () => {
        return !isNew;
    }

    const mountInvoice = async (): Promise<ReportContent> => {

        const cliente = await clienteService.getById(current.clienteid);

        const clientSummary: ReportContentSummary = {
            title: 'Dados do cliente',
            items: [
                { title: 'Nome: ', value: cliente.nome, fontSize: cliente.nome.length >= 54 ? 9 : undefined },
                { title: 'Telefone: ', value: cliente.celular ?? cliente.telefone }
            ]
        }

        const localOrcamentoProdutos = allOrcamentosProdutos ?? [];

        const prodSummary: ReportContentImageSummary = {
            title: 'Dados para Produção',
            description: current.observacao,
            images: localOrcamentoProdutos
                .sort((a, b) => a.id > b.id ? 1 : -1)
                .map((item, i) => {
                    return (item.fotoinicial || item.fotoinicial2 || item.fotoinicialbase64 || item.fotoinicial2base64)
                        ? [
                            {
                                guid: item.fotoinicial ?? item.fotoinicialbase64,
                                index: ((i + 1) * localOrcamentoProdutos.length) + i,
                            } as ReportContentImageSummaryItem,
                            {
                                guid: item.fotoinicial2 ?? item.fotoinicial2base64,
                                index: ((i + 2) * localOrcamentoProdutos.length) + i
                            } as ReportContentImageSummaryItem,
                        ]
                        : [
                            {
                                guid: item.fotoreal ?? item.fotorealbase64,
                                index: ((i + 1) * localOrcamentoProdutos.length) + i
                            } as ReportContentImageSummaryItem,
                            {
                                guid: item.fotoreal2 ?? item.fotoreal2base64,
                                index: ((i + 2) * localOrcamentoProdutos.length) + i
                            } as ReportContentImageSummaryItem,
                        ]
                })
                .reduce((a, b) => a.concat(b)),
            imageItems: localOrcamentoProdutos
                .sort((a, b) => a.id > b.id ? 1 : -1)
                .map((item, index) => {
                    return (item.fotoinicial || item.fotoinicial2 || item.fotoinicialbase64 || item.fotoinicial2base64)
                        ? {
                            images: [
                                {
                                    guid: item.fotoinicial ?? item.fotoinicialbase64,
                                    index: ((index + 1) * localOrcamentoProdutos.length) + index,
                                } as ReportContentImageSummaryItem,
                                {
                                    guid: item.fotoinicial2 ?? item.fotoinicial2base64,
                                    index: ((index + 2) * localOrcamentoProdutos.length) + index
                                } as ReportContentImageSummaryItem,
                            ],
                            description: item.observacaotecnica1
                        } as ImageItem
                        : {
                            images: [
                                {
                                    guid: item.fotoreal ?? item.fotorealbase64,
                                    index: ((index + 1) * localOrcamentoProdutos.length) + index
                                } as ReportContentImageSummaryItem,
                                {
                                    guid: item.fotoreal2 ?? item.fotoreal2base64,
                                    index: ((index + 2) * localOrcamentoProdutos.length) + index
                                } as ReportContentImageSummaryItem,
                            ], 
                            description: item.observacaotecnica1
                        } as ImageItem
                })
                .reduce((prev, curr) => prev.concat(curr), [] as ImageItem[])
        }

        const datesSummary: ReportContentSummary = {
            title: 'Datas',
            breakPage: true,
            items: [
                {
                    visible: current.dataorcamento !== undefined,
                    title: 'Data de solicitação: ',
                    value: current.dataorcamento!
                },
                { visible: moment(current.dataenvioteste).isValid(), title: 'Data de envio do teste: ', value: moment(current.dataenvioteste).format('DD/MM/yyyy') },
            ]
        }

        const warningSummary: ReportContentSummary = {
            title: 'Atenção',
            items: [
                { value: '- A personalização das meias é bordada, o que significa que sua arte é produzida fio a fio, ponto a ponto, junto com a meia no processo de confecção. Por isso a arte pode sofrer ajustes, visando manter a nitidez e a qualidade da mesma no bordado. Aprovando esse documento o cliente está ciente de que se trata de técnica de bordado e que o resultado NÃO fica exatamente idêntico a arte digital.' },
                { value: '- Os dados neste documento não poderão ser alterados após confirmação do mesmo para fins deste teste.' },
                { value: '- A data para envio é uma previsão, sujeita a alterações para mais ou para menos dias.' },
            ],
            breakPage: true
        }

        return {
            summaries: [
                clientSummary,
                prodSummary,
                datesSummary,
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
            <DialogTitle id="draggable-dialog-title" style={{ cursor: 'move' }}>
                {isNew ? 'Novo Orçamento' : `Editando Orçamento '${current!.id}'`}
            </DialogTitle>
            <DialogContent>
                <div className='flex-container' style={{
                    display: 'flex',
                }}>
                    <ClientesLookup
                        sx={{
                            minWidth: '94%',
                            marginBottom: 5
                        }}
                        onChange={async (c) => {
                            const local: OrcamentoGrid = { ...current, clienteid: c?.id ?? 0, clientenome: c?.nome };
                            await setCurrent(local);
                        }}
                        selectedId={current?.clienteid}
                    />
                    <div style={{
                        display: 'flex',
                        width: '-webkit-fill-available',
                        justifyContent: 'flex-end',
                        marginBottom: 10
                    }}>
                        <TextField
                            id="dataorcamento"
                            label="Data"
                            variant="outlined"
                            type="date"
                            value={moment(current.dataorcamento, "DD/MM/yyyy").format("yyyy-MM-DD")}
                            onChange={(e) => setCurrent({ ...current, dataorcamento: moment(e.target.value, "yyyy-MM-DD").format("DD/MM/yyyy") })}

                            InputLabelProps={{ shrink: true }}
                            style={{ marginRight: '8px', marginBottom: 5 }}
                        />

                        <TextField
                            id="dataenvioteste"
                            label="Data de envio do teste"
                            variant="outlined"
                            type="date"
                            value={current.dataenvioteste}
                            onChange={(e) => setCurrent({ ...current, dataenvioteste: e.target.value })}
                            style={{ marginBottom: 5 }}
                            InputLabelProps={{ shrink: true }}
                        />
                    </div>
                    <div className='inner-flex-container'>
                        <TextField
                            className='txt-box txt-box-large'
                            id="observacao"
                            label="Observações"
                            variant="outlined"
                            value={current.observacao}
                            onChange={(e) => setCurrent({ ...current, observacao: e.target.value })}
                            multiline
                            rows={4}
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }}
                            error={!current.observacao}
                            helperText={!current.observacao ? 'Campo obrigatório' : ''} />
                    </div>
                    <div className='inner-flex-container'
                        style={{
                            display: 'flex',
                            gap: '20px'
                        }}>
                        <FormControl variant="outlined" sx={{ minWidth: 350 }}>
                            <InputLabel
                                htmlFor="status-orcamento-id"
                                id="status"
                                shrink>Status</InputLabel>
                            <Select
                                native
                                label="Status"
                                fullWidth
                                value={current.status}
                                onChange={async (e: any) => await setCurrent({ ...current, status: parseInt(e.target.value) })}
                                inputProps={{
                                    name: 'status',
                                    id: 'status-orcamento-id'
                                }}
                            >
                                {StatusOrcamento.map((value, index) => <option value={index} key={index}>{value}</option>)}
                            </Select>
                        </FormControl>

                        <TextField
                            id="frete"
                            className='txt-box txt-box-small'
                            label="Frete"
                            variant="outlined"
                            type="number"
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }}
                            value={current.frete}
                            onChange={handleFrete} />

                        <TextField
                            id="valorTotal"
                            className='txt-box txt-box-small'
                            label="Valor Total"
                            variant="outlined"
                            type="number"
                            disabled
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }}
                            value={(current?.valortotal ?? 0).toFixed(2)} />
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <InputLabel
                            htmlFor="produto-search"
                            sx={{
                                mr: 2
                            }}
                        >Produtos</InputLabel>

                        <IconButton color="primary" aria-label="Remover produto" component="span" disabled={!currentOrcamentoProduto}
                            onClick={() => setDeleteModalVisible(true)}>
                            <Remove />
                        </IconButton>

                        <IconButton color="primary" aria-label="Adicionar produto" component="span" onClick={addProduct}>
                            <Add />
                        </IconButton>

                        <IconButton color="primary" aria-label="Editar produto" component="span" disabled={!currentOrcamentoProduto}
                            onClick={editProduct}>
                            <Edit />
                        </IconButton>
                    </div>

                    <ZGrid
                        rows={allOrcamentosProdutos?.filter(a => a.excluido === 0) ?? []}
                        columns={columns}
                        onRowDoubleClick={editProduct}
                        onRowClick={async (e: any) => await setCurrentOrcamentoProduto(e.row)}
                        height={250}
                    />

                </div>
            </DialogContent>
            <DialogActions>
                {shouldShowLinkButton() && <WarningButton onClick={generateRegisterLink}>
                    Gerar link de cadastro
                </WarningButton>}
                {shouldShowInvoiceButton() && <ReportButton onClick={showInvoiceButton}>
                    Comprovante
                </ReportButton>}
                <NormalButton onClick={onSave} color="primary">
                    Salvar
                </NormalButton>
                <WarningButton onClick={() => props.onClose()} color="secondary">
                    Cancelar
                </WarningButton>
            </DialogActions>
        </Dialog>

        {showModalOrcamentoProduto && <UpsertModalOrcamentoProdutos
            onClose={handleCloseModalOrcamentoProduto}
            orcamentoobservacao={current.observacao}
            current={currentEditingOrcamentoProduto}
        />}

        {deleteModalVisible && <ConfirmationDialog
            title="Excluir produto"
            onConfirm={onConfirmExclusion}
            onClose={() => setDeleteModalVisible(false)}
        />}

        {invoiceVisible && <ReportInvoiceOrcamento
            reportTitle={current.clientenome ? `${current.clientenome} - Orçamento ${current.id}` : 'Solicitação de teste'}
            formTitle={current.clientenome ? `Solicitação de teste - Orçamento ${current.id}` : 'Solicitação de teste'}
            onClose={async () => await setInvoiceVisible(false)}
            content={invoice}
        />}

        {codeModalVisible && <OrcamentoCodeModal
            id={current!.id}
            url={codeUrl}
            onClose={async () => await setCodeModalVisible(false)}
        />}
    </>
}