const { useEffect, useState } = React;

function loadProfile(rootElement, ParticipanteId, Aba, functionCallback, type) {
  rootElement.render(
    <ProfileCard
      ParticipanteId={ParticipanteId}
      Aba={Aba}
      functionCallback={functionCallback}
      type={type}
    />
  );
}

function ProfileCard({ ParticipanteId, Aba, functionCallback, type }) {
  const [participante, setParticipante] = useState(undefined);
  const [aba, setAba] = useState(Aba);
  const [Circulos, SetCirculos] = useState(undefined);
  const [Equipes, SetEquipes] = useState(undefined);
  const [Padrinhos, SetPadrinhos] = useState(undefined);
  const [Caronas, SetCaronas] = useState(undefined);
  const [Quartos, SetQuartos] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [showInitials, setShowInitials] = useState(false);

  useEffect(() => {
    loadParticipante(ParticipanteId);
  }, [ParticipanteId]);

  useEffect(() => {
    switch (aba) {
      case "Círculos":
        if (!Circulos) {
          loadCirculos();
        }
        break;
      case "Quartos":
        if (!Quartos) {
          loadQuartos();
        }
        break;
      case "Padrinhos":
        if (!Padrinhos) {
          loadPadrinhos();
        }
        break;
      case "Caronas":
        if (!Caronas) {
          loadCaronas();
        }
        break;
      case "Equipes":
        if (!Equipes) {
          loadEquipes();
        }
        break;
      default:
        break;
    }
  }, [aba]);

  async function loadCirculos() {
    const req = await fetch("/Circulo/GetCirculos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        EventoId: SelectedEvent.Id,
      }),
    });

    const json = await req.json();

    SetCirculos(json.data);
  }
  async function loadEquipes() {
    const req = await fetch("/Equipe/GetEquipes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        EventoId: SelectedEvent.Id,
      }),
    });

    const json = await req.json();

    SetEquipes(json.data);
  }

  async function loadCaronas() {
    const req = await fetch("/Carona/GetCaronas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        EventoId: SelectedEvent.Id,
      }),
    });

    const json = await req.json();

    SetCaronas(json.data);
  }

  async function loadPadrinhos() {
    const req = await fetch("/Padrinho/GetPadrinhos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        EventoId: SelectedEvent.Id,
      }),
    });

    const json = await req.json();

    SetPadrinhos(json.data);
  }

  const attrClip =
    participante?.QtdAnexos > 0 ? { "data-count": participante?.QtdAnexos } : {};

  async function loadQuartos() {
    const req = await fetch("/Quarto/GetQuartos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        EventoId: SelectedEvent.Id,
        Tipo: type == "Participante" ? 1 : 0,
      }),
    });

    const json = await req.json();

    SetQuartos(json.data);
  }

  async function loadParticipante(ParticipanteId) {
    const reqParticipante = await fetch(
      type == "Participante"
        ? `/Participante/GetParticipanteProfile/${ParticipanteId}`
        : `/Equipante/GetEquipante/${ParticipanteId}?eventoId=${SelectedEvent.Id}`
    );

    const jsonParticipantes = await reqParticipante.json();
    setParticipante(
      type == "Participante"
        ? jsonParticipantes.Participante
        : jsonParticipantes.Equipante
    );
    setLoading(false);
  }
  let rgx = new RegExp(/(\p{L}{1})\p{L}+/, "gu");

  const initials = [...(participante?.Nome?.matchAll(rgx) ?? [])] || [];

  tippy("[data-tippy-content]");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "350px",
        padding: "10px",
      }}
    >
      {loading ? (
        <div className="m-lg">
          <div className="sk-spinner sk-spinner-chasing-dots">
            <div
              style={{
                backgroundColor: "#fff",
              }}
              className="sk-dot1"
            ></div>
            <div
              style={{
                backgroundColor: "#fff",
              }}
              className="sk-dot2"
            ></div>
          </div>
        </div>
      ) : (
        <>
          <div className="profile-container">
            <div className="profile-card">
              {!showInitials ? (
                <div className="avatar">
                  <img
                    onError={() =>
                      setShowInitials(
                        (
                          (initials.shift()?.[1] || "") +
                          (initials.pop()?.[1] || "")
                        ).toUpperCase()
                      )
                    }
                    src={`/Arquivo/GetFotoByEmail?email=${participante.Email}`}
                  ></img>
                </div>
              ) : (
                <div className="without-avatar">{showInitials}</div>
              )}
              <div className="basic-info">
                <span className="hide-multiple">Nome: {participante.Nome}</span>
                {participante.Status && (
                  <span className="hide-multiple">
                    Status:{" "}
                    {participante.Checkin ? "Presente" : participante.Status}
                  </span>
                )}
                {participante.Circulo && (
                  <span className="hide-multiple">
                    {SelectedEvent.EquipeCirculo}:{" "}
                    <span
                      style={{ backgroundColor: participante.Circulo }}
                      className="dot"
                    ></span>{" "}
                    {participante.CirculoTitulo}
                  </span>
                )}
                {participante.Quarto && (
                  <span className="hide-multiple">
                    Quarto:{" "}
                    <span
                      style={{
                        backgroundColor: {
                          Masculino: "#0095ff",
                          Feminino: "#ff00d4",
                          Misto: "#424242",
                        }[participante.QuartoSexo],
                      }}
                      className="dot"
                    ></span>{" "}
                    {participante.Quarto}
                  </span>
                )}
                {participante.Padrinho && (
                  <span className="hide-multiple">
                    Padrinho: {participante.Padrinho}
                  </span>
                )}
                {participante.Equipe && (
                  <span className="hide-multiple">
                    Equipe: {participante.Equipe}
                  </span>
                )}
                {participante.Motorista && (
                  <span className="hide-multiple">
                    Carona: {participante.Motorista}
                  </span>
                )}
                {participante.Endereco && (
                  <span className="hide-multiple">
                    Endereço: {participante.Endereco} - {participante.Bairro}
                  </span>
                )}
                <div className="actions">
                  <span
                    onClick={() => {
                      if (window.location.pathname == "/Participante") {
                        tippy.hideAll();
                        Pagamentos(participante.Id);
                      } else {
                        window.open(
                          type == "Participante"
                            ? `/Participante?Id=${participante.Id}&action=money`
                            : `/Equipante?Id=${participante.Id}&action=money`
                        );
                      }
                    }}
                    className="pointer"
                  >
                    <i
                      className=" far fa-money-bill-alt"
                      aria-hidden="true"
                    ></i>
                  </span>
                  <span
                    onClick={() => {
                      if (window.location.pathname == "/Participante") {
                        tippy.hideAll();
                        Anexos(participante.Id);
                      } else {
                        window.open(
                          type == "Participante"
                            ? `/Participante?Id=${participante.Id}&action=files`
                            : `/Equipante?Id=${participante.Id}&action=files`
                        );
                      }
                    }}
                    style={{
                      position: "relative",
                    }}
                    className="has-badge pointer "
                    {...attrClip}
                  >
                    {" "}
                    <i
                      className="fa fa-paperclip data-counter"
                      aria-hidden="true"
                    ></i>
                  </span>
                  <a
                    target="_blank"
                    href={GetLinkWhatsApp(participante.Fone)}
                    className="pointer"
                  >
                    <i className="fab fa-whatsapp" aria-hidden="true"></i>
                  </a>
                  <span
                    onClick={() => {
                      if (window.location.pathname == "/Participante") {
                        tippy.hideAll();
                        EditParticipante(participante.Id);
                      } else {
                        window.open(
                          type == "Participante"
                            ? `/Participante?Id=${participante.Id}&action=edit`
                            : `/Equipante?Id=${participante.Id}&action=edit`
                        );
                      }
                    }}
                    className="pointer"
                  >
                    <i className="fas fa-edit" aria-hidden="true"></i>
                  </span>
                  <span
                    onClick={() => {
                      if (window.location.pathname == "/Participante") {
                        tippy.hideAll();
                        Opcoes(participante.Id);
                      } else {
                        window.open(
                          type == "Participante"
                            ? `/Participante?Id=${participante.Id}&action=options`
                            : `/Equipante?Id=${participante.Id}&action=options`
                        );
                      }
                    }}
                    className="pointer"
                  >
                    <i className="fas fa-info-circle" aria-hidden="true"></i>
                  </span>
                </div>
              </div>
            </div>
            <div className="etiquetas">
              {participante.Etiquetas?.map((etiqueta) => (
                <span
                  key={`etiqueta-${etiqueta.Id}`}
                  className="badge"
                  style={{
                    backgroundColor: etiqueta.Cor,
                    color: "#fff",
                  }}
                >
                  {etiqueta.Nome}
                </span>
              ))}
            </div>
          </div>
          <div
            className="aba-selector"
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "space-around",
              width: "100%",
            }}
          >
            {type == "Participante" && (
              <span
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "start",
                  textAlign: "center",
                }}
                onClick={() => setAba("Círculos")}
                className={`pointer ${aba === "Círculos" ? "active" : ""}`}
              >
                <i className="fas fa-user-friends" aria-hidden="true"></i>{" "}
                {SelectedEvent.EquipeCirculo}
              </span>
            )}
            <span
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "start",
                textAlign: "center",
              }}
              onClick={() => setAba("Quartos")}
              className={`pointer ${aba === "Quartos" ? "active" : ""}`}
            >
              <i className="fas fa-bed" aria-hidden="true"></i> Quartos
            </span>
            {type == "Participante" && (
              <span
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "start",
                  textAlign: "center",
                }}
                onClick={() => setAba("Padrinhos")}
                className={`pointer ${aba === "Padrinhos" ? "active" : ""}`}
              >
                <i className="fas fa-users-cog" aria-hidden="true"></i>{" "}
                Padrinhos
              </span>
            )}
            {type == "Participante" && (
              <span
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "start",
                  textAlign: "center",
                }}
                onClick={() => setAba("Caronas")}
                className={`pointer ${aba === "Caronas" ? "active" : ""}`}
              >
                <i className="fas fa-car" aria-hidden="true"></i> Caronas
              </span>
            )}
            {type == "Equipante" && (
              <span
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "start",
                  textAlign: "center",
                }}
                onClick={() => setAba("Equipes")}
                className={`pointer ${aba === "Equipes" ? "active" : ""}`}
              >
                <i className="fas fa-broom" aria-hidden="true"></i> Equipes
              </span>
            )}
          </div>
          {aba == "Círculos" && Circulos && Circulos.length > 0 && (
            <ChangeCirculoComponent
              Participante={participante}
              Circulos={Circulos}
              functionCallback={functionCallback}
            />
          )}
          {aba == "Quartos" && Quartos && Quartos.length > 0 && (
            <ChangeQuartoComponent
              Participante={participante}
              Quartos={Quartos}
              functionCallback={functionCallback}
              type={type}
            />
          )}
          {aba == "Padrinhos" && Padrinhos && Padrinhos.length > 0 && (
            <ChangePadrinhoComponent
              Participante={participante}
              Padrinhos={Padrinhos}
              functionCallback={functionCallback}
            />
          )}
          {aba == "Caronas" && Caronas && Caronas.length > 0 && (
            <ChangeCaronaComponent
              Participante={participante}
              Caronas={Caronas}
              functionCallback={functionCallback}
            />
          )}
          {aba == "Equipes" && Equipes && Equipes.length > 0 && (
            <ChangeEquipesComponent
              Participante={participante}
              Equipes={Equipes}
              functionCallback={functionCallback}
            />
          )}
        </>
      )}
    </div>
  );
}

