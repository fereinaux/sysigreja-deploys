const { useEffect, useState } = React;

function loadModal(rootElement, id, title, fields, data, execSubmit) {
  rootElement.render(
    <Modal
      id={id}
      title={title}
      fields={fields}
      data={data}
      execSubmit={execSubmit}
    />
  );
}

function Modal({ id, title, fields, data, execSubmit }) {
  function handleSubmit(e) {
    e.preventDefault();
    if (ValidateForm(`#${id} form`)) {
      execSubmit();
    }
  }

  useEffect(() => {
    $(`#${id}`).modal();
  });

  useEffect(() => {
    initInputs();

    if ($("#map").length > 0) {
      if (map) {
        map.off();
        map.remove();
      }

      map = initMap("map");
      markerLayer = createMarkerLayer(map);
      montarMapa();
    }

    fields
      .filter((field) => field.Tipo == "Fone")
      .forEach((field) => {
        setNumber(field.Campo, data[field.Campo]);
      });

    fields
      .filter((field) => field.Tipo == "Pergunta")
      .forEach((field) => {
        if (
          $(`input[type=radio][name=${field.Campo}]:checked`).val() == "false"
        ) {
          $(`#${field.Pergunta.Campo}`).removeClass("required");
        }

        $(`[name=${field.Campo}]`).on("ifChecked", function (event) {
          if (event.target.value == "true") {
            $(`.${field.Pergunta.Campo}`).removeClass("d-none");
            $(`#${field.Pergunta.Campo}`).addClass("required");
          } else {
            $(`.${field.Pergunta.Campo}`).addClass("d-none");
            $(`#${field.Pergunta.Campo}`).removeClass("required");
          }
        });
      });
  }, [data["Id"]]);

  function handleCampo(field) {
    switch (field.Tipo) {
      case "Id":
        return (
          <input
            type="hidden"
            id={field.Campo}
            name={field.Campo}
            defaultValue={data[field.Campo]}
          />
        );
      case "String":
        return (
          <input
            type="text"
            className="form-control required"
            id={field.Campo}
            name={field.Campo}
            data-field={field.Titulo}
            defaultValue={data[field.Campo]}
          />
        );
      case "Endereco":
        return (
          <div className="row">
            <div className="col-sm-3 p-w-md m-t-md text-center">
              <h5>CEP</h5>

              <input
                type="text"
                className="form-control required cep"
                id="CEP"
                name="CEP"
                data-field="CEP"
                defaultValue={data["CEP"]}
                onKeyUp={(e) => verificaCep(e.target)}
              />
              <input
                type="hidden"
                id="Latitude"
                name="Latitude"
                defaultValue={data["Latitude"]}
              />
              <input
                type="hidden"
                id="Longitude"
                name="Longitude"
                defaultValue={data["Longitude"]}
              />
            </div>
            <div className="col-sm-9 p-w-md m-t-md text-center">
              <h5>Logradouro</h5>

              <input
                type="text"
                className="form-control required"
                readOnly
                id="Logradouro"
                name="Logradouro"
                data-field="Logradouro"
                defaultValue={data["Logradouro"]}
              />
            </div>
            <div className="col-sm-5 p-w-md m-t-md text-center">
              <h5>Bairro</h5>

              <input
                type="text"
                className="form-control required"
                readOnly
                id="Bairro"
                name="Bairro"
                data-field="Bairro"
                defaultValue={data["Bairro"]}
              />
            </div>
            <div className="col-sm-5 p-w-md m-t-md text-center">
              <h5>Cidade</h5>

              <input
                type="text"
                className="form-control required"
                readOnly
                id="Cidade"
                name="Cidade"
                data-field="Cidade"
                defaultValue={data["Cidade"]}
              />
            </div>
            <div className="col-sm-2 p-w-md m-t-md text-center">
              <h5>Estado</h5>

              <input
                type="text"
                className="form-control required"
                readOnly
                id="Estado"
                name="Estado"
                data-field="Estado"
                defaultValue={data["Estado"]}
              />
            </div>
            <div className="col-sm-4 p-w-md m-t-md text-center">
              <h5>Número</h5>

              <input
                type="text"
                className="form-control"
                id="Numero"
                name="Numero"
                data-field="Número"
                defaultValue={data["Numero"]}
              />
            </div>
            <div className="col-sm-8 p-w-md m-t-md text-center">
              <h5>Complemento</h5>

              <input
                type="text"
                className="form-control"
                id="Complemento"
                name="Complemento"
                data-field="Complemento"
                defaultValue={data["Complemento"]}
              />
            </div>
            <div className="col-sm-12 p-w-md m-t-md text-center">
              <h5>Ponto de Referência</h5>

              <input
                type="text"
                className="form-control"
                id="Referencia"
                name="Referencia"
                data-field="Ponto de Referência"
                defaultValue={data["Referencia"]}
              />
            </div>
            <div
              className="col-sm-12 p-w-md m-t-md text-center div-map"
              style={{
                display: "none",
              }}
            >
              <div
                id="map"
                style={{
                  height: "300px",
                }}
              ></div>
            </div>
          </div>
        );
      case "Fone":
        return (
          <input
            type="text"
            className="form-control fone"
            id={field.Campo}
            name={field.Campo}
            data-field={field.Titulo}
          />
        );
      case "Data":
        return (
          <input
            type="text"
            className="form-control full-date required"
            id={field.Campo}
            name={field.Campo}
            data-field={field.Titulo}
            defaultValue={
              data[field.Campo]
                ? moment(data[field.Campo]).format("DD/MM/YYYY")
                : ""
            }
          />
        );
      case "DataHora":
        return (
          <input
            type="text"
            className="form-control full-date-time required"
            id={field.Campo}
            name={field.Campo}
            data-field={field.Titulo}
            defaultValue={
              data[field.Campo]
                ? moment(data[field.Campo]).format("DD/MM/YYYY  HH:mm")
                : ""
            }
          />
        );
      case "Radio":
        return (
          <div className="radio i-checks-green inline">
            {field.Options.map((opt) => (
              <label key={`radio${field.Campo}-${opt.Valor}`}>
                <input
                  type="radio"
                  id={field.Campo}
                  value={opt.Valor}
                  defaultChecked={data[field.Campo] == opt.Valor}
                  name={field.Campo}
                />
                <i></i> {opt.Titulo}
              </label>
            ))}
          </div>
        );
      case "Pergunta":
        return (
          <>
            <div
              onChange={() => handlePergunta()}
              key={`radio${field.Campo}-true`}
              className="radio i-checks-green inline"
            >
              <label>
                <input
                  type="radio"
                  id={field.Campo}
                  value={true}
                  defaultChecked={data[field.Pergunta.Campo]}
                  name={field.Campo}
                />
                <i></i> Sim
              </label>

              <label>
                <input
                  type="radio"
                  id={field.Campo}
                  value={false}
                  defaultChecked={
                    data[field.Pergunta.Campo] == false ||
                    !data[field.Pergunta.Campo]
                  }
                  name={field.Campo}
                />
                <i></i> Não
              </label>
            </div>

            <div
              className={`${field.Pergunta.Campo} ${
                data[field.Campo] ? "" : "d-none"
              }`}
            >
              <h5>{field.Pergunta.Titulo}</h5>

              {handleCampo(field.Pergunta)}
            </div>
          </>
        );

      default:
        break;
    }
  }

  function handlePergunta() {
  }
  return (
    <div className="modal inmodal" id={id} role="dialog" aria-hidden="true">
      <form onSubmit={(e) => handleSubmit(e)}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content animated bounceInRight">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
            </div>
            <div className="modal-body">
              <div className="row moldura-modal p-h-xs">
                {fields.map((field) => (
                  <div
                    key={`${data["Id"]}${field.Campo}`}
                    className="col-sm-12 p-w-md m-t-md text-center"
                  >
                    <h5>{field.Titulo}</h5>

                    {handleCampo(field)}
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-white pull-right m-l-sm"
                data-dismiss="modal"
              >
                Fechar
              </button>
              <button type="submit" className="btn btn-white pull-right">
                Salvar
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
