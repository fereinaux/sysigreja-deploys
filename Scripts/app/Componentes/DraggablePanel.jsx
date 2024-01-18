const { useEffect, useState } = React;

function loadPanels(rootElement, panels, handleClick) {
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
                    width: "370px",
                }}
                className="p-xs droppable text-center text-white draggable-panel"
            >
                {panel.Title && <Title title={panel.Title} />}
                {panel.SubTitle && <SubTitle title={panel.SubTitle} />}
                <Table panel={panel} />
                <PrintButton handleClick={handleClick} panel={panel} />
                {panel.Total != null && <span className="draggable-total">Total: {panel.Total}</span> }
            </div>
        ))
    );
}

function Title({ title }) {
    return (
        <>
            <h4 style={{ paddingTop: "5px",  }}>{title}</h4>
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
        <ul className="draggable-ul" id={`panel-${panel.Id}`}>
            {panel.Participantes.map((participante) => (
                <li key={`draggable-${panel.Id}-${participante.ParticipanteId}`} className="draggable draggable-li" data-id={participante.ParticipanteId}>
                    {participante.Nome}
                </li>
            ))}
        </ul>
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
