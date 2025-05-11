import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, Button, CircularProgress } from "@mui/material";
import { NormalButton, ReportButton, WarningButton } from "src/components/buttons";
import { PaperComponent } from "src/components/dialogs";
import { OrcamentoProdutoGrid } from "./orcamentos.contracts";
import { toast } from "react-toastify";
import CorLookup from "../configuracoes/cor/cor-lookup.component";
import ProdutosLookup from "../produtos/produtos-lookup.component";
import { useEffect, useState } from "react";
import ImageUploader from "src/components/image-uploader/image-uploader.component";
import './orcamento.css';
import { ImageDownloader } from "src/components/image-downloader/image-downloader.component";
import { TrelloService } from "src/components/trello/trello.service";
import { OrcamentosService } from "./orcamentos.service";
import { SlackService } from "src/components/slack/slack.service";
import { GetLoggerUser } from "src/infrastructure/helpers";
import ConfigurationService, { ConfigName } from "../configuracoes/config.service";

export interface UpsertModalOrcamentoProdutosProps {
    current?: OrcamentoProdutoGrid,
    orcamentoobservacao?: string,
    onClose: (current?: OrcamentoProdutoGrid) => void
}

export default function UpsertModalOrcamentoProdutos(props: UpsertModalOrcamentoProdutosProps) {
    const isNew = !props.current || !props.current?.id;
    const previous = props.current ?? {} as OrcamentoProdutoGrid;
    const imgHandler = new ImageDownloader();
    const trelloService = new TrelloService();
    const orcamentosService = new OrcamentosService();
    const slackService = new SlackService();
    const configurationService = new ConfigurationService();

    const [isLoadingTrello, setIsLoadingTrello] = useState(false);

    const [current, setCurrent] = useState(props.current ??
        {
            excluido: 0,
            genero: 0
        } as OrcamentoProdutoGrid);

    useEffect(() => {
        loadInfo();
        // eslint-disable-next-line
    }, [props.current]);

    const shouldShowTrelloButton = () => {
        return !isLoadingTrello && !isNew && current.fotoinicialbase64 && current.observacaotecnica2;
    }

    const onSendToTrello = async () => {
        try {
            setIsLoadingTrello(true);

            const configs = await configurationService.getAll();
            const slack_config = await configurationService.get(ConfigName.slack_teste_groupoid, configs);
            const trello_config = await configurationService.get(ConfigName.trello_teste_listaid, configs);

            const cardName = `${current.observacaotecnica2.split('\n')[0]}`;

            if (current.trellocardid) {
                await trelloService.updateCardAsync({
                    id: current.trellocardid,
                    name: cardName,
                    desc: current.observacaotecnica2,
                    listId: trello_config!.valor!
                });

                await updateImages(current.trellocardid, true);
                let message = `Produto *${current.id}* do orçamento *${current.orcamentoid}* atualizado pelo usuário *${GetLoggerUser()}*:`;

                if (previous.observacaotecnica2 !== current.observacaotecnica2) {
                    message += `\n- Mudança na observação técnica\n*ANTES:*\n${previous.observacaotecnica2}\n\n*DEPOIS:*\n${current.observacaotecnica2}`;
                }

                if (previous.fotoinicialbase64 !== current.fotoinicialbase64) {
                    message += `\n- Mudança na foto do cliente 1`;
                }

                if (previous.fotoinicial2base64 !== current.fotoinicial2base64) {
                    message += `\n- Mudança na foto do cliente 2`;
                }

                if (previous.fotorealbase64 !== current.fotorealbase64) {
                    message += `\n- Mudança na foto de produção 1`;
                }

                if (previous.fotoreal2base64 !== current.fotoreal2base64) {
                    message += `\n- Mudança na foto de produção 2`;
                }

                await slackService.sendMessageAsync(message, slack_config!.valor!);

                toast.success('Produto atualizado no Trello com sucesso!');
                return;
            }
            
            const checklist_config = await configurationService.get(ConfigName.trello_teste_checklistitems, configs);

            const cardId = await trelloService.createCardAsync({
                name: cardName,
                desc: current.observacaotecnica2,
                listId: trello_config!.valor!
            });

            if (cardId && current.fotoinicialbase64) {
                await orcamentosService.addTrelloCardId({
                    id: current.orcamentoid,
                    produtoId: current.id,
                    trellocardid: cardId
                });

                await updateImages(cardId);

                if (checklist_config){
                    await trelloService.addCardChecklistAsync(cardId, checklist_config.valor!);
                }

                setCurrent({ ...current, trellocardid: cardId });
                toast.success('Produto sincronizado no Trello com sucesso!');
                await slackService.sendMessageAsync(`Produto *${current.id}* do orçamento *${current.orcamentoid}* sincronizado com teste no trello pelo usuário *${GetLoggerUser()}*:\n${current.observacaotecnica2}.`, slack_config!.valor!);
            }
        }
        finally {
            setIsLoadingTrello(false);
        }
    }

    const updateImages = async (cardId: string, update: boolean = false) => {
        if (cardId && current.fotoinicialbase64) {

            if (update) {
                trelloService.updateAttachmentAsync(cardId, current.fotoinicialbase64, 'Foto do cliente', true);
            }
            else {
                await trelloService.addAttachmentAsync(cardId, current.fotoinicialbase64, 'Foto do cliente', true);
            }

            if (current.fotoinicial2base64) {
                await trelloService.addAttachmentAsync(cardId, current.fotoinicial2base64, 'Foto do cliente 2');
            }

            if (current.fotorealbase64) {
                await trelloService.addAttachmentAsync(cardId, current.fotorealbase64, 'Foto da produção 1');
            }

            if (current.fotoreal2base64) {
                await trelloService.addAttachmentAsync(cardId, current.fotoreal2base64, 'Foto da produção 2');
            }
        }
    }

    const loadInfo = async () => {
        if (!props.current) return;

        let req = { ...current };


        req['fotoinicialbase64'] = await imgHandler.downloadOnFront(current.fotoinicial);

        req['fotoinicial2base64'] = await imgHandler.downloadOnFront(current.fotoinicial2);

        req['fotorealbase64'] = await imgHandler.downloadOnFront(current.fotoreal);

        req['fotoreal2base64'] = await imgHandler.downloadOnFront(current.fotoreal2);

        setCurrent(req);
    }

    const onSave = async () => {
        try {
            if (!formValidado()) {
                toast.error(`Existem campos obrigatórios não preenchidos.`);
                return;
            }

            props.onClose(current);
        } catch (error: any) {
            toast.error(error);
        }
        finally {
        }
    }

    const formValidado = () => current.corid && current.produtoid && current.quantidade;

    const [dragFrom, setDragFrom] = useState<{ id: string }>({} as { id: string });
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

    const addImage = async (id: string, data: any) => {
        let localCurrent = { ...current };

        localCurrent[id as never] = undefined as never;
        localCurrent[`${id}base64` as never] = data as never;

        await setCurrent(localCurrent);
    }

    const cleanImage = async (nome: string) => {
        let localCurrent = { ...current };
        localCurrent[nome as never] = null as never;
        localCurrent[`${nome}base64` as never] = undefined as never;

        await setCurrent(localCurrent);
    }

    const getTextFromOrcamento = async () => {
        await setCurrent({ ...current, observacaotecnica1: props.orcamentoobservacao ?? '' });
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
                    flexDirection: 'column'
                }}>
                    <div style={{
                        display: 'flex',
                        width: '-webkit-fill-available',
                        gap: '10px'
                    }}>
                        <ProdutosLookup
                            sx={{
                                minWidth: '80%',
                                marginBottom: 5,
                            }}
                            onChange={async (c) => {
                                const local: OrcamentoProdutoGrid = {
                                    ...current,
                                    produtoid: c?.id ?? 0,
                                    produtodescricao: c?.descricao ?? '',
                                    produtovalor: parseFloat(c?.valorunitario ?? '0')
                                };
                                await setCurrent(local);
                            }}

                            selectedId={current?.produtoid}
                        />
                        <CorLookup
                            sx={{
                                minWidth: '80%',
                                marginBottom: 5,
                            }}
                            style={{
                                width: '80%'
                            }}
                            onChange={async (c) => {
                                const local: OrcamentoProdutoGrid = {
                                    ...current,
                                    corid: c?.id ?? 0,
                                    cornome: c?.nome ?? ''
                                };

                                await setCurrent(local);
                            }}
                            selectedId={current?.corid}
                        />

                    </div>
                    <div className="orcamento-container">
                        <TextField
                            className='txt-box'
                            id="quantidade"
                            label="Quantidade"
                            variant="outlined"
                            type="number"
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
                    <div className="orcamento-container" style={{ gap: '33%' }}>
                        <InputLabel
                            htmlFor="cliente-search"
                            style={{ marginTop: 12 }}
                        >Fotos do Cliente</InputLabel>
                        <InputLabel
                            htmlFor="cliente-search"
                            style={{ marginTop: 12 }}
                        >Fotos de Produção</InputLabel>
                    </div>
                    <div className='orcamento-container' style={{
                        justifyContent: 'space-between',
                        marginBottom: '15px'
                    }}>
                        <ImageUploader
                            id="fotoinicial"
                            onChange={addImage}
                            onClickImage={(e) => cleanImage(e)}
                            photo={current.fotoinicialbase64}
                            handleDrag={handleDrag}
                            handleDrop={handleDrop}
                        />
                        <ImageUploader
                            id="fotoreal"
                            onChange={addImage}
                            onClickImage={(e) => cleanImage(e)}
                            photo={current.fotorealbase64}
                            handleDrag={handleDrag}
                            handleDrop={handleDrop}
                        />
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end'
                        }}>
                            <Button onClick={getTextFromOrcamento} color="secondary" style={{
                                fontSize: '9px',
                                marginBottom: '15px',
                            }}>
                                Puxar obs. do orçamento
                            </Button>
                            <TextField
                                id="observacaotecnica1"
                                label="Observação do cliente"
                                variant="outlined"
                                value={current.observacaotecnica1}
                                InputLabelProps={{ shrink: true }}
                                onChange={(e) => setCurrent({ ...current, observacaotecnica1: e.target.value })}
                                multiline
                                rows={10}
                                sx={{
                                    width: '300px'
                                }} />
                        </div>
                    </div>
                    <div className='orcamento-container' style={{
                        justifyContent: 'space-between'
                    }}>
                        <ImageUploader
                            id="fotoinicial2"
                            onChange={addImage}
                            onClickImage={(e) => cleanImage(e)}
                            photo={current.fotoinicial2base64}
                            handleDrag={handleDrag}
                            handleDrop={handleDrop}
                        />
                        <ImageUploader
                            id="fotoreal2"
                            onChange={addImage}
                            onClickImage={(e) => cleanImage(e)}
                            photo={current.fotoreal2base64}
                            handleDrag={handleDrag}
                            handleDrop={handleDrop}
                        />

                        <TextField
                            id="observacaotecnica2"
                            label="Observação interna"
                            variant="outlined"
                            value={current.observacaotecnica2}
                            InputLabelProps={{ shrink: true }}
                            onChange={(e) => setCurrent({ ...current, observacaotecnica2: e.target.value })}
                            multiline
                            rows={10}
                            sx={{
                                width: '300px'
                            }} />
                    </div>
                </div>
            </DialogContent>
            <DialogActions>
                {shouldShowTrelloButton() && <ReportButton onClick={onSendToTrello}>
                    {current.trellocardid ? 'Atualizar no Trello' : 'Enviar para o Trello'}
                </ReportButton>}
                {isLoadingTrello && <CircularProgress
                    variant="indeterminate"
                    disableShrink
                    style={{
                        color: '#1a90ff',
                        animationDuration: '550ms',
                        left: 0
                    }}
                    size={40}
                    thickness={4}
                    {...props}
                />}
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