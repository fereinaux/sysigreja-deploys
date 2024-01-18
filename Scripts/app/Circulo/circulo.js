
rootCirculos = ReactDOM.createRoot(document.getElementById("circulos"));
rootList = ReactDOM.createRoot(document.getElementById("list"));

loadPanels = typeof loadPanels !== 'undefined' ? loadPanels : function () { }
loadList = typeof loadList !== 'undefined' ? loadList : function () { }
map = initMap('map')
markerLayer = createMarkerLayer(map)
map.setView([-8.050000, -34.900002], 13);
initTableCirculo = false
setInterval(function () {
    map.invalidateSize();
}, 100);
selectedMarkersCirculo = []
circuloId = null
swalCirculos = {
    title: `Impressão de ${SelectedEvent.EquipeCirculo}`,
    icon: "info",
    text: "Como você deseja imprimir?",
    className: "button-center",
    dangerMode: true,
    buttons: {
        door: {
            text: "Resumido",
            value: "resume",
            className: "btn-info w-150 btn-resume"
        },
        full: {
            text: "Completo",
            value: "full",
            className: "btn-primary w-150 btn-full"
        }, test: {
            visible: false
        }
    }


}



new L.Control.Draw({
    draw: {
        marker: false,
        polygon: false,
        polyline: false,
        rectangle: true,
        circle: false,
        circlemarker: false
    },
    edit: false
}).addTo(map);

L.Rectangle.include({
    contains: function (latLng) {
        return this.getBounds().contains(latLng);
    }
});


selectedMarkersCirculo = []

map.on(L.Draw.Event.CREATED, function (e) {
    selectedMarkersCirculo = []

    markerLayer.eachLayer(function (marker) {
        if (!e.layer.contains(marker.getLatLng())) {
            marker.setOpacity(0.25);
        } else {
            marker.setOpacity(1);
            selectedMarkersCirculo.push(marker)
        }
    });
    setTimeout(() => {

        selectedMarkersCirculo[0]._icon._tippy.show()

    }, 100)

});

