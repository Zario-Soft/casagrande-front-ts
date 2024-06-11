import './index.css';
import { NormalButton, WarningButton, GreenButton } from '../buttons';

interface ButtonsLineProps {
    newEnabled?:boolean,
    editEnabled?:boolean,
    excludeEnabled?:boolean,
    reportVisible?:boolean,
    onNewClick?: () => void,
    onEditClick?: () => void,
    onExcludeClick?: () => void,
    onReportClick?: () => void,
}

export default function ButtonsLine(props: ButtonsLineProps){
    return <div className='buttons-container'>
            <NormalButton onClick={props.onNewClick} disabled={!!props.newEnabled}>Novo</NormalButton>
            <NormalButton onClick={props.onEditClick} disabled={!!props.editEnabled}>Editar</NormalButton>

            {props.reportVisible && <GreenButton onClick={props.onReportClick}>Relatório</GreenButton>}
            
            <WarningButton onClick={props.onExcludeClick} disabled={!!props.excludeEnabled}>Excluir</WarningButton>
    </div>
}