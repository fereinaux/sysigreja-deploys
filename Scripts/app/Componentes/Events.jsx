const { useEffect, useState } = React;

const root = ReactDOM.createRoot(document.getElementById("row-eventos"));

root.render(
    <Events
        search={""}
        identificador={
            isMobile ? $("#igreja-mobile").val() : $("#igreja-desktop").val()
        }
    />
);

function loadEventos() {
    root.render(
        <Events
            search={$("#search-evento").val()}
            identificador={
                isMobile ? $("#igreja-mobile").val() : $("#igreja-desktop").val()
            }
        />
    );
}

const useProgressiveImage = src => {
    const [sourceLoaded, setSourceLoaded] = useState(null)

    useEffect(() => {
        const img = new Image()
        img.src = src
        img.onload = () => setSourceLoaded(src)
    }, [src])

    return sourceLoaded
}


function Events({ search, identificador }) {
    const [eventos, setEventos] = useState([]);
    const abertos = eventos.filter(
        (evento) => evento.Status == "Aberto" || evento.StatusEquipe == "Aberto"
    );
    const informativos = eventos.filter(
        (evento) => evento.Status == "Informativo"
    );
    const emBreve = eventos.filter(
        (evento) =>
            (evento.Status == "Em breve" || evento.StatusEquipe == "Em breve") &&
            !abertos.find((x) => x.UrlDestino == evento.UrlDestino)
    );
    const [eventosCalendario, setEventosCalendario] = useState([]);
    const [destaque, setDestaque] = useState(null);

    useEffect(() => {
        carregarEventos();
    }, [search, identificador]);


    async function carregarEventos() {
        const res = await $.ajax({
            url: "/Inscricoes/GetEventosInscricao/",
            data: {
                type: action,
                identificador,
                search,
                isMobile,
                linkBg: true,
            },
            datatype: "json",
            type: "GET",
            contentType: `application/json; charset=utf-8`,
        });

        let { Eventos } = res;

        var calendarEl = document.getElementById("calendar");
        var calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: "listMonth",
            locale: "pt-br",
            height: 400,
            buttons: {
                today: false,
            },
            events: Eventos.map((e) => {
                return {
                    title: `${e.Numeracao > 0 ? `${e.Numeracao}º ` : ""}${e.Titulo}`,
                    start: e.DataCalendar,
                    color: "transparent",
                    extendedProps: {
                        url: e.UrlDestino,
                        logo: e.Logo,
                        bg: e.Background,
                        id: e.Id,
                    },
                };
            }),
            eventContent: function (arg) {
                let div = document.createElement("div");
                let overlay = document.createElement("div");
                let spanContainer = document.createElement("div");
                let span = document.createElement("span");
                let img = document.createElement("img");
                let bg = document.createElement("img");
                img.classList.add("img-calendar");
                bg.classList.add("bg-calendar");
                div.classList.add("div-calendar");
                div.dataset.id = arg.event.extendedProps.id;
                div.dataset.url = arg.event.extendedProps.url;
                span.classList.add("span-calendar");
                spanContainer.classList.add("span-container-calendar");
                span.innerHTML = arg.event.title;
                bg.src = `/Inscricoes/GetBGEventoGlobal/${div.dataset.id}`;

                div.append(bg);

                spanContainer.append(span);
                div.append(spanContainer);
                return { domNodes: [div] };
            },
        });
        calendar.render();
        calendarEl.style.overflow = "auto";

        $("#preloader").fadeOut();

        if (!isEquipe && Eventos.length > 0) {
            //let ldestaque = Eventos.filter(
            //  (evento) => evento.Status == "Aberto" || evento.StatusEquipe == "Aberto"
            //)[0];
            //Eventos = Eventos.filter(
            //  (evento) =>
            //    !ldestaque ||
            //    (evento.Id != ldestaque.Id &&
            //      evento.Identificador != ldestaque.Identificador) ||
            //    evento.UrlDestino != ldestaque.UrlDestino
            //);

            setEventos(Eventos);
            //setDestaque(ldestaque);
        }
    }

    return (
        <>

            {abertos.length > 0 && (
                <div >
                    <h3
                        style={{
                            fontWeight: 900,
                            fontSize: "22px",
                        }}
                    >
                        Inscrições Abertas
                    </h3>
                </div>
            )}
            <div class="events-holder">
                {abertos.map((evento) => (
                    <div
                        key={evento.Id}
                        className="col-evento-select"
                    >
                        <a target="_blank" href={evento.UrlDestino} className="a-normal">
                            <AsyncBg evento={evento} />

                            <div className="card-body">
                                <span
                                    style={{
                                        display: "block",
                                        color: "#9b2125",
                                    }}
                                >
                                    {evento.Data}
                                </span>
                                <h3
                                    style={{
                                        fontSize: "16px",
                                        marginTop: "4px",
                                        marginBottom: "4px",
                                    }}
                                >
                                    {evento.Numeracao > 0 ? `${evento.Numeracao}º ` : ""}
                                    {evento.Titulo}
                                </h3>

                                {evento.Valor > 0 && (
                                    <p
                                        style={{
                                            display: "block",
                                            color: "#686464",
                                        }}
                                    >
                                        {evento.Valor.toLocaleString("pt-BR", {
                                            minimumFractionDigits: 2,
                                            style: "currency",
                                            currency: "BRL",
                                        })}
                                    </p>
                                )}
                            </div>
                        </a>
                    </div>
                ))}
            </div>
            {informativos.length > 0 && (
                <div >
                    <h3
                        style={{
                            fontWeight: 900,
                            fontSize: "22px",
                        }}
                    >
                        Informativos
                    </h3>
                </div>
            )}
            <div class="events-holder">
                {informativos.map((evento) => (
                    <div
                        key={evento.Id}
                        className="col-evento-select"
                    >
                        <a target="_blank" href={evento.UrlDestino} className="a-normal">
                            <AsyncBg evento={evento} />

                            <div className="card-body">
                                <span
                                    style={{
                                        display: "block",
                                        color: "#9b2125",
                                    }}
                                >
                                    {evento.Data}
                                </span>
                                <h3
                                    style={{
                                        fontSize: "16px",
                                        marginTop: "4px",
                                        marginBottom: "4px",
                                    }}
                                >
                                    {evento.Numeracao > 0 ? `${evento.Numeracao}º ` : ""}
                                    {evento.Titulo}
                                </h3>

                                {evento.Valor > 0 && (
                                    <p
                                        style={{
                                            display: "block",
                                            color: "#686464",
                                        }}
                                    >
                                        {evento.Valor.toLocaleString("pt-BR", {
                                            minimumFractionDigits: 2,
                                            style: "currency",
                                            currency: "BRL",
                                        })}
                                    </p>
                                )}
                            </div>
                        </a>
                    </div>
                ))}
            </div>
            {emBreve.length > 0 && (
                <div >
                    <h3
                        style={{
                            fontWeight: 900,
                            fontSize: "22px",
                        }}
                    >
                        Inscrições em breve
                    </h3>
                </div>
            )}
            <div class="events-holder">
                {emBreve.map((evento) => (
                    <div
                        key={evento.Id}
                        className="col-evento-select"
                    >
                        <AsyncBg evento={evento} />
                        <div className="card-body">
                            <span
                                style={{
                                    display: "block",
                                    color: "#9b2125",
                                }}
                            >
                                {evento.Data}
                            </span>
                            <h3
                                style={{
                                    fontSize: "16px",
                                    marginTop: "4px",
                                    marginBottom: "4px",
                                }}
                            >
                                {evento.Numeracao > 0 ? `${evento.Numeracao}º ` : ""}
                                {evento.Titulo}
                            </h3>

                            {evento.Valor > 0 && (
                                <p
                                    style={{
                                        display: "block",
                                        color: "#686464",
                                    }}
                                >
                                    {evento.Valor.toLocaleString("pt-BR", {
                                        minimumFractionDigits: 2,
                                        style: "currency",
                                        currency: "BRL",
                                    })}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );

    function AsyncBg({ evento }) {

        const [size, setSize] = useState()

        useEffect(() => {
            setSize($('.bloco-normal').width())
       
        }, [$('.bloco-normal').width()]);

        const loaded = size ? useProgressiveImage(`/Inscricoes/GetBGEventoGlobal/${evento.Id}?size=${size}`) : undefined
        return <div
            className="bloco bloco-normal"


            style={{
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                paddingBottom: "100%",
                backgroundImage: `url(${loaded || '/assets/img/Loading_icon.gif'})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >

            <span
                className="badge m-r-xs"
                style={{
                    position: "absolute",
                    top: "5px",
                    left: "5px",
                    zIndex: 999999,
                    background: "#fff",
                    color: "#000",
                    textOverflow: "ellipsis",
                    maxWidth: "90%",
                    overflowX: "hidden",
                }}
            >
                {evento.Identificador}
            </span>
        </div>;
    }
}