function CarregarTabelaCirculo() {
    var columnsTb = [
        {
            data: "Titulo", name: "Titulo", autoWidth: true, render: function (data, type, row) {
                return `<div>
<span style="background-color:${row.Cor}" class="dot"></span>
                        <span>${row.Titulo}</br></span>
                       
                    </div>`
            }
        },
        { data: "QtdParticipantes", name: "QtdParticipantes", autoWidth: true },
        {
            data: "Id", name: "Id", className: "text-center", orderable: false, width: "15%",
            "render": function (data, type, row) {
                return `${GetButton('ListarDirigentes', JSON.stringify(row), 'blue', 'fa-list-alt', `Listar Dirigentes do(a) ${SelectedEvent.EquipeCirculo}`)}
                            ${GetButton('PrintCirculo', JSON.stringify(row), 'green', 'fa-print', 'Imprimir')}  
                            ${GetButton('EditCirculo', JSON.stringify(row), 'blue', 'fa-edit', 'Editar')}                            
                            ${GetButton('DeleteCirculo', data, 'red', 'fa-trash', 'Excluir')}
                            ${GetButton('EsvaziarCirculo', data, 'red', 'fas fa-ban', 'Esvaziar')}`;
            }
        }
    ]

    const ajaxConfig = {
        url: '/Circulo/GetCirculos',
        datatype: "json",
        data: { EventoId: function () { return SelectedEvent.Id }, },
        type: "POST"
    }

    const tableCirculoConfig = {
        language: languageConfig,
        lengthMenu: [200, 500, 1000],
        colReorder: false,
        serverSide: false,
        deferloading: 0,
        orderCellsTop: true,
        fixedHeader: true,
        filter: true,
        orderMulti: false,
        responsive: true, stateSave: true, stateSaveCallback: stateSaveCallback, stateLoadCallback: stateLoadCallback,
        destroy: true,
        searchDelay: 750,
        dom: domConfigNoButtons,
        columns: columnsTb,
        order: [
            [0, "asc"]
        ],
        drawCallback: function (settings) {
            const arrayData = this.api().rows({ search: 'applied', order: 'applied' })
                .data()
                .toArray()

            loadPanels(rootCirculos, arrayData.map((circulo) => {
                return {
                    ...circulo,
                    Title: ` ${circulo.Titulo}`,
                    Total: circulo.QtdParticipantes,
                    Participantes:
                        SelectedEvent.TipoEvento == "Individual"
                            ? _.orderBy(circulo.Participantes, "Nome", "asc")
                            : _.orderBy(
                                circulo.Participantes,
                                ["SequencialEvento", "Sexo"],
                                "asc"
                            ),
                };
            }), PrintCirculo)


            GetParticipantesSemCirculo()
            var bairros = []
            markerLayer.clearLayers();
            arrayData.forEach(circulo => {
                circulo.Participantes.forEach(participante => {
                    if (participante.Latitude && participante.Longitude) {
                        if (!setView) {
                            setView = true
                            map.setView([participante.Latitude, participante.Longitude], 13);
                        }
                        if (!bairros.includes(participante.Bairro)) {
                            bairros.push(participante.Bairro)
                        }


                        let addPin = true
                        map.eachLayer(function (layer) {

                            if (layer._latlng?.lat == participante.Latitude && layer._latlng?.lng == participante.Longitude) {


                                addPin = false
                                var div = document.createElement("div");
                                layer.props["ParticipantesId"] = layer.props.ParticipantesId ? [...layer.props.ParticipantesId, participante.ParticipanteId] : [layer.props.ParticipanteId, participante.ParticipanteId];
                                $(div).html(layer._icon._tippy.props.content)
                                $(div).find('.popup-handler').css('width','700px')
                                $(div).find('.popup-handler').append(`<div class="hide-multiple" style="width:350px"><h4 class="hide-multiple">Nome: ${participante.Nome}</h4><h4 class="hide-multiple">${SelectedEvent.EquipeCirculo}: <span style="background-color:${circulo.Cor}" class="dot"></span> ${circulo.Titulo}</h4><div><span class="hide-multiple">${participante.Endereco} - ${participante.Bairro}</span>
                    <ul class="change-circulo-ul">
                       ${arrayData.map(c => `<li onclick="ChangeCirculo(${participante.ParticipanteId + "@@@@@@" + c.Id})" class="change-circulo-li" style="background:${c.Cor}"><span>${c.Titulo}</span><span>Participantes: ${c.QtdParticipantes}</span></li>`).join().replace(/,/g, '').replace(/@@@@@@/g, ',')}
                        ${`<li onclick = "ChangeCirculo(${participante.ParticipanteId + "@@@@@@" + null})" class="change-circulo-li" style = "background:#bb2d2d"><span>Remover</span></li>`.replace(/,/g, '').replace(/@@@@@@/g, ',')}
                    </ul>
                    </div></div>`)

                                layer._icon._tippy.setContent(div)
                            }
                        })
                        if (addPin) {
                            instance = tippy(addMapa(participante.Latitude, participante.Longitude, participante.Nome, circulo.Cor, participante.ParticipanteId, 'circulo', participante)._icon, {
                                allowHTML: true,
                                content: `<div class="popup-handler" style="display:flex;flex-wrap:wrap"><div style="width:350px"><h4 class="hide-multiple">Nome: ${participante.Nome}</h4><h4 class="hide-multiple">${SelectedEvent.EquipeCirculo}:  <span style="background-color:${circulo.Cor}" class="dot"></span> ${circulo.Titulo}</h4><div><span class="hide-multiple">${participante.Endereco} - ${participante.Bairro}</span>
                    <ul class="change-circulo-ul">
                       ${arrayData.map(c => `<li onclick="ChangeCirculo(${participante.ParticipanteId + "@@@@@@" + c.Id})" class="change-circulo-li" style="background:${c.Cor}"><span>${c.Titulo}</span><span>Participantes: ${c.QtdParticipantes}</span></li>`).join().replace(/,/g, '').replace(/@@@@@@/g, ',')}
                     ${`<li onclick = "ChangeCirculo(${participante.ParticipanteId + "@@@@@@" + null})" class="change-circulo-li" style = "background:#bb2d2d"><span>Remover</span></li>`.replace(/,/g, '').replace(/@@@@@@/g, ',')}
                       </ul>
                    </div></div></div>`,
                                placement: 'right-start',
                                maxWidth: 700,
                                trigger: 'click',
                                interactive: true,
                                arrow: false,
                                onMount: () => {
                                    if (selectedMarkersCirculo.length > 1) {
                                        $('.hide-multiple').css('display', 'none')
                                    } else {
                                        $('.hide-multiple').css('display', 'block')
                                    }
                                },
                                onHide: () => {
                                    selectedMarkersCirculo = []
                                    Object.values(map._layers).filter(e => e.props).forEach(e => map._layers[e._leaflet_id].setOpacity(1))
                                    $("#bairros").val([]).trigger('change');
                                    $('#filtro-nome').val('')
                                }
                            });
                        }

                    }
                })
            })
            $('.div-map').css('display', 'block')
            $("#bairros").html(`
${bairros.map(p => `<option value=${p}>${p}</option>`)}
`)
            $("#bairros").select2({
                placeholder: "Filtro de bairros",
            })



        },
        ajax: ajaxConfig
    };

    if (!$.fn.DataTable.isDataTable('#table-circulo')) {
        $('#table-circulo').DataTable(tableCirculoConfig)
    } else {

        $("#table-circulo").DataTable().ajax.reload()
    }


}

