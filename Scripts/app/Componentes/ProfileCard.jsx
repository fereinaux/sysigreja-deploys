const { useEffect, useState } = React;

function loadProfile(
    rootElement,
    ParticipanteId,
    Aba,
    functionCallback,
    type,
    instance,
    styleMode
) {
    rootElement.render(
        <ProfileCard
            ParticipanteId={ParticipanteId}
            Aba={Aba}
            functionCallback={functionCallback}
            type={type}
            instance={instance}
            styleMode={styleMode}
        />
    );
}

function ProfileCard({
    ParticipanteId,
    Aba,
    functionCallback,
    type,
    instance,
    styleMode
}) {
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
        instance?.popperInstance.update();
    });

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
        participante?.QtdAnexos > 0
            ? { "data-count": participante?.QtdAnexos }
            : {};

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
                ? {
                    ...jsonParticipantes.Participante,
                    Status: jsonParticipantes.Participante.Checkin
                        ? "Presente"
                        : jsonParticipantes.Participante.Status,
                }
                : {
                    ...jsonParticipantes.Equipante,
                    Status: jsonParticipantes.Equipante.HasOferta ? "Pago" : "Pendente",
                }
        );
        setLoading(false);
    }
    let rgx = new RegExp(/(\p{L}{1})\p{L}+/, "gu");

    const initials = [...(participante?.Nome?.matchAll(rgx) ?? [])] || [];

    return (
        <div className={styleMode}
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                width: styleMode ? "100%" : "350px",
                padding: "10px",
                gap: "10px",
            }}
        >
            {loading ? (
                <div className="m-lg">
                    <div className="sk-spinner sk-spinner-chasing-dots">
                        <div
                            style={{
                                backgroundColor: styleMode ? "#333" : "#fff"
                            }}
                            className="sk-dot1"
                        ></div>
                        <div
                            style={{
                                backgroundColor: styleMode ? "#333" : "#fff"
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
                                <h4>
                                    <i
                                        style={{
                                                fontSize: "15px",
                                                color: styleMode ? "#333" : "#fff",
                                        }}
                                        className={`fa fa-${{ Masculino: "male", Feminino: "female" }[
                                            participante.Sexo
                                            ]
                                            }`}
                                    ></i>
                                    {" - "}
                                    {participante.Nome}
                                </h4>
                                {participante.Status && (
                                    <div>
                                        <span
                                            style={{
                                                fontSize: "11px",
                                            }}
                                            className={`text-center label label-${{
                                                    Confirmado: "primary",
                                                    Ativo: "primary",
                                                    Pago: "primary",
                                                    Pendente: "warning",
                                                    Cancelado: "danger",
                                                    Presente: "warning",
                                                    Inscrito: "success",
                                                    Espera: "default",
                                                }[participante.Status]
                                                }`}
                                        >
                                            {participante.Status}
                                        </span>
                                    </div>
                                )}

                                {participante.Endereco && (
                                    <span className="hide-multiple">
                                        Endereço: {participante.Endereco} - {participante.Bairro}
                                    </span>
                                )}
                            </div>
                            </div>
                            {participante.Status !== "Cancelado" &&  (
                                <>
                                    {!styleMode &&
                                <div className="actions">
                                    <span
                                        onClick={() => {
                                            if (
                                                window.location.pathname == "/Participante" ||
                                                window.location.pathname == "/Equipante"
                                            ) {
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
                                            if (
                                                window.location.pathname == "/Participante" ||
                                                window.location.pathname == "/Equipante"
                                            ) {
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
                                            if (
                                                window.location.pathname == "/Participante" ||
                                                window.location.pathname == "/Equipante"
                                            ) {
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
                                            if (
                                                window.location.pathname == "/Participante" ||
                                                window.location.pathname == "/Equipante"
                                            ) {
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
                                    <span
                                        onClick={() => {
                                            if (
                                                window.location.pathname == "/Participante" ||
                                                window.location.pathname == "/Equipante"
                                            ) {
                                                tippy.hideAll();
                                                openModalCracha(participante.Id);
                                            } else {
                                                window.open(
                                                    type == "Participante"
                                                        ? `/Participante?Id=${participante.Id}&action=badge`
                                                        : `/Equipante?Id=${participante.Id}&action=badge`
                                                );
                                            }
                                        }}
                                        className="pointer"
                                    >
                                        <i className="fas fa-id-badge" aria-hidden="true"></i>
                                    </span>
                                </div>
                                        }

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
                            </>
                        )}
                    </div>
                    {participante.Status !== "Cancelado" && (
                        <>
                            <div className="action-handler">
                                <div
                                    className="aba-selector"
                                    style={{
                                        display: "flex",
                                        gap: "20px",
                                        justifyContent: "space-around",
                                        flexWrap: "wrap",
                                        width: "100%",
                                    }}
                                >
                                    {type == "Participante" && (
                                        <strong
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "start",
                                                textAlign: "center",
                                                flex: "1 1 45%",
                                            }}
                                            onClick={() => setAba("Círculos")}
                                            className={`pointer ${aba === "Círculos" ? "active" : ""
                                                }`}
                                        >
                                            <i className="fas fa-user-friends" aria-hidden="true"></i>{" "}
                                            {SelectedEvent.EquipeCirculo}
                                            <span
                                                style={{
                                                    fontWeight: 400,
                                                }}
                                            >
                                                <span
                                                    style={{ backgroundColor: participante.Circulo }}
                                                    className="dot"
                                                ></span>{" "}
                                                {participante.CirculoTitulo}
                                            </span>
                                        </strong>
                                    )}
                                    <strong
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "start",
                                            textAlign: "center",
                                            flex: "1 1 45%",
                                        }}
                                        onClick={() => setAba("Quartos")}
                                        className={`pointer ${aba === "Quartos" ? "active" : ""}`}
                                    >
                                        <i className="fas fa-bed" aria-hidden="true"></i> Quartos
                                        <span
                                            style={{
                                                fontWeight: 400,
                                            }}
                                        >
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
                                    </strong>
                                    {type == "Participante" && (
                                        <strong
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "start",
                                                textAlign: "center",
                                                flex: "1 1 45%",
                                            }}
                                            onClick={() => setAba("Padrinhos")}
                                            className={`pointer ${aba === "Padrinhos" ? "active" : ""
                                                }`}
                                        >
                                            <i className="fas fa-users-cog" aria-hidden="true"></i>{" "}
                                            Padrinhos
                                            <span
                                                style={{
                                                    fontWeight: 400,
                                                }}
                                            >
                                                {participante.Padrinho}
                                            </span>
                                        </strong>
                                    )}
                                    {type == "Participante" && (
                                        <strong
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "start",
                                                textAlign: "center",
                                                flex: "1 1 45%",
                                            }}
                                            onClick={() => setAba("Caronas")}
                                            className={`pointer ${aba === "Caronas" ? "active" : ""}`}
                                        >
                                            <i className="fas fa-car" aria-hidden="true"></i> Caronas
                                            <span
                                                style={{
                                                    fontWeight: 400,
                                                }}
                                            >
                                                {participante.Motorista}
                                            </span>
                                        </strong>
                                    )}
                                    {type == "Equipante" && (
                                        <strong
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "start",
                                                textAlign: "center",
                                                flex: "1 1 45%",
                                            }}
                                            onClick={() => setAba("Equipes")}
                                            className={`pointer ${aba === "Equipes" ? "active" : ""}`}
                                        >
                                            <i className="fas fa-broom" aria-hidden="true"></i>{" "}
                                            Equipes
                                            <span
                                                style={{
                                                    fontWeight: 400,
                                                }}
                                            >
                                                {participante.Equipe}
                                            </span>
                                        </strong>
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
                            </div>
                        </>
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
        <div>
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
                            <strong>{c.Titulo}</strong>
                            <small>Participantes: {c.QtdParticipantes}</small>
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
                            <span>Desassociar</span>
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
        <div>
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
                            <strong>{c.Equipe}</strong>
                            <small>Voluntários: {c.QuantidadeMembros}</small>
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
                            <span>Desassociar</span>
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
        <div>
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
                            <strong>{c.Motorista}</strong>
                            <smal>Capacidade: {c.Capacidade}</smal>
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
                            <span>Desassociar</span>
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
        <div>
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
                                <strong>{c.Padrinho}</strong>
                                <small>Participantes: {c.Quantidade}</small>
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
                            <span>Desassociar</span>
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
        <div>
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
                            <strong>{c.Titulo}</strong>
                            <small>Capacidade: {c.Capacidade}</small>
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
                            <span>Desassociar</span>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}
