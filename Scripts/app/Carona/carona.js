
rootCarona = ReactDOM.createRoot(document.getElementById("caronas"));
rootList = ReactDOM.createRoot(document.getElementById("list"));
loadList = typeof loadList !== 'undefined' ? loadList : function () { }
arrayCaronas = []
arrayCaroneiros = []
map = initMap('map')
loadPanels = typeof loadPanels !== 'undefined' ? loadPanels : function () { }
markerLayer = createMarkerLayer(map)
setInterval(function () {
    map.invalidateSize();
}, 100);

var setView = false

function CarregarTabelaCarona() {

    $('#gerenciar').text("Gerenciar Caronas");
    $('#participantes-sem').text("Participantes sem Carona");
    var columnsTb = [
        { data: "Motorista", name: "Motorista", autoWidth: true },
        { data: "Capacidade", name: "Capacidade", autoWidth: true },
        {
            data: "Id", name: "Id", orderable: false, width: "15%",
            "render": function (data, type, row) {
                return `
                            ${GetButton('PrintCarona', JSON.stringify(row), 'green', 'fa-print', 'Imprimir')}  
                            ${GetButton('EditCarona', JSON.stringify(row), 'blue', 'fa-edit', 'Editar')}                            
                            ${GetButton('DeleteCarona', data, 'red', 'fa-trash', 'Excluir')}`;
            }
        }
    ]


    const tableCaronaConfig = {
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
        dom: domConfigNoButtons,
        columns: columnsTb,
        order: [
            [0, "asc"]
        ],
        drawCallback: function (settings) {
            var api = this.api();
            var dataArray = api.rows({ search: 'applied', order: 'applied' }).data().toArray()

            loadPanels(rootCarona, dataArray.map((carona) => {
                return {
                    ...carona,
                    Cor: '#424242',
                    Title: carona.Motorista,
                    Total: carona.Capacidade,
                    Participantes:
                        carona.Participantes.length > 0
                            ? _.orderBy(carona.Participantes, "Nome", "asc")
                            : _.orderBy(carona.Equipantes, "Nome", "asc"),
                };
            }), PrintCarona)
            GetParticipantesSemCarona();

            if (dataArray.length > 0) {

                markerLayer.getLayers().forEach(mark => mark.remove())

                if (!setView) {
                    setView = true
                    mapSetView = dataArray.filter(x => x.Participantes.some(y => y.Latitude && y.Longitude))[0].Participantes[0]
                    map.setView([mapSetView.Latitude, mapSetView.Longitude], 10);
                }
                dataArray.forEach(function (carona, index, array) {

                    if (carona.Latitude && carona.Longitude) {

                        addMapa(carona.Latitude, carona.Longitude, carona.Motorista, 'carpng', carona.MotoristaId, 'motorista')
                            .bindPopup(`<h4>Motorista: ${carona.Motorista}</h4> <span>${carona.Endereco}<i style="cursor:pointer;margin-left:3px;font-size:15px" onclick="copyContent('${carona.Endereco}')" class="fas fa-clipboard"></i></span>`);
                    }

                    carona.Participantes.forEach(participante => {

                        let addCarona = true
                        map.eachLayer(function (layer) {

                            if (layer._latlng?.lat == participante.Latitude && layer._latlng?.lng == participante.Longitude) {
                                addCarona = false
                                layer.bindPopup(layer._popup?._content + `<h4>Participante: ${participante.Nome}</h4>
<h4>Motorista: ${carona.Motorista}</h4>
                        <span>${carona.Endereco}</span>`)
                            }
                        })
                        if (addCarona) {
                            addMapa(participante.Latitude, participante.Longitude, participante.Nome, '#d93c3c', participante.ParticipanteId, 'carona')
                                .bindPopup(`<h4>Participante: ${participante.Nome}</h4>
<h4>Motorista: ${carona.Motorista}</h4>
                        <span>${carona.Endereco}</span>`)
                        }

                    })

                });
            }

            $('.div-map').css('display', 'block')
        },
        ajax: {
            url: '/Carona/GetCaronas',
            datatype: "json",
            data: { EventoId: function () { return SelectedEvent.Id }, },
            type: "POST"
        }
    };

    if (!$.fn.DataTable.isDataTable('#table-carona')) {
        $("#table-carona").DataTable(tableCaronaConfig);
    } else {

        $("#table-carona").DataTable().ajax.reload()
    }


}