$(document).off('ready-ajax').on('ready-ajax', () => {

    $("#Participante").on("keyup", function () {
        var value = $(this).val().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
        $("#table-participantes tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').indexOf(value) > -1)
        });
    });

    loadCirculo()
});

function PrintCirculo(row) {

    const ajaxPrint = (type) => $.ajax({
        url: '/Participante/GetParticipantesByCirculo',
        data: { CirculoId: row.Id },
        datatype: "json",
        type: "GET",
        success: (result) => {
            var doc = type == "resume" ? CriarPDFA4() : CriarPDFA4Landscape();
            if (type == "resume") {
                FillDoc(doc, result, type)
            } else {
                FillDocLandscape(doc, result, type)
            }
            printDoc(doc);
        }
    });

    CustomSwal(swalCirculos).then(res => { if (res) ajaxPrint(res) })
}




function FillDocLandscape(doc, result) {
    if (SelectedEvent.LogoRelatorioId) {
        var img = new Image();
        img.src = `/Arquivo/GetArquivo/${SelectedEvent.LogoRelatorioId}`;
        doc.addImage(img, 'PNG', 10, 10, 50, 21);
    }


    doc.setFont('helvetica', "normal")
    doc.setFontSize(12);
    doc.text(77, 15, `${SelectedEvent.Titulo} ${SelectedEvent.Numeracao}`);
    doc.text(77, 20, `${SelectedEvent.EquipeCirculo} ${result.data[0].Titulo?.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').trim() || result.data[0].Cor}`);
    doc.text(77, 25, `Data de Impressão: ${moment().format('DD/MM/YYYY HH:mm')}`);;
    doc.line(10, 38, 285, 38);


    height = 43;
    if (result.data[0].Dirigentes.length > 0) {
        doc.setFont('helvetica', "bold")
        doc.text(12, height, "Dirigentes");

        height += 6;
        doc.setFont('helvetica', "bold")
        if (SelectedEvent.TipoEvento == "Casais") {
            doc.text(12, height, "Nome");
            doc.text(112, height, "Whatsapp");
        } else {
            doc.text(12, height, "Nome");
            doc.text(117, height, "Apelido");
            doc.text(152, height, "Whatsapp");
        }

        height += 2
        doc.line(10, height, 285, height);
        height += 5
        doc.setFont('helvetica', "normal")
        $(result.data[0].Dirigentes).each((index, dirigente) => {
            doc.text(12, height, dirigente.Nome);

            if (SelectedEvent.TipoEvento == "Casais") {
                doc.text(12, height, dirigente.Nome);
                doc.text(112, height, dirigente.Fone);
            } else {
                doc.text(12, height, dirigente.Nome);
                doc.text(117, height, dirigente.Apelido);
                doc.text(152, height, dirigente.Fone);

            }
            height += 6;
        });
    }

    doc.setFont('helvetica', "bold")
    if (SelectedEvent.TipoEvento == "Casais") {
        doc.text(12, height, "Casal");
        doc.text(82, height, "Whatsapp");
        doc.text(182, height, "Bairro");
        doc.text(222, height, "Cidade");
    } else {
        doc.text(12, height, "Nome");
        doc.text(117, height, "Apelido");
        doc.text(152, height, "Whatsapp");
        doc.text(195, height, "Bairro");
        doc.text(235, height, "Cidade");
    }

    height += 2
    doc.line(10, height, 285, height);
    height += 5
    doc.setFont('helvetica', "normal")
    $(result.data).each((index, participante) => {
        if (SelectedEvent.TipoEvento == "Casais") {
            doc.text(12, height, participante.Nome);
            doc.text(82, height, participante.Fone);
            doc.text(182, height, participante.Bairro || "");
            doc.text(222, height, participante.Cidade || "");
        } else {
            doc.text(12, height, participante.Nome);
            doc.text(117, height, participante.Apelido);
            doc.text(152, height, participante.Fone);
            doc.text(195, height, participante.Bairro || "");
            doc.text(235, height, participante.Cidade || "");
        }

        height += 6;
    });

    AddCount(doc, result.data, height, 285);
}

