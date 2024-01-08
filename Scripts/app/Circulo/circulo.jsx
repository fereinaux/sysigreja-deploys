import { DraggablePanel } from "../components/DraggablePanels";

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
       <DraggablePanel.Title title={circulo.Titulo}/>
       <DraggablePanel.Table panel={circulo}/>
       <DraggablePanel.Button handleClick={PrintCirculo} panel={circulo}/>       
      </div>
    ))
  );
}

function loadCirculos(circulos, tipoEvento) {
  rootCirculos.render(
    <CirculosComponent circulos={circulos} tipoEvento={tipoEvento} />
  );
}
