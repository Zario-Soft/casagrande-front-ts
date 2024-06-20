import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select } from "@mui/material";
import { NormalButton, WarningButton } from "src/components/buttons";
import { PaperComponent } from "src/components/dialogs";
import OrcamentosService from "./orcamentos.service";
import { OrcamentoProdutoGrid } from "./orcamentos.contracts";
import { toast } from "react-toastify";
import CorLookup from "../cor/cor-lookup.component";
import ProdutosLookup from "../produtos/produtos-lookup.component";
import { useState } from "react";
import ImageUploader from "src/components/image-uploader/image-uploader.component";
import { NoResultsOverlayPropsOverrides } from "@mui/x-data-grid";


export interface UpsertModalOrcamentoProdutosProps {
    current?: OrcamentoProdutoGrid,
    onClose: (message?: string) => void
}

export default function UpsertModalOrcamentoProdutos(props: UpsertModalOrcamentoProdutosProps) {
    const isNew = !props.current || !props.current?.id;
    const orcamentosService = new OrcamentosService();

    const [current, setCurrent] = useState(props.current ?? {} as OrcamentoProdutoGrid);

    const onSave = async () => {
        try {
        } catch (error: any) {
            toast.error(error);
        }
        finally {
        }
    }

    const [dragFrom, setDragFrom] = useState<{id: string}>({} as {id: string});
    const handleDrag = async (e: any) => {
        await setDragFrom(e);
    }

    const handleDrop = async (to: any) => {
        const base64ImageNameTo = `${to.id}base64`;
        const base64ImageNameFrom = `${dragFrom.id}base64`;

        let localCurrent = { ...current };

        const keybase64ImageNameTo = base64ImageNameTo as keyof {};
        const keybase64ImageNameFrom = base64ImageNameFrom as keyof {};
        localCurrent[keybase64ImageNameTo] = localCurrent[keybase64ImageNameFrom];
        localCurrent[keybase64ImageNameFrom] = undefined as never;

        await setCurrent(localCurrent);
    }

    async function addImage(e: any) {
        let localCurrent = { ...current };

        localCurrent[e.id as never] = undefined as never;
        localCurrent[`${e.id}base64` as never] = e.data as never;

        await setCurrent(localCurrent);
    }

    async function cleanImage(nome: string) {
        let localCurrent = { ...current };
        localCurrent[nome as never] = null as never;
        localCurrent[`${nome}base64` as never] = undefined as never;

        await setCurrent(localCurrent);
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
                {isNew ? 'Novo Produto ao Orçamento' : `Editando Produto '${props.current!.id}' do Orçamento`}
            </DialogTitle>
            <DialogContent>
                <div className='flex-container' style={{
                    display: 'flex',
                }}>
                    <div style={{
                        display: 'flex',
                        width: '95%',
                        gap: '10px'
                    }}>
                        <ProdutosLookup
                            sx={{
                                minWidth: '90%',
                                marginBottom: 5,
                            }}
                            onChange={async (c) => {
                                const local = { ...current, produtoid: c?.id ?? 0 };
                                console.log(local)
                                await setCurrent(local);
                            }}
                            selectedId={current?.produtoid}
                        />
                        <CorLookup
                            sx={{
                                minWidth: '50%',
                                marginBottom: 5,
                            }}
                            onChange={async (c) => {
                                const local = { ...current, corid: c?.id ?? 0 };
                                console.log(local)
                                await setCurrent(local);
                            }}
                            selectedId={current?.corid}
                        />

                    </div>
                    <div className='inner-flex-container'>
                        <TextField
                            className='txt-box'
                            id="quantidade"
                            label="Quantidade"
                            variant="outlined"
                            type="number"
                            fullWidth
                            value={current.quantidade}
                            InputLabelProps={{ shrink: true }}
                            onChange={(e) => setCurrent({ ...current, quantidade: parseInt(e.target.value) })} />
                        <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                            <InputLabel
                                htmlFor="sexo-id"
                                id="sexo"
                                shrink>Sexo</InputLabel>
                            <Select
                                native
                                label="Sexo"
                                fullWidth
                                value={current.genero}
                                onChange={async (e) => await setCurrent({ ...current, genero: parseInt(e.target.value as unknown as string) })}
                                inputProps={{
                                    name: 'sexo',
                                    id: 'sexo-orcamento-id'
                                }}
                            >
                                <option value={0}>Masculino</option>
                                <option value={1}>Feminino</option>
                            </Select>
                        </FormControl>
                    </div>
                    <div className='inner-flex-container'>
                        <InputLabel
                            htmlFor="cliente-search"
                            style={{ marginTop: 12 }}
                        >Fotos do Cliente</InputLabel>
                        <InputLabel
                            htmlFor="cliente-search"
                            style={{ marginTop: 12 }}
                        >Fotos de Produção</InputLabel>
                    </div>
                    <div className='inner-flex-container'>
                        <ImageUploader
                            id="fotoinicial"
                            onChange={(e) => addImage(e)}
                            onClickImage={(e) => cleanImage(e)}
                            photo={current.fotoinicialbase64}
                            handleDrag={handleDrag}
                            handleDrop={handleDrop}
                        />
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