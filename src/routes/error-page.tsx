import { useRouteError } from "react-router-dom";
import TopBar from "src/components/top-bar/top-bar.index";

export default function ErrorPage() {
  let error = useRouteError();
  console.error(error);

  return (<>
    <TopBar />
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>

      <h1>Ops!</h1>
      <p>Página não encontrada!</p>
    </div>
  </>);
}