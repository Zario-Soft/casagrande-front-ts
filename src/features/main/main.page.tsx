import moment from "moment";
import { SideBar } from "src/components/sidebar";
import TopBar from "src/components/top-bar/top-bar.index";

export default function Main() {
    return (<>
        <SideBar>
            <TopBar />
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '-webkit-fill-available',
                position: 'absolute',
                padding: '60px'
            }}>
                <h1>Bem-vindo(a)</h1>
                <p>Hoje é {moment().format("DD/MM/YYYY")}</p>
            </div>
        </SideBar>
    </>);
}