import './index.css';
import { NormalButton, WarningButton, ReportButton } from '../buttons';
import { useTheme } from '@emotion/react';

interface ButtonsLineProps {
    newEnabled?:boolean,
    editEnabled?:boolean,
    excludeEnabled?:boolean,
    excludeHidden?:boolean,
    reportVisible?:boolean,
    onNewClick?: () => void,
    onEditClick?: () => void,
    onExcludeClick?: () => void,
    onReportClick?: () => void,
}

export default function ButtonsLine(props: ButtonsLineProps){
    const theme = useTheme();
    return <div className='buttons-container'>
            <NormalButton theme={theme} onClick={props.onNewClick} disabled={!!props.newEnabled}>Novo</NormalButton>
            <NormalButton onClick={props.onEditClick} disabled={!!props.editEnabled}>Editar</NormalButton>

            {props.reportVisible && <ReportButton onClick={props.onReportClick}>Relatório</ReportButton>}
            
            {!props.excludeHidden && <WarningButton onClick={props.onExcludeClick} disabled={!!props.excludeEnabled}>Excluir</WarningButton>}
    </div>
}