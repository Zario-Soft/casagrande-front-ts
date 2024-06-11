import loading from "../../assets/tenor.gif";
import './index.css';

interface LoaderProps {
    isLoading: boolean
}

export function Loader({ isLoading } : LoaderProps) {
    return <>
    {isLoading && <div className="loader-container">
        <div className="loader">            
            <img src={loading} alt='Imagem carregando as informações' width={100} height={100} />
        </div>
    </div>}

    </>
}