import { useState } from "react"
import { ClienteInvoiceData } from "../clientes.contracts";

export interface ClienteExternalInvoiceDataPartProps {
    current?: ClienteInvoiceData
}

export default function ClienteExternalInvoiceDataPart(props : ClienteExternalInvoiceDataPartProps){
    const [current, setCurrent] = useState<ClienteInvoiceData | undefined>(props.current);
    
    return <>Invoice data</>
}