function FillDoc(doc, result) {
    if (SelectedEvent.LogoRelatorioId) {
        var img = new Image();
        img.src = `/Arquivo/GetArquivo/${SelectedEvent.LogoRelatorioId}`;
        doc.addImage(img, 'PNG', 10, 10, 50, 21);
    }


    doc.setFont('helvetica', "normal")
    doc.setFontSize(12);
    doc.text(77, 15, `${SelectedEvent.Titulo} ${SelectedEvent.Numeracao}`);
    doc.text(77, 20, `${SelectedEvent.EquipeCirculo} ${result.data[0].Titulo?.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').trim() || result.data[0].Cor}`);
    doc.text(77, 25, `Data de Impressão: ${moment().format('DD/MM/YYYY HH:mm')}`);;
    doc.line(10, 38, 195, 38);


    height = 43;
    if (result.data[0].Dirigentes.length > 0) {
        doc.setFont('helvetica', "bold")
        doc.text(12, height, "Dirigentes");

        height += 6;
        doc.setFont('helvetica', "bold")
        if (SelectedEvent.TipoEvento == "Casais") {
            doc.text(12, height, "Nome");
            doc.text(112, height, "Whatsapp");
        } else {
            doc.text(12, height, "Nome");
            doc.text(117, height, "Apelido");
            doc.text(152, height, "Whatsapp");
        }

        height += 2
        doc.line(10, height, 195, height);
        height += 5
        doc.setFont('helvetica', "normal")
        $(result.data[0].Dirigentes).each((index, dirigente) => {
            doc.text(12, height, dirigente.Nome);

            if (SelectedEvent.TipoEvento == "Casais") {
                doc.text(12, height, dirigente.Nome);
                doc.text(112, height, dirigente.Fone);
            } else {
                doc.text(12, height, dirigente.Nome);
                doc.text(117, height, dirigente.Apelido);
                doc.text(152, height, dirigente.Fone);
            }
            height += 6;
        });
    }

    doc.setFont('helvetica', "bold")
    if (SelectedEvent.TipoEvento == "Casais") {
        doc.text(12, height, "Casal");
        doc.text(112, height, "Whatsapp");
    } else {
        doc.text(12, height, "Nome");
        doc.text(117, height, "Apelido");
        doc.text(152, height, "Whatsapp");
    }

    height += 2
    doc.line(10, height, 195, height);
    height += 5
    doc.setFont('helvetica', "normal")
    $(result.data).each((index, participante) => {
        if (SelectedEvent.TipoEvento == "Casais") {
            doc.text(12, height, participante.Nome);
            doc.text(112, height, participante.Fone);
        } else {
            doc.text(12, height, participante.Nome);
            doc.text(117, height, participante.Apelido);
            doc.text(152, height, participante.Fone);
        }

        height += 6;
    });

    AddCount(doc, result.data, height);
}

