const { useEffect, useState } = React;

function loadPanels(rootElement,panels,handleClick) {
  rootElement.render(<DraggablePanel panels={panels} handleClick={handleClick} />);
}

function DraggablePanel({ panels, handleClick }) {
  useEffect(() => {
    DragDropg();
  });

  return (
    panels &&
    panels.map((panel) => (
      <div
        key={`${panel.Id}`}
        data-id={panel.Id}
        style={{
          marginBottom: "25px",
          backgroundColor: panel.Cor,
          backgroundClip: "content-box",
          borderRadius: "28px",
        }}
        className="p-xs col-xs-12 col-lg-4 droppable text-center text-white"
      >
        {panel.Title && <Title title={panel.Title} />}
        {panel.SubTitle && <SubTitle title={panel.SubTitle} />}
        <Table panel={panel} />
        <PrintButton handleClick={handleClick} panel={panel} />
      </div>
    ))
  );
}

function Title({ title }) {
  return (
    <>
      <h4 style={{ paddingTop: "5px" }}>{title}</h4>
    </>
  );
}

function SubTitle({ title }) {
  return (
    <>
      <h5>{title}</h5>
    </>
  );
}

function Table({ panel }) {
  return (
    <table className="table">
      <tbody id={`panel-${panel.Id}`}>
        {panel.Participantes.map((participante) => (
          <tr key={`draggable-${panel.Id}-${participante.ParticipanteId}`}>
            <td className="draggable" data-id={participante.ParticipanteId}>
              {participante.Nome}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PrintButton({ panel, handleClick }) {
  return (
    <button
      type="button"
      className="btn btn-rounded btn-default print-button"
      onClick={() => handleClick(panel)}
    >
      <i className="fa fa-2x fa-print" />
    </button>
  );
}
