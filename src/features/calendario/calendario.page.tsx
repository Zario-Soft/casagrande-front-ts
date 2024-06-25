import { useContext, useEffect, useState } from "react";
import ScreenHeader from "src/components/screen-header";
import { SideBar } from "src/components/sidebar";
import { VendaDTO } from "../vendas/vendas.contracts";
import moment from "moment";
import { FastRewind, Cached, FastForward } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { toast } from "react-toastify";
import { LoadingContext } from "src/providers/loading.provider";
import CalendarioService from "./calendario.service";
import { CalendarioResponse } from "./calendario.contracts";
import CalendarItem from "./components/calendar-item.component";
import VendasService from "../vendas/vendas.service";
import { useSearchParams } from "react-router-dom";
import UpsertModalVendas from "../vendas/vendas-modal.page";

export default function Calendario() {
    const [searchParams] = useSearchParams();
    const firstAmount = parseInt(searchParams.get("amount") ?? '0');

    console.log('firstAmount');
    console.log(firstAmount);
    const calendarioService = new CalendarioService();
    const vendasService = new VendasService();

    const [title, setTitle] = useState<string>(moment().format('MMM [de] YYYY'));
    const [navigation, setNavigation] = useState({ amount: firstAmount });
    const [currentVenda, setCurrentVenda] = useState<VendaDTO>();
    const [showModalVenda, setShowModalVenda] = useState(false);
    const [current, setCurrent] = useState<CalendarioResponse>();

    const { setIsLoading } = useContext(LoadingContext);

    useEffect(() => {
        search(navigation.amount);
        // eslint-disable-next-line
    }, []);

    async function search(amount?: number) {
        try {
            await setIsLoading(true);

            const data = await calendarioService.getAll(amount ?? navigation.amount);

            console.log(data);

            if (data) {
                await setCurrent(data);
                await setTitle(data.titulo);
            }

        } catch (e) {
            toast.error(`Não foi possivel carregar a lista de pedidos.`);
        }

        await setIsLoading(false);
    }

    async function next() {
        const newAmountValue = navigation.amount + 1;
        await refreshNavigation(newAmountValue);
    }

    async function back() {
        const newAmountValue = navigation.amount - 1;
        await refreshNavigation(newAmountValue);
    }

    const refreshNavigation = async (newAmountValue: number) => {
        await setNavigation({ ...navigation, amount: newAmountValue });
        searchParams.set("amount", newAmountValue.toString())

        await search(newAmountValue);
    }


    async function onCalendarDoubleClick(e: any) {
        await setIsLoading(true);

        const vendaId = parseInt(e.target.innerHTML.split(' ')[0]);

        const data = await vendasService.getById(vendaId);

        if (data) {
            await setCurrentVenda(data);
            await setShowModalVenda(true);
        }

        await setIsLoading(false);
    }

    return <>
        <div className="page-container">
            <SideBar>
                <div className="page-content">
                    <ScreenHeader
                        title={`Calendário de Entregas - ${title}`}
                        hideUpdateButton />

                    {/* Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <IconButton color="primary" aria-label="Uma semana atrás" component="span" onClick={back}>
                            <FastRewind />
                        </IconButton>

                        <IconButton color="primary" aria-label="Atualizar" component="span" onClick={() => search(navigation.amount)}>
                            <Cached />
                        </IconButton>

                        <IconButton color="primary" aria-label="Uma semana adiante" component="span" onClick={next}>
                            <FastForward />
                        </IconButton>

                    </div>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '10px'

                    }}>
                        {current && current.datas && current.datas.map((data, key) => {
                            return <CalendarItem
                                key={key}
                                titulo={data.titulo}
                                itens={data.itens}
                                onDoubleClick={onCalendarDoubleClick}
                            />
                        })
                        }
                    </div>
                </div>
            </SideBar>
        </div>

        {showModalVenda && <UpsertModalVendas
            current={currentVenda}
            onClose={async (message: string | undefined) => {
                if (message) {
                    await toast.success(message);
                    await search();
                }

                await setShowModalVenda(false);
            }}
        />}
    </>
}