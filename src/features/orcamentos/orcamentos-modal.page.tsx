import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Checkbox, FormControlLabel, FormControl, InputLabel, Select, IconButton } from "@mui/material";
import { NormalButton, WarningButton } from "src/components/buttons";
import { PaperComponent } from "src/components/dialogs";
import { useState } from "react";
import { toast } from "react-toastify";
import ProdutosService from "./orcamentos.service";
import { OrcamentoDTO, OrcamentoProdutoDTO, StatusOrcamento } from "./orcamentos.contracts";
import ClientesLookup from "../clientes/clientes-lookup.component";
import { Remove, Add, Edit } from "@mui/icons-material";

export interface UpsertModalProductProps {
    produto?: OrcamentoDTO,
    onClose: (message?: string) => void
}

export default function UpsertModalProduct(props: UpsertModalProductProps) {
    const isNew = !props.produto || !props.produto?.id;
    const produtosService = new ProdutosService();

    const [current, setCurrent] = useState(props.produto ?? {} as OrcamentoDTO);
    const [currentOrcamentoProduto, setCurrentOrcamentoProduto] = useState<OrcamentoProdutoDTO>();
    const [currentEditingOrcamentoProduto, setCurrentEditingOrcamentoProduto] = useState<OrcamentoProdutoDTO>();
    const [allOrcamentosProdutos, setAllOrcamentosProdutos] = useState<OrcamentoProdutoDTO[]>([]);

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [showModalOrcamentoProduto, setShowModalOrcamentoProduto] = useState(false);

    const onSave = async () => {
        try {
            if (!await isSavingValid()) return;

            if (isNew) {

                await produtosService.new(current);

                await props.onClose("Registro criado com sucesso");
            }
            else {
                await produtosService.edit(current);

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

    const handleFrete = async (e: any) => {
        let vlTotal = calculateTotalValue({ ...current, frete: e.target.value });

        await setCurrent({ ...current, frete: e.target.value, valortotal: vlTotal });
    }

    const calculateTotalValue = (obj?: OrcamentoDTO): number => {
        let vlTotal = obj?.frete ?? current?.frete ?? 0;
        let orcamentoProdutos = obj && obj.allOrcamentosProdutos ? obj.allOrcamentosProdutos : allOrcamentosProdutos;

        let somaProdutos = orcamentoProdutos && orcamentoProdutos.filter(f => f.excluido === 0).length
            ? orcamentoProdutos
                .filter(f => f.excluido === 0).map(m => m.quantidade * m.produtovalor)
                .reduce((a, b) => a + b)
            : 0;

        if (isNaN(vlTotal))
            return 0;

        return vlTotal + (isNaN(somaProdutos) ? 0 : somaProdutos);
    }

    async function addProduct() {
        //clear client
        await setCurrentOrcamentoProduto(undefined);

        await setCurrentEditingOrcamentoProduto(undefined);
        await setCurrentEditingOrcamentoProduto({} as OrcamentoProdutoDTO);

        await setShowModalOrcamentoProduto(true);
    }

    async function editProduct(e: any) {
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

                }}>
                    <ClientesLookup
                        sx={{
                            width: '70%',
                            marginBottom: 5
                        }}
                        onChange={async (c) => {
                            const local = { ...current, clienteid: c?.id ?? 0 };
                            console.log(local)
                            await setCurrent(local);
                        }}
                    />
                    <TextField
                        id="dataorcamento"
                        label="Data"
                        variant="outlined"
                        type="date"
                        value={current.dataorcamento}
                        onChange={(e) => setCurrent({ ...current, dataorcamento: e.target.value })}

                        InputLabelProps={{ shrink: true }}
                        style={{ marginRight: '8px' }}
                    />

                    <TextField
                        id="dataenvioteste"
                        label="Data de envio do teste"
                        variant="outlined"
                        type="date"
                        value={current.dataenvioteste}
                        onChange={(e) => setCurrent({ ...current, dataenvioteste: e.target.value })}

                        InputLabelProps={{ shrink: true }}
                    />
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
                        display: 'flex'

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

                    <div className={'grid-buttons'}>
                        <InputLabel
                            htmlFor="produto-search"
                            style={{ marginTop: 12, marginBottom: 12 }}
                        >Produtos</InputLabel>

                        <IconButton color="primary" aria-label="Remover produto" component="span" disabled={!currentOrcamentoProduto}
                            onClick={() => setDeleteModalVisible(true)}
                            style={{ marginLeft: 70, marginTop: -62 }}>
                            <Remove />
                        </IconButton>

                        <IconButton color="primary" aria-label="Adicionar produto" component="span" onClick={addProduct}
                            style={{ marginLeft: 0, marginTop: -62 }}>
                            <Add />
                        </IconButton>

                        <IconButton color="primary" aria-label="Editar produto" component="span" disabled={!currentOrcamentoProduto}
                            onClick={editProduct}
                            style={{ marginLeft: 0, marginTop: -62 }}>
                            <Edit />
                        </IconButton>
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