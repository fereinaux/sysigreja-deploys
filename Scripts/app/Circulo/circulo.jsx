const { useEffect, useState } = React;
// var orderBy = require('orderby');

function Greetings({ circulos, tipoEvento }) {
  const [lCirculos, setLCirculos] = useState(circulos);

  useEffect(() => {
    DragDropg();
  });

  useEffect(() => {
    setLCirculos(
      circulos.map((circulo) => {
        return {
          ...circulo,
          Participantes:
            tipoEvento == "Individual"
              ? _.orderBy(circulo.Participantes, "Nome", "asc")
              : _.orderBy(circulo.Participantes, ["SequencialEvento","Sexo"], "asc"),
        };
      })
    );
  }, [circulos]);

  return lCirculos.map((circulo) => (
    <div
      key={circulo.Id}
      data-id={circulo.Id}
      style={{
        marginBottom: "25px",
        backgroundColor: circulo.Cor,
        backgroundClip: "content-box",
        borderRadius: "28px",
      }}
      className="p-xs col-xs-12 col-lg-4 pg text-center text-white"
    >
      {circulo.Titulo && (
        <h4 style={{ paddingTop: "5px" }}>{circulo.Titulo}</h4>
      )}
      <table className="table">
        <tbody id={`pg-${circulo.Id}`}>
          {circulo.Participantes.map((participante) => (
            <tr key={participante.ParticipanteId}>
              <td
                className="participante"
                data-id={participante.ParticipanteId}
              >
                {participante.Nome}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        type="button"
        className="btn btn-rounded btn-default print-button"
        onClick={() => PrintCirculo(circulo)}
      >
        <i className="fa fa-2x fa-print"></i>
      </button>
    </div>
  ));
}

const root = ReactDOM.createRoot(document.getElementById("circulos"));

function loadCirculos(circulos, tipoEvento) {
  root.render(<Greetings circulos={circulos} tipoEvento={tipoEvento} />);
}