function ChangeCirculoComponent({ Participante, Circulos, functionCallback }) {
  function ChangeCirculoFromProfile(ParticipanteId, DestinoId) {
    $.ajax({
      url: "/Circulo/ChangeCirculo/",
      datatype: "json",
      type: "POST",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify({
        ParticipanteId,
        DestinoId,
      }),
      success: function () {
        functionCallback();
      },
    });
  }

  return (
    <div
      style={{
        width: "350px",
      }}
    >
      <div>
        <ul className="change-circulo-ul">
          {Circulos.filter((c) => c.Id != Participante?.CirculoId).map((c) => (
            <li
              key={`change-circulo-li-${c.Id}`}
              onClick={() => ChangeCirculoFromProfile(Participante.Id, c.Id)}
              className="change-circulo-li"
              style={{
                backgroundColor: c.Cor,
              }}
            >
              <span>{c.Titulo}</span>
              <span>Participantes: {c.QtdParticipantes}</span>
            </li>
          ))}
          {Participante.CirculoId && (
            <li
              onClick={() => ChangeCirculoFromProfile(Participante.Id, null)}
              className="change-circulo-li"
              style={{
                backgroundColor: "#bb2d2d",
              }}
            >
              <span>Remover</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

function ChangeEquipesComponent({ Participante, Equipes, functionCallback }) {
  function AddMembroEquipeFromProfile(ParticipanteId, DestinoId) {
    $.ajax({
      url: "/Equipe/AddMembroEquipe/",
      datatype: "json",
      type: "POST",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify({
        EquipanteId: ParticipanteId,
        EventoId: SelectedEvent.Id,
        EquipeId: DestinoId,
      }),
      success: function () {
        functionCallback();
      },
    });
  }

  function DeleteMembroEquipeFromProfile() {
    $.ajax({
      url: "/Equipe/DeleteMembroEquipe/",
      datatype: "json",
      type: "POST",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify({
        Id: Participante.EquipanteEventoId,
      }),
      success: function () {
        functionCallback();
      },
    });
  }

  return (
    <div
      style={{
        width: "350px",
      }}
    >
      <div>
        <ul className="change-circulo-ul">
          {Equipes.filter((c) => c.Id != Participante?.EquipeId).map((c) => (
            <li
              key={`change-equipe-li-${c.Id}`}
              onClick={() => AddMembroEquipeFromProfile(Participante.Id, c.Id)}
              className="change-circulo-li"
              style={{
                backgroundColor: "#424242",
              }}
            >
              <span>{c.Equipe}</span>
              <span>Voluntários: {c.QuantidadeMembros}</span>
            </li>
          ))}
          {Participante?.EquipeId && (
            <li
              onClick={() => DeleteMembroEquipeFromProfile()}
              className="change-circulo-li"
              style={{
                backgroundColor: "#bb2d2d",
              }}
            >
              <span>Remover</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

function ChangeCaronaComponent({ Participante, Caronas, functionCallback }) {
  function ChangeCaronaFromProfile(ParticipanteId, DestinoId) {
    $.ajax({
      url: "/Carona/ChangeCarona/",
      datatype: "json",
      type: "POST",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify({
        ParticipanteId,
        DestinoId,
      }),
      success: function () {
        functionCallback();
      },
    });
  }

  return (
    <div
      style={{
        width: "350px",
      }}
    >
      <div>
        <ul className="change-circulo-ul">
          {Caronas.filter(
            (c) =>
              c.CapacidadeInt > c.Quantidade && c.Id != Participante?.CaronaId
          ).map((c) => (
            <li
              key={`change-carona-li-${c.Id}`}
              onClick={() => ChangeCaronaFromProfile(Participante.Id, c.Id)}
              className="change-circulo-li"
              style={{
                backgroundColor: "#424242",
              }}
            >
              <span>{c.Motorista}</span>
              <span>Participantes: {c.Capacidade}</span>
            </li>
          ))}
          {Participante?.CaronaId && (
            <li
              onClick={() => ChangeCaronaFromProfile(Participante.Id, null)}
              className="change-circulo-li"
              style={{
                backgroundColor: "#bb2d2d",
              }}
            >
              <span>Remover</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

function ChangePadrinhoComponent({
  Participante,
  Padrinhos,
  functionCallback,
}) {
  function ChangePadrinhoFromProfile(ParticipanteId, DestinoId) {
    $.ajax({
      url: "/Padrinho/ChangePadrinho/",
      datatype: "json",
      type: "POST",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify({
        ParticipanteId,
        DestinoId,
      }),
      success: function () {
        functionCallback();
      },
    });
  }

  return (
    <div
      style={{
        width: "350px",
      }}
    >
      <div>
        <ul className="change-circulo-ul">
          {Padrinhos.filter((c) => c.Id != Participante?.PadrinhoId).map(
            (c) => (
              <li
                key={`change-padrinho-li-${c.Id}`}
                onClick={() => ChangePadrinhoFromProfile(Participante.Id, c.Id)}
                className="change-circulo-li"
                style={{
                  backgroundColor: "#424242",
                }}
              >
                <span>{c.Padrinho}</span>
                <span>Participantes: {c.Quantidade}</span>
              </li>
            )
          )}
          {Participante?.PadrinhoId && (
            <li
              onClick={() => ChangePadrinhoFromProfile(Participante.Id, null)}
              className="change-circulo-li"
              style={{
                backgroundColor: "#bb2d2d",
              }}
            >
              <span>Remover</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

function ChangeQuartoComponent({
  Participante,
  Quartos,
  functionCallback,
  type,
}) {
  function ChangeQuartoFromProfile(ParticipanteId, DestinoId) {
    $.ajax({
      url: "/Quarto/ChangeQuarto/",
      datatype: "json",
      type: "POST",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify({
        ParticipanteId,
        DestinoId,
        EventoId: SelectedEvent.Id,
        tipo: type == "Participante" ? 1 : 0,
      }),
      success: function () {
        functionCallback();
      },
    });
  }

  return (
    <div
      style={{
        width: "350px",
      }}
    >
      <div>
        <ul className="change-circulo-ul">
          {Quartos.filter(
            (c) =>
              c.Id != Participante?.QuartoId &&
              (c.Sexo == Participante.Sexo || c.Sexo == "Misto") &&
              c.CapacidadeInt > c.Quantidade
          ).map((c) => (
            <li
              key={`change-quarto-li-${c.Id}`}
              onClick={() => ChangeQuartoFromProfile(Participante.Id, c.Id)}
              className="change-circulo-li"
              style={{
                backgroundColor: {
                  Masculino: "#0095ff",
                  Feminino: "#ff00d4",
                  Misto: "#424242",
                }[c.Sexo],
              }}
            >
              <span>{c.Titulo}</span>
              <span>Participantes: {c.Capacidade}</span>
            </li>
          ))}
          {Participante?.QuartoId && (
            <li
              onClick={() => ChangeQuartoFromProfile(Participante.Id, null)}
              className="change-circulo-li"
              style={{
                backgroundColor: "#bb2d2d",
              }}
            >
              <span>Remover</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
