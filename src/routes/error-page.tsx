import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  let error = useRouteError();
  console.error(error);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      
      <h1>Ops!</h1>
      <p>Página não encontrada!</p>
    </div>
  );
}