$(document).off('ready-ajax').on('ready-ajax', () => {

    $("#Participante").on("keyup", function () {
        var value = $(this).val().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
        $("#table-participantes tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').indexOf(value) > -1)
        });
    });

    CaronaRefresh()
});


function CaronaRefresh(destinoId) {

    CarregarTabelaCarona();
}

function PrintCarona(row) {
    $.ajax({
        url: '/Carona/GetParticipantesByCarona',
        data: { CaronaId: row.Id },
        datatype: "json",
        type: "GET",
        success: (result) => {
            var doc = CriarPDFA4();
            FillDoc(doc, result)
            printDoc(doc);
        }
    });
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



    doc.text(77, 20, `Relação de Carona`);
    doc.text(77, 25, `${result.data[0].Motorista}`);

    doc.text(77, 30, `Data de Impressão: ${moment().format('DD/MM/YYYY HH:mm')}`);;
    doc.line(10, 38, 195, 38);

    doc.setFont('helvetica', "bold")
    doc.text(12, 43, "Nome");
    doc.text(107, 43, "Apelido");
    doc.text(152, 43, "Whatsapp");

    doc.line(10, 45, 195, 45);
    doc.setFont('helvetica', "normal")
    height = 50;

    $(result.data).each((index, participante) => {
        doc.text(12, height, participante.Nome);
        doc.text(107, height, participante.Apelido);
        doc.text(152, height, participante.Fone);
        height += 6;
        doc.setFont('helvetica', "bold")
        doc.text(12, height, "Endereço:");
        doc.setFont('helvetica', "normal")
        doc.text(34, height, participante.Endereco);
        height += 8;
    });

    AddCount(doc, result.data, height);
}

function GetCarona(id) {
    if (id > 0) {
        $.ajax({
            url: "/Carona/GetCarona/",
            data: { Id: id },
            datatype: "json",
            type: "GET",
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                $("#carona-id").val(data.Carona.Id);
                if (data.Carona.MotoristaId > 0) {
                    var newOption = new Option(data.Carona.Motorista, data.Carona.MotoristaId, true, true);
                    $('#carona-motorista').append(newOption)
                }

                $("#carona-motorista").val(data.Carona.MotoristaId > 0 ? data.Carona.MotoristaId : "").trigger("change");
                $("#carona-capacidade").val(data.Carona.Capacidade)


            }
        });
    }
    else {
        $("#carona-id").val(0);
        $("#carona-motorista").val("").trigger("change")
    }
}

function EditCarona(row) {
    GetEquipantes();
    GetCarona(row.Id);
    $("#modal-carona").modal();
}


function DeleteCarona(id) {
    ConfirmMessageDelete().then((result) => {
        if (result) {
            $.ajax({
                url: "/Carona/DeleteCarona/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: id
                    }),
                success: function () {
                    SuccessMesageDelete();
                    CarregarTabelaCarona();
                }
            });
        }
    });
}

function PostCarona() {
    if (ValidateForm(`#form-carona`)) {
        $.ajax({
            url: "/Carona/PostCarona/",
            datatype: "json",
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(
                {
                    Id: $("#carona-id").val(),
                    EventoId: SelectedEvent.Id,
                    MotoristaId: $("#carona-motorista").val(),
                    Capacidade: $("#carona-capacidade").val()
                }),
            success: function () {
                SuccessMesageOperation();
                CarregarTabelaCarona();
                $("#modal-carona").modal("hide");
            }
        });
    }
}

function DistribuirCaronas() {
    $.ajax({
        url: "/Carona/DistribuirCaronas/",
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            {
                EventoId: SelectedEvent.Id
            }),
        success: function () {
            SuccessMesageOperation();
            CaronaRefresh()
        }
    });
}


function GetEquipantes(id) {

    $('#carona-motorista').select2({
        ajax: {
            delay: 750,
            url: '/Carona/GetEquipantes',
            data: function (params) {
                var query = {
                    Search: params.term,
                    EventoId: SelectedEvent.Id
                }

                // Query parameters will be ?search=[term]&type=public
                return query;
            },
            processResults: function (data) {
                // Transforms the top-level key of the response object from 'items' to 'results'
                return {
                    results: data.Items
                };
            }
        },
        placeholder: "Pesquisar",
        minimumInputLength: 3,
        dropdownParent: $('#form-carona')
    });

}

