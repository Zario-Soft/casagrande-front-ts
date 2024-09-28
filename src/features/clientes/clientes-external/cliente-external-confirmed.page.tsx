import TopBar from "src/components/top-bar/top-bar.index";

export default function ConfirmedPage() {
    return <><TopBar />
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginTop: '40px',
      textAlign: 'center'
    }}>
      <h3>Seus dados foram confirmados com sucesso!</h3>
      <p>Em breve você receberá mais atualizações de nossa equipe.</p>
    </div>
  </>
}