function GetCirculo(id) {
    if (id > 0) {
        $.ajax({
            url: "/Circulo/GetCirculo/",
            data: { Id: id },
            datatype: "json",
            type: "GET",
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                $("#circulo-id").val(data.Circulo.Id);
                $("#circulo-cores").val(data.Circulo.Cor.trim())
                $("#circulo-titulo").val(data.Circulo.Titulo)



            }
        });
    }
    else {
        $("#circulo-id").val(0);
        $("#circulo-titulo").val("");
        $("#circulo-cores").val("#bada55");
    }
}

function EditCirculo(row) {
    GetCirculo(row.Id)
    $("#modal-circulo").modal();
}


function DeleteCirculo(id) {
    ConfirmMessageDelete().then((result) => {
        if (result) {
            $.ajax({
                url: "/Circulo/DeleteCirculo/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: id
                    }),
                success: function () {
                    SuccessMesageDelete();
                    CarregarTabelaCirculo();
                }
            });
        }
    });
}


function EsvaziarCirculo(id) {
    ConfirmMessage(`Essa ação ira esvaziar o(a) ${SelectedEvent.EquipeCirculo}, você confirma a operação?`).then((result) => {
        if (result) {
            $.ajax({
                url: "/Circulo/EsvaziarCirculo/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: id
                    }),
                success: function () {
                    SuccessMesageOperation();
                    CarregarTabelaCirculo();
                }
            });
        }
    });
}



function EsvaziarTodosCirculo() {
    ConfirmMessage(`Essa ação ira esvaziar TODOS(AS) os(as) ${SelectedEvent.EquipeCirculo}, você confirma a operação?`).then((result) => {
        if (result) {
            $.ajax({
                url: "/Circulo/EsvaziarTodosCirculo/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: SelectedEvent.Id
                    }),
                success: function () {
                    SuccessMesageOperation();
                    CarregarTabelaCirculo();
                }
            });
        }
    });
}


function PostCirculo() {
    if (ValidateForm(`#form-circulo`)) {
        $.ajax({
            url: "/Circulo/PostCirculo/",
            datatype: "json",
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(
                {
                    Id: $("#circulo-id").val(),
                    EventoId: SelectedEvent.Id,
                    Cor: $("#circulo-cores").val(),
                    Titulo: $("#circulo-titulo").val()
                }),
            success: function () {
                SuccessMesageOperation();
                CarregarTabelaCirculo();
                $("#modal-circulo").modal("hide");
            }
        });
    }
}

function DistribuirCirculos() {
    $.ajax({
        url: "/Circulo/DistribuirCirculos/",
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            {
                EventoId: SelectedEvent.Id
            }),
        success: function () {
            SuccessMesageOperation();
            loadCirculo()
            $("#modal-circulo").modal("hide");
        }
    });
}

var semCirculo

function GetParticipantesSemCirculo() {


    $.ajax({
        url: "/Circulo/GetParticipantesSemCirculo/",
        data: { EventoId: SelectedEvent.Id },
        datatype: "json",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            semCirculo = data.Participantes
            loadList(rootList, data.Participantes.map(item => ({
                ...item,
                Value: item.Nome
            })), `Participantes sem ${SelectedEvent.EquipeCirculo}`, "Buscar Participante")

        }
    });
}

