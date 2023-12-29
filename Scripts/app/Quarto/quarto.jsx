const { useEffect, useState } = React;
// var orderBy = require('orderby');

function QuartosComponent({ quartos }) {
  const [lQuartos, setLQuartos] = useState(quartos);

  useEffect(() => {
    DragDropg();
  });

  useEffect(() => {
    if (quartos) {
      setLQuartos(
        quartos.map((quarto) => {
          return {
            ...quarto,
            Participantes: quarto.Participantes.length > 0 ? _.orderBy(quarto.Participantes, "Nome", "asc") :  _.orderBy(quarto.Equipantes, "Nome", "asc"),
          };
        })
      );
    }
  }, [quartos]);

  return (
    lQuartos &&
    lQuartos.map((quarto) => (
      <div
        key={`padrinho-${quarto.Id}`}
        data-id={quarto.Id}
        style={{
          marginBottom: "25px",
          backgroundColor: {
            Masculino: "#0095ff",
            Feminino: "#ff00d4",
            Misto: "#424242",
          }[quarto.Sexo],
          backgroundClip: "content-box",
          borderRadius: "28px",
        }}
        className="p-xs col-xs-12 col-lg-4 quarto text-center text-white"
      >
        {quarto.Titulo && (
          <h4 style={{ paddingTop: "5px" }}>{quarto.Titulo}</h4>
        )}
         {quarto.Equipante && (
          <h5 >{quarto.Equipante}</h5>
        )}
        <table className="table">
          <tbody id={`pg-${quarto.Id}`}>
            {quarto.Participantes.map((participante) => (
              <tr
                key={`participante-${quarto.Id}-${participante.ParticipanteId}`}
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
          onClick={() => PrintQuarto(quarto)}
        >
          <i className="fa fa-2x fa-print"></i>
        </button>
      </div>
    ))
  );
}

function loadQuartos(quartos) {
  rootQuartos.render(<QuartosComponent quartos={quartos} />);
}
