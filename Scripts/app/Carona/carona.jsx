const { useEffect, useState } = React;
// var orderBy = require('orderby');

function CaronaComponent({ caronas }) {
  const [lCaronas, setLCaronas] = useState(caronas);

  useEffect(() => {
    DragDropg();
  });

  useEffect(() => {
    if (caronas) {
      setLCaronas(
        caronas.map((carona) => {
          return {
            ...carona,
            Participantes:
              carona.Participantes.length > 0
                ? _.orderBy(carona.Participantes, "Nome", "asc")
                : _.orderBy(carona.Equipantes, "Nome", "asc"),
          };
        })
      );
    }
  }, [caronas]);

  return (
    lCaronas &&
    lCaronas.map((carona) => (
      <div
        key={`padrinho-${carona.Id}`}
        data-id={carona.Id}
        style={{
          marginBottom: "25px",
          backgroundColor: "#424242",
          backgroundClip: "content-box",
          borderRadius: "28px",
        }}
        className="p-xs col-xs-12 col-lg-4 pg text-center text-white"
      >
        {carona.Motorista && (
          <h4 style={{ paddingTop: "5px" }}>{carona.Motorista}</h4>
        )}
        <table className="table">
          <tbody id={`pg-${carona.Id}`}>
            {carona.Participantes.map((participante) => (
              <tr
                key={`participante-${carona.Id}-${participante.ParticipanteId}`}
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
          onClick={() => PrintCarona(carona)}
        >
          <i className="fa fa-2x fa-print"></i>
        </button>
      </div>
    ))
  );
}

function loadCaronas(caronas) {
  rootCarona.render(<CaronaComponent caronas={caronas} />);
}