function GetParticipantesSemCarona() {
    $.ajax({
        url: "/Carona/GetParticipantesSemCarona/",
        data: { EventoId: SelectedEvent.Id },
        datatype: "json",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {

            loadList(rootList, data.Participantes.map(item => ({
                ...item,
                Value: item.Nome
            })), `Participantes sem Carona`, "Buscar Participante")
            semCarona = data.Participantes
            data.Participantes.forEach(function (participante, index, array) {

                if (participante.Latitude && participante.Longitude) {
                    addMapa(participante.Latitude, participante.Longitude, participante.Nome, '#939393', participante.Id, 'carona')
                        .bindPopup(`<h4>Participante: ${participante.Nome}</h4>
                        <span>${participante.Endereco}</span>`)
                }


            });
        }
    });
}



function addMapa(lat, long, nome, cor, id, type) {
    return L.marker([lat, long], { icon: getIcon(cor.toLowerCase().replaceAll(' ', '-')) }).addTo(markerLayer);


}

$("#modal-cores").on('hidden.bs.modal', function () {
    ChangeCarona($("#participante-id").val(), $('#participante-cor').val())
});



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

                var Caronas = $("#table-carona").DataTable().data().toArray();

                var CaronaParticipante = Caronas.find(x => x.Participantes.some(y => y.ParticipanteId == $(this).data('id')))

                if (CaronaParticipante) {

                    var Participante = CaronaParticipante.Participantes.find(x => x.ParticipanteId == $(this).data('id'))

                    instance.setContent(`<div class="popup-handler" style="display:flex"><div style="width:350px"><h4 class="hide-multiple">Nome: ${Participante.Nome}</h4><div>
                    <ul class="change-circulo-ul">
                       ${Caronas.filter(x => x.CapacidadeInt > x.Quantidade  && x.Id != CaronaParticipante.Id).map(c => `<li onclick="ChangeCarona(${Participante.ParticipanteId + "@@@@@@" + c.Id})" class="change-circulo-li" style="background:#424242"><span>${c.Motorista}</span><span>Participantes: ${c.Quantidade}</span></li>`).join().replace(/,/g, '').replace(/@@@@@@/g, ',')}
                    ${`<li onclick = "ChangeCarona(${Participante.ParticipanteId + "@@@@@@" + null})" class="change-circulo-li" style = "background:#bb2d2d"><span>Remover</span></li>`.replace(/,/g, '').replace(/@@@@@@/g, ',')}
                       </ul>
                    </div></div></div>`)

                } else {
                    var Participante = semCarona.find(x => x.Id == $(this).data('id'))

                    instance.setContent(`<div class="popup-handler" style="display:flex"><div style="width:350px"><h4 class="hide-multiple">Nome: ${Participante.Nome}</h4><div>
                    <ul class="change-circulo-ul">
                       ${Caronas.filter(x => x.CapacidadeInt > x.Quantidade).map(c => `<li onclick="ChangeCarona(${Participante.Id + "@@@@@@" + c.Id})" class="change-circulo-li" style="background:#424242"><span>${c.Motorista}</span><span>Participantes: ${c.Quantidade}</span></li>`).join().replace(/,/g, '').replace(/@@@@@@/g, ',')}
                    </ul>
                    </div></div></div>`)
                }
            },
        });
    });
}

var semCarona 

function ChangeCarona(participanteId, destinoId) {
    $.ajax({
        url: "/Carona/ChangeCarona/",
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
            CarregarTabelaCarona()
        }
    });
}


function PrintAll() {
    var doc = CriarPDFA4()
    $.ajax({
        url: '/Carona/GetCaronas',
        datatype: "json",
        data: { EventoId: SelectedEvent.Id },
        type: "POST",
        success: function (data) {
            var arrPromises = []
            data.data.forEach(carona => {
                if (carona.Quantidade > 0) {
                    arrPromises.push($.ajax({
                        url: '/Carona/GetParticipantesByCarona',
                        data: { CaronaId: carona.Id },
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
                        } FillDoc(doc, data)
                    }
                })
                printDoc(doc);
            })

        }
    })

}