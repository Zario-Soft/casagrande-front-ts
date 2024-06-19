import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { NormalButton, WarningButton } from "src/components/buttons";
import { PaperComponent } from "src/components/dialogs";
import OrcamentosService from "./orcamentos.service";
import { OrcamentoProdutoGrid } from "./orcamentos.contracts";
import { toast } from "react-toastify";


export interface UpsertModalOrcamentoProdutosProps {
    current?: OrcamentoProdutoGrid,
    onClose: (message?: string) => void
}

export default function UpsertModalOrcamentoProdutos(props: UpsertModalOrcamentoProdutosProps) {
    const isNew = !props.current || !props.current?.id;
    const orcamentosService = new OrcamentosService();

    const onSave = async () => {
        try {
        } catch (error: any) {
            toast.error(error);
        }
        finally {
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
                {isNew ? 'Novo Orçamento' : `Editando Orçamento '${props.current!.id}'`}
            </DialogTitle>
            <DialogContent>
                <div className='flex-container' style={{
                    display: 'flex',
                }}>
                    
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