var setView = false

function addMapa(lat, long, nome, cor, id, type, props) {
    let marker = L.marker([lat, long], { icon: getIcon(cor.trim()) })
    marker.props = props
    return marker.addTo(markerLayer);


}

function filtrarBairro() {
    if ($('#bairros').val().length == 0) {
        Object.values(map._layers).filter(e => e.props).forEach(e => map._layers[e._leaflet_id].setOpacity(1))
    } else {
        Object.values(map._layers).filter(e => e.props && $('#bairros').val().includes(e.props.Bairro)).forEach(e => map._layers[e._leaflet_id].setOpacity(1))
        Object.values(map._layers).filter(e => e.props && !$('#bairros').val().includes(e.props.Bairro)).forEach(e => map._layers[e._leaflet_id].setOpacity(0.25))
    }
}

function filtrarNome() {
    if (!$('#filtro-nome').val()) {
        Object.values(map._layers).filter(e => e.props).forEach(e => map._layers[e._leaflet_id].setOpacity(1))
    } else {
        Object.values(map._layers).filter(e => e.props && removeDiacritics(e.props.Nome.trim().toLowerCase()).includes(removeDiacritics($('#filtro-nome').val().trim().toLowerCase()))).forEach(e => map._layers[e._leaflet_id].setOpacity(1))
        Object.values(map._layers).filter(e => e.props && !removeDiacritics(e.props.Nome.trim().toLowerCase()).includes(removeDiacritics($('#filtro-nome').val().trim().toLowerCase()))).forEach(e => map._layers[e._leaflet_id].setOpacity(0.25))
    }
}

function DragDropg() {
    $('.draggable').each(function () {
        instance = tippy(this, {
            allowHTML: true,
            content: '',
            placement: 'right-start',
            trigger: 'click',
            interactive: true,
            arrow: false,
            onTrigger: (instance, event) => {

                var Circulos = $("#table-circulo").DataTable().data().toArray();

                var CirculoParticipante = Circulos.find(x => x.Participantes.some(y => y.ParticipanteId == $(this).data('id')))

                if (CirculoParticipante) {

                    var Participante = CirculoParticipante.Participantes.find(x => x.ParticipanteId == $(this).data('id'))

                    instance.setContent(`<div class="popup-handler" style="display:flex"><div style="width:350px"><h4 class="hide-multiple">Nome: ${Participante.Nome}</h4><h4 class="hide-multiple">${SelectedEvent.EquipeCirculo}:  <span style="background-color:${CirculoParticipante.Cor}" class="dot"></span> ${CirculoParticipante.Titulo}</h4><div><span class="hide-multiple">${Participante.Endereco} - ${Participante.Bairro}</span>
                    <ul class="change-circulo-ul">
                       ${Circulos.filter(x => x.Id != CirculoParticipante.Id).map(c => `<li onclick="ChangeCirculo(${Participante.ParticipanteId + "@@@@@@" + c.Id})" class="change-circulo-li" style="background:${c.Cor}"><span>${c.Titulo}</span><span>Participantes: ${c.QtdParticipantes}</span></li>`).join().replace(/,/g, '').replace(/@@@@@@/g, ',')}
                       ${`<li onclick = "ChangeCirculo(${Participante.ParticipanteId + "@@@@@@" + null})" class="change-circulo-li" style = "background:#bb2d2d"><span>Remover</span></li>`.replace(/,/g, '').replace(/@@@@@@/g, ',')}
                    </ul>
                    </div></div></div>`)

                } else {
                    var Participante = semCirculo.find(x => x.Id == $(this).data('id'))

                    instance.setContent(`<div class="popup-handler" style="display:flex"><div style="width:350px"><h4 class="hide-multiple">Nome: ${Participante.Nome}</h4><div>
                    <ul class="change-circulo-ul">
                       ${Circulos.map(c => `<li onclick="ChangeCirculo(${Participante.Id + "@@@@@@" + c.Id})" class="change-circulo-li" style="background:${c.Cor}"><span>${c.Titulo}</span><span>Participantes: ${c.QtdParticipantes}</span></li>`).join().replace(/,/g, '').replace(/@@@@@@/g, ',')}
                    </ul>
                    </div></div></div>`)
                }
            },
        });
    });


}

