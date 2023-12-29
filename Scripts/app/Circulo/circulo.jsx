const { useEffect, useState } = React;
// var orderBy = require('orderby');

function CirculosComponent({ circulos, tipoEvento }) {
  const [lCirculos, setLCirculos] = useState(circulos);

  useEffect(() => {
    DragDropg();
  });

  useEffect(() => {
    if (circulos) {
      setLCirculos(
        circulos.map((circulo) => {
          return {
            ...circulo,
            Participantes:
              tipoEvento == "Individual"
                ? _.orderBy(circulo.Participantes, "Nome", "asc")
                : _.orderBy(
                    circulo.Participantes,
                    ["SequencialEvento", "Sexo"],
                    "asc"
                  ),
          };
        })
      );
    }
  }, [circulos]);

  return (
    lCirculos &&
    lCirculos.map((circulo) => (
      <div
        key={`circulo-${circulo.Id}`}
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
              <tr
                key={`participante-${circulo.Id}-${participante.ParticipanteId}`}
              >
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
    ))
  );
}

function loadCirculos(circulos, tipoEvento) {
  rootCirculos.render(
    <CirculosComponent circulos={circulos} tipoEvento={tipoEvento} />
  );
}
