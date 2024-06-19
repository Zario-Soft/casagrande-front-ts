import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, FormControl, InputLabel, Select, IconButton } from "@mui/material";
import { NormalButton, WarningButton } from "src/components/buttons";
import { PaperComponent } from "src/components/dialogs";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import OrcamentosService from "./orcamentos.service";
import { OrcamentoDTO, OrcamentoProdutoGrid, OrcamentoProdutoResponse, StatusOrcamento } from "./orcamentos.contracts";
import ClientesLookup from "../clientes/clientes-lookup.component";
import { Remove, Add, Edit } from "@mui/icons-material";
import ZGrid, { ZGridColDef } from "src/components/z-grid";
import UpsertModalOrcamentoProdutos from "./orcamento-produtos.modal.page";
import ConfirmationDialog from "src/components/dialogs/confirmation.dialog";

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

    const [current, setCurrent] = useState(props.orcamento ?? {} as OrcamentoDTO);
    const [currentOrcamentoProduto, setCurrentOrcamentoProduto] = useState<OrcamentoProdutoResponse>();
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

            if (isNew) {

                await orcamentosService.new(current);

                await props.onClose("Registro criado com sucesso");
            }
            else {
                await orcamentosService.edit(current);

                await props.onClose("Registro alterado com sucesso");
            }

        } catch (error: any) {
            toast.error(error);
        }
        finally {
        }
    }

    const isSavingValid = async (): Promise<boolean> => {
        if (!current.clienteid) {
            await toast.error('Preencha o cliente');
            return false;
        }

        return true;
    }

    const handleFrete = async (e: any, orcProds?: OrcamentoProdutoGrid[]) => {
        const localFrete = isNaN(e.target.value) ? 0 : e.target.value;

        const localCurrent = { ...current, frete: parseFloat(localFrete) };
        let vlTotal = calculateTotalValue(localCurrent, orcProds);

        await setCurrent({ ...localCurrent, valortotal: vlTotal.toFixed(2) });
    }

    const calculateTotalValue = (obj: OrcamentoDTO, orcProds?: OrcamentoProdutoGrid[]): number => {
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
        // if (!selected) return;

        // await orcamentosService.delete(selected.id);

        // await refresh();

        toast.success("Registro excluído com sucesso");
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
                            value={current.dataorcamento}
                            onChange={(e) => setCurrent({ ...current, dataorcamento: e.target.value })}

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
                                onChange={async (e) => await setCurrent({ ...current, status: e.target.value as unknown as number })}
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
                            value={current.valortotal} />
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
            onClose={(message?: string) => setShowModalOrcamentoProduto(false)}
            current={currentEditingOrcamentoProduto}
        />}

        {deleteModalVisible && <ConfirmationDialog
            title="Excluir produto"
            onConfirm={onConfirmExclusion}
            onClose={() => setDeleteModalVisible(false)}
        />}
    </>
}