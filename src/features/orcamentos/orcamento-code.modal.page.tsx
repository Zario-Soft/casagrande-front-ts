import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, IconButton } from "@mui/material"
import { WarningButton } from "src/components/buttons"
import { PaperComponent } from "src/components/dialogs"
import { ContentCopy } from "@mui/icons-material"
import { toast } from "react-toastify"

export interface OrcamentoCodeModalProps {
    url: string,
    id: number,
    onClose: () => void,
}

export default function OrcamentoCodeModal(props: OrcamentoCodeModalProps) {
    const { onClose } = props;

    return <>
        <Dialog
            open
            maxWidth="lg"
            fullWidth
            aria-labelledby="draggable-dialog-title"
            PaperComponent={PaperComponent}
        >
            <DialogTitle id="draggable-dialog-title" style={{ cursor: 'move' }}>
                {`Novo Link para Orçamento ${props.id}`}
            </DialogTitle>
            <DialogContent sx={{
                display: 'flex',
                justifyContent: 'center'
            }}>
                {props.url && <div style={{
                    display: 'flex',
                    maxWidth: '600px',
                    marginTop: '20px'
                }}>
                    <TextField
                        className='txt-box txt-box-big'
                        id="nome"
                        label="Nome"
                        variant="outlined"
                        value={props.url}
                        sx={{
                            width: '600px'
                        }}
                    />
                    <IconButton color="primary" aria-label="Copiar texto" component="span" onClick={() => {
                        navigator.clipboard.writeText(props.url);
                        toast.success('Link copiado com sucesso!');
                    }}
                        style={{ marginTop: -5 }}>
                        <ContentCopy />
                    </IconButton>
                </div>}
            </DialogContent>
            <DialogActions>
                <WarningButton onClick={() => onClose()} color="secondary">
                    Fechar
                </WarningButton>
            </DialogActions>
        </Dialog>
    </>
}