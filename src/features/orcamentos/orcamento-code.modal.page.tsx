import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, IconButton } from "@mui/material"
import { WarningButton } from "src/components/buttons"
import { PaperComponent } from "src/components/dialogs"
import { OrcamentoGrid } from "./orcamentos.contracts"
import { useMemo, useState } from "react"
import OrcamentosService from "./orcamentos.service"
import { nanoid } from "nanoid"
import { ContentCopy } from "@mui/icons-material"
import { toast } from "react-toastify"

export interface OrcamentoCodeModalProps {
    current?: OrcamentoGrid,
    onClose: () => void,
}

export default function OrcamentoCodeModal(props: OrcamentoCodeModalProps) {
    const { current, onClose } = props;
    const [codeUrl, setCodeUrl] = useState<string>('');


    useMemo(() => {
        const orcamentoService = new OrcamentosService();
        const newCode = nanoid(5);

        orcamentoService.addCode({
            id: current!.id,
            code: newCode
        });

        setCodeUrl(`${window.location.host}/fill-data?code=${newCode}`);
    }, [current]);

    return <>
        <Dialog
            open
            maxWidth="lg"
            fullWidth
            aria-labelledby="draggable-dialog-title"
            PaperComponent={PaperComponent}
        >
            <DialogTitle id="draggable-dialog-title" style={{ cursor: 'move' }}>
                {`Novo Link para Orçamento ${current!.id}`}
            </DialogTitle>
            <DialogContent sx={{
                display: 'flex',
                justifyContent: 'center'
            }}>
                {codeUrl && <div style={{
                    display: 'flex',
                    maxWidth: '600px',
                    marginTop: '20px'
                }}>
                    <TextField
                        className='txt-box txt-box-big'
                        id="nome"
                        label="Nome"
                        variant="outlined"
                        value={codeUrl}
                        sx={{
                            width: '600px'
                        }}
                    />
                    <IconButton color="primary" aria-label="Copiar texto" component="span" onClick={() => {
                        navigator.clipboard.writeText(codeUrl);
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