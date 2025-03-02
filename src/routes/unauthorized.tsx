import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import TopBar from "src/components/top-bar/top-bar.index";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (<>
    <TopBar />
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>

      <h1>Ops!</h1>
      <p>Você não tem permissão para acessar esta página!</p>
      <Button onClick={() => navigate('/login')}>Fazer login com outro usuário</Button>
      <Button onClick={() => navigate('/')}>Voltar para a página inicial</Button>
    </div>
  </>);
}