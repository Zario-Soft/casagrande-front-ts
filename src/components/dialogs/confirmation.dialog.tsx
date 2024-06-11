import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Typography } from "@mui/material";
import { PaperComponent } from "./papercomponent";

interface ConfirmationDialogProps {
    title?: string;
    text?: string;
    onConfirm: () => void;
    onClose: () => void;
}

export default function ConfirmationDialog(props: ConfirmationDialogProps) {
    const onConfirm = async () => {
        await props.onConfirm();
        await props.onClose();
    }

    return <Dialog
        open
        maxWidth={"lg"}
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
    >
        <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">{props.title ?? "Deseja realmente prosseguir com a ação?"}</DialogTitle>
        <DialogContent>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                        {props.text ?? "Ao prosseguir, a ação não poderá ser desfeita via sistema."}
                    </Typography>
                </Grid>
            </Grid>
            <DialogActions>
                <Button onClick={onConfirm} color="primary">
                    Prosseguir
                </Button>
                <Button onClick={props.onClose} color="secondary">
                    Cancelar
                </Button>
            </DialogActions>
        </DialogContent>
    </Dialog>
}