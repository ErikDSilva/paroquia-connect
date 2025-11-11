import "../../static/home/style.css";

export default function Home() {
  return (
    <div>
      <div>
        <section className="secao-eventos">
          <div className="eventos"></div>
          <div className="eventos"></div>
          <div className="eventos"></div>
        </section>

        <section className="secao-informacoes">
          <div className="proximos-eventos">
            <div className="titulo-secao">
              <h1 className="info-titulo">Próximos Eventos</h1>
            </div>

            <div className="card-proximos-eventos"></div>
            <div className="card-proximos-eventos"></div>
          </div>

          <div className="ultimos-avisos">
            <div className="titulo-secao">
              <h1 className="info-titulo">Próximos Eventos</h1>
            </div>

            <div className="card-ultimos-avisos"></div>
            <div className="card-ultimos-avisos"></div>
            <div className="card-ultimos-avisos"></div>
          </div>

        </section>

      </div>
    </div>
  );
}