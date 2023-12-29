const { useEffect, useState } = React;
// var orderBy = require('orderby');

function PadrinhosComponent({ padrinhos }) {
  const [lPadrinhos, setLPadrinhos] = useState(padrinhos);

  useEffect(() => {
    DragDropg();
  });

  useEffect(() => {
    if (padrinhos) {
      setLPadrinhos(
        padrinhos.map((padrinho) => {
          return {
            ...padrinho,
            Participantes: _.orderBy(padrinho.Participantes, "Nome", "asc"),
          };
        })
      );
    }
  }, [padrinhos]);
  return (
    lPadrinhos &&
    lPadrinhos.map((padrinho) => (
      <div
        key={`padrinho-${padrinho.Id}`}
        data-id={padrinho.Id}
        style={{
          marginBottom: "25px",
          backgroundColor: "#424242",
          backgroundClip: "content-box",
          borderRadius: "28px",
        }}
        className="p-xs col-xs-12 col-lg-4 pg text-center text-white"
      >
        {padrinho.Padrinho && (
          <h4 style={{ paddingTop: "5px" }}>{padrinho.Padrinho}</h4>
        )}
        <table className="table">
          <tbody id={`pg-${padrinho.Id}`}>
            {padrinho.Participantes.map((participante) => (
              <tr
                key={`participante-${padrinho.Id}-${participante.ParticipanteId}`}
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
          onClick={() => PrintPadrinho(padrinho)}
        >
          <i className="fa fa-2x fa-print"></i>
        </button>
      </div>
    ))
  );
}

function loadPadrinhos(padrinhos) {
  rootPadrinhos.render(<PadrinhosComponent padrinhos={padrinhos} />);
}
