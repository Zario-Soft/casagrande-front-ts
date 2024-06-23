import { Dialog, DialogTitle, DialogContent, Grid, DialogActions, Button } from "@mui/material";
import { ToastContainer } from "react-toastify";
import { PaperComponent } from "src/components/dialogs";
import { ReportContent } from "src/components/report/report.interfaces";
import Report from "src/components/report/report.component";

interface ReportControlDialogProps {
    formTitle?: string,
    onClose: () => Promise<void>,
    onLoadContent: () => Promise<ReportContent>,
}

export default function ReportInvoiceOrcamento(props: ReportControlDialogProps){
    return <>
    <Dialog
        open
        maxWidth="lg"
        fullWidth
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
    >
        <DialogTitle id="draggable-dialog-title" style={{ cursor: 'move' }}>{props.formTitle ?? `Relatorio`}</DialogTitle>
        <DialogContent>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    {document && <Report
                    key={'report-key'}
                    title={"Solicitação de Teste"}
                    onLoadContent={props.onLoadContent}
                    />}
                </Grid>
            </Grid>
            <DialogActions>
                <Button onClick={props.onClose} color="secondary">
                    Fechar
                </Button>
            </DialogActions>
        </DialogContent>
    </Dialog>

    <ToastContainer />
</>
}