function ChangeCirculo(participanteId, destinoId) {
    initTableCirculo = false;
    if (selectedMarkersCirculo.length > 0) {
        let arrPromises = []

        selectedMarkersCirculo.forEach(marker => {
            $.blockUI({
                css: {
                    backgroundColor: 'transparent',
                    border: 'none'
                },
                message: `<div class="spinner">
  <div style="background-color:${SelectedEvent.CorBotao}" class="rect1"></div>
  <div style="background-color:${SelectedEvent.CorBotao}" class="rect2"></div>
  <div style="background-color:${SelectedEvent.CorBotao}" class="rect3"></div>
  <div style="background-color:${SelectedEvent.CorBotao}" class="rect4"></div>
  <div style="background-color:${SelectedEvent.CorBotao}" class="rect5"></div>
</div>`,
                baseZ: 3500,
                overlayCSS: {
                    opacity: 0.7,
                    cursor: 'wait'
                }
            });

            marker.props.ParticipantesId = marker.props.ParticipantesId ?? [marker.props.ParticipanteId]

            marker.props.ParticipantesId.forEach(participanteId => 
    
            arrPromises.push($.ajax({
                url: "/Circulo/ChangeCirculo/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        ParticipanteId: participanteId,
                        DestinoId: destinoId
                    })
            }))
            )
        })

        Promise.all(arrPromises).then((r) => {
            CarregarTabelaCirculo();
            map.closePopup()
            selectedMarkersCirculo = []
            $.unblockUI();
            tippy.hideAll()
        })

    } else {
        $.ajax({
            url: "/Circulo/ChangeCirculo/",
            datatype: "json",
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(
                {
                    ParticipanteId: participanteId,
                    DestinoId: destinoId
                }),
            success: function () {
                tippy.hideAll()
                CarregarTabelaCirculo();
                map.closePopup()
                selectedMarkersCirculo = []
            }
        });
    }
}



function PrintAll() {
    const ajaxPrint = (type) => {
        let doc = type == "resume" ? CriarPDFA4() : CriarPDFA4Landscape();
        $.ajax({
            url: '/Circulo/GetCirculos',
            datatype: "json",
            data: { EventoId: SelectedEvent.Id },
            type: "POST",
            success: function (data) {
                var arrPromises = []
                data.data.forEach(element => {
                    if (element.QtdParticipantes > 0) {
                        arrPromises.push($.ajax({
                            url: '/Participante/GetParticipantesByCirculo',
                            data: { CirculoId: element.Id },
                            datatype: "json",
                            type: "GET"

                        }))
                    }
                })
                Promise.all(arrPromises).then(result => {
                    result.forEach((data, index) => {
                        if (data.data.length > 0) {
                            if (index > 0) {
                                doc.addPage()
                            }
                            if (type == "resume") {
                                FillDoc(doc, data)
                            } else {
                                FillDocLandscape(doc, data)
                            }
                        }
                    })
                    printDoc(doc);
                })

            }
        })

    }

    CustomSwal(swalCirculos).then(res => ajaxPrint(res || "resume"))

}



