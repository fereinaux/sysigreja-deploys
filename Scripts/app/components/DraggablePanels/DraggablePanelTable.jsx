export function DraggablePanelTable({ panel }) {
  return (
    <table className="table">
      <tbody id={`pg-${panel.Id}`}>
        {panel.Participantes.map((participante) => (
          <tr key={`participante-${panel.Id}-${participante.ParticipanteId}`}>
            <td className="participante" data-id={participante.ParticipanteId}>
              {participante.Nome}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
