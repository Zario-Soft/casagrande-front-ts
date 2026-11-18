import { useEffect, useState } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { isAutomationBlocked, subscribeAutomationBlocked } from "../../infrastructure/automation-guard";

export default function AutomationBlockedDialog() {
    const [open, setOpen] = useState(isAutomationBlocked());

    useEffect(() => subscribeAutomationBlocked(() => setOpen(true)), []);

    return <Dialog
        open={open}
        maxWidth={"sm"}
        fullWidth
        disableEscapeKeyDown
        aria-labelledby="automation-blocked-dialog-title"
    >
        <DialogTitle id="automation-blocked-dialog-title">Uso de automação detectado</DialogTitle>
        <DialogContent>
            <Alert severity="error" sx={{ mb: 2 }}>
                É proibido utilizar Inteligência Artificial, bots ou qualquer ferramenta de automação neste sistema interno.
            </Alert>
            <Typography variant="body2">
                O sistema detectou atividade automatizada nesta sessão. Esta prática é ilegal e viola as políticas
                de uso da empresa. Encerre imediatamente qualquer ferramenta de automação em uso.
            </Typography>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpen(false)} color="error" variant="contained">
                Estou ciente
            </Button>
        </DialogActions>
    </Dialog>
}