function AddDirigente() {

    if ($("#circulo-dirigentes").val() != "Pesquisar") {
        CustomSwal({
            title: "Você tem certeza?",
            icon: "logo",
            text: `Um usuário com acesso "Dirigente" para ${$("#circulo-dirigentes option:selected").text()} será criado`,
            className: "button-center",
            buttons: {
                cancelar: {
                    text: "Cancelar",
                    value: false,
                    className: "w-150 btn-cancelar"
                },
                confirmar: {
                    text: "Confirmar",
                    value: true,
                    className: "w-150 btn-confirmar"
                },

            }
        }).then(result => {
            var windowReference = window.open('_blank');

            $.ajax({
                url: "/Circulo/AddDirigente/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        EquipanteId: $("#circulo-dirigentes").val(),
                        CirculoId: circuloId,
                    }),
                success: function (data) {
                    SuccessMesageOperation();
                    $("#circulo-dirigentes").val("Pesquisar").trigger("chosen:updated");
                    CarregarTabelaDirigentes(circuloId)
                    if (data) {

                        windowReference.location = GetLinkWhatsApp(data.User.Fone, MsgUsuario(data.User))
                    }
                },
            });
        })
    }
}


function DeleteDirigente(id) {
    ConfirmMessageDelete().then((result) => {
        if (result) {
            $.ajax({
                url: "/Circulo/DeleteDirigente/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: id
                    }),
                success: function () {
                    SuccessMesageDelete();
                    CarregarTabelaDirigentes(circuloId)
                }
            });
        }
    });
}

$("#modal-dirigentes").on('hidden.bs.modal', function () {
    CarregarTabelaCirculo();
});

function ListarDirigentes(row) {
    $("#circulo-dirigentes").val("Pesquisar").trigger("chosen:updated");
    circuloId = row.Id
    CarregarTabelaDirigentes(circuloId);

    $("#modal-dirigentes").modal();
}


function CarregarTabelaDirigentes(circuloId) {
    const tableDirigentesConfig = {
        language: languageConfig,
        lengthMenu: [200, 500, 1000],
        colReorder: false,
        serverSide: false,
        deferloading: 0,
        orderCellsTop: true,
        fixedHeader: true,
        filter: true,
        orderMulti: false,
        responsive: true, stateSave: true, stateSaveCallback: stateSaveCallback, stateLoadCallback: stateLoadCallback,
        destroy: true,
        dom: domConfig,
        buttons: getButtonsConfig('Dirigentes'),
        columns: [
            { data: "Nome", name: "Nome", autoWidth: true },
            {
                data: "Id", name: "Id", orderable: false, width: "35%",
                "render": function (data, type, row) {
                    var color = !(Coordenador == row.Tipo) ? 'info' : 'yellow';

                    return `
                            ${GetButton('DeleteDirigente', data, 'red', 'fa-trash', 'Excluir')}`;
                }
            }
        ],
        order: [
            [0, "asc"]
        ],
        ajax: {
            url: '/Circulo/GetDirigentes',
            data: { CirculoId: circuloId },
            datatype: "json",
            type: "POST"
        }
    };
    GetDirigentes();
    $("#table-dirigentes").DataTable(tableDirigentesConfig);
}


function GetDirigentes() {

    $("#circulo-dirigentes").empty();
    $('#circulo-dirigentes').append($('<option>Pesquisar</option>'));

    $.ajax({
        url: "/Circulo/GetEquipantes/",
        data: { EventoId: SelectedEvent.Id },
        datatype: "json",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            data.Equipantes.forEach(function (equipante, index, array) {
                $('#circulo-dirigentes').append($(`<option value="${equipante.Id}">${equipante.Nome}</option>`));
            });
            $("#circulo-dirigentes").val("Pesquisar").trigger("chosen:updated");
        }
    });

}

function loadCirculo() {

    $('title').text(`${SelectedEvent.Titulo} | ${SelectedEvent.EquipeCirculo}`)
    $('.title-circulo').text(SelectedEvent.EquipeCirculo || "Equipe de Grupos")
    if (SelectedEvent.TipoCirculo == 'Endereco') {
        $('#ibox-mapa-circulo').css('display', 'block')
    } else {
        $('#ibox-mapa-circulo').css('display', 'none')
    }
    CarregarTabelaCirculo();
}
