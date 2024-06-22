import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, FormControl, InputLabel, Select, IconButton } from "@mui/material";
import { NormalButton, WarningButton } from "src/components/buttons";
import { PaperComponent } from "src/components/dialogs";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import OrcamentosService from "./orcamentos.service";
import { OrcamentoDTO, OrcamentoUpsertRequest, OrcamentoProdutoGrid, StatusOrcamento, OrcamentoProdutoDTO } from "./orcamentos.contracts";
import ClientesLookup from "../clientes/clientes-lookup.component";
import { Remove, Add, Edit } from "@mui/icons-material";
import ZGrid, { ZGridColDef } from "src/components/z-grid";
import UpsertModalOrcamentoProdutos from "./orcamento-produtos.modal.page";
import ConfirmationDialog from "src/components/dialogs/confirmation.dialog";
import moment from "moment";

const columns: ZGridColDef[] = [
    { field: 'id', headerName: 'ID', width: 50, hide: true },
    { field: 'produtodescricao', headerName: 'Produto', width: 290 },
    { field: 'quantidade', headerName: 'Quantidade', width: 150 },
    { field: 'cornome', headerName: 'Cor', width: 150 },
    { field: 'generodescricao', headerName: 'Gênero', width: 150 }
]

export interface UpsertModalProps {
    orcamento?: OrcamentoDTO,
    onClose: (message?: string) => void
}

export default function UpsertModalOrcamento(props: UpsertModalProps) {
    const isNew = !props.orcamento || !props.orcamento?.id;
    const orcamentosService = new OrcamentosService();

    const [current, setCurrent] = useState(
        props.orcamento ??
        {
            valortotal: 0,
            excluido: 0,
            status: 0
        } as unknown as OrcamentoDTO);
    const [currentOrcamentoProduto, setCurrentOrcamentoProduto] = useState<OrcamentoProdutoGrid>();
    const [currentEditingOrcamentoProduto, setCurrentEditingOrcamentoProduto] = useState<OrcamentoProdutoGrid>();
    const [allOrcamentosProdutos, setAllOrcamentosProdutos] = useState<OrcamentoProdutoGrid[] | undefined>();

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [showModalOrcamentoProduto, setShowModalOrcamentoProduto] = useState(false);

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
                const localOrcamentoProdutos = data.map(p => {
                    return {
                        cornome: p.cornome,
                        generodescricao: p.generodescricao,
                        produtodescricao: p.produtodescricao,
                        produtovalor: p.produtovalor,
                        ...p.orcamentoproduto
                    }
                });

                await setAllOrcamentosProdutos(localOrcamentoProdutos);

                await handleFrete({
                    target: {
                        value: orcamento.frete
                    }
                }, localOrcamentoProdutos)
            }
        } catch (e) {
            toast.error(`Não foi possivel carregar os produtos do orçamento: ${e}`);
        }
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

            await setAllOrcamentosProdutos(localOrcamentoProdutos);
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

            const newAllOrcamentoProdutos = [...localOrcamentoProdutos, newOrcamentoProduto];

            await setAllOrcamentosProdutos(newAllOrcamentoProdutos);

            let vlTotal = calculateTotalValue(current, newAllOrcamentoProdutos);
            await setCurrent({ ...current, valortotal: vlTotal });
        }

        await setShowModalOrcamentoProduto(false);
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
                            const local = { ...current, clienteid: c?.id ?? 0 };
                            console.log(local)
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
                            rows={8}
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
    </>
}