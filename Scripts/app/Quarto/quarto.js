rootQuartos = ReactDOM.createRoot(document.getElementById("quartos"));
rootList = ReactDOM.createRoot(document.getElementById("list"));
loadList = typeof loadList !== 'undefined' ? loadList : function () { }
table = undefined
loadPanels = typeof loadQuartos !== 'undefined' ? loadPanels : function () { }
swalQuartos = {
    title: "Impressão de Quartos",
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
columnsParticipantes = [
    { data: "Titulo", name: "Titulo", autoWidth: true },
    { data: "Equipante", name: "Equipante", autoWidth: true },
    { data: "Sexo", name: "Sexo", autoWidth: true },
    { data: "Capacidade", name: "Capacidade", autoWidth: true },
    {
        data: "Id", name: "Id", className: "text-center", orderable: false, width: "15%",
        "render": function (data, type, row) {
            return `
                            ${GetButton('PrintQuarto', JSON.stringify(row), 'green', 'fa-print', 'Imprimir')}  
                            ${GetButton('EditQuarto', data, 'blue', 'fa-edit', 'Editar')}                            
                            ${GetButton('DeleteQuarto', data, 'red', 'fa-trash', 'Excluir')}
                             ${GetButton('EsvaziarQuarto', data, 'red', 'fas fa-ban', 'Esvaziar')}`;
        }
    }
]

columnsEquipantes = [
    { data: "Titulo", name: "Titulo", autoWidth: true },
    { data: "Sexo", name: "Sexo", autoWidth: true },
    { data: "Capacidade", name: "Capacidade", autoWidth: true },
    {
        data: "Id", name: "Id", className: "text-center", orderable: false, width: "15%",
        "render": function (data, type, row) {
            return `
                            ${GetButton('PrintQuarto', JSON.stringify(row), 'green', 'fa-print', 'Imprimir')}  
                            ${GetButton('EditQuarto', data, 'blue', 'fa-edit', 'Editar')}                            
                            ${GetButton('DeleteQuarto', data, 'red', 'fa-trash', 'Excluir')}
                            ${GetButton('EsvaziarQuarto', data, 'red', 'fas fa-ban', 'Esvaziar')}`;
        }
    }
]

function CarregarTabelaQuarto() {
    const tableQuartoConfig = {
        language: languageConfig,
        lengthMenu: [200, 500, 1000],
        colReorder: false,
        serverSide: false,
        searchDelay: 750,
        deferloading: 0,
        orderCellsTop: true,
        fixedHeader: true,
        filter: true,
        orderMulti: false,
        responsive: true, stateSave: true, stateSaveCallback: stateSaveCallback, stateLoadCallback: stateLoadCallback,
        destroy: true,
        dom: domConfigNoButtons,
        columns: window.location.href.includes('Quarto/Voluntarios') ? columnsEquipantes : columnsParticipantes,
        order: [
            [0, "asc"]
        ],
        drawCallback: function (settings) {
            if (SelectedEvent.TipoQuarto == "Endereco") {
                $('.quarto-endereco').css('display', 'block')
            } else {
                $('.quarto-endereco').css('display', 'none')
            }

            const arrayData = this.api().rows({ search: 'applied', order: 'applied' })
                .data()
                .toArray()

            loadPanels(rootQuartos, arrayData.map((quarto) => {
                return {
                    ...quarto,
                    Title: quarto.Titulo,
                    SubTitle: quarto.Equipante,
                    Total: quarto.Capacidade,
                    Cor: {
                        Masculino: "#0095ff",
                        Feminino: "#ff00d4",
                        Misto: "#424242",
                    }[quarto.Sexo],
                    Participantes: quarto.Participantes.length > 0 ? _.orderBy(quarto.Participantes, "Nome", "asc") : _.orderBy(quarto.Equipantes, "Nome", "asc"),
                };
            }), PrintQuarto)

            GetParticipantesSemQuarto();

            arrayData.forEach(quarto => {


                if (quarto.Latitude && quarto.Longitude) {
                    addMapa(quarto.Latitude, quarto.Longitude, quarto.Titulo, "#000000", quarto.QuartoId, 'quarto')
                        .bindPopup(`<h4>${quarto.Titulo}</h4><div style="display:flex;flex-direction:column"><span>Capacidade: ${quarto.Capacidade}</span><span>${quarto.Logradouro} - ${quarto.Bairro}</span></div>`);
                }
            })

        },
        ajax: {
            url: '/Quarto/GetQuartos',
            datatype: "json",
            data: { EventoId: function () { return SelectedEvent.Id }, Tipo: window.location.href.includes('Quarto/Voluntarios') ? 0 : 1 },
            type: "POST"
        }
    };

    if (!$.fn.DataTable.isDataTable('#table-quarto')) {
        $('#table-quarto').DataTable(tableQuartoConfig)
    } else {

        $("#table-quarto").DataTable().ajax.reload()
    }
}


$(document).off('ready-ajax').on('ready-ajax', () => {
    $('#col-chave').text(window.location.href.includes('Quarto/Voluntarios') ? 'Equipantes' : 'Participantes')

    $("#Participante").on("keyup", function () {
        var value = $(this).val().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
        $("#table-participantes tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').indexOf(value) > -1);
        });
    });

    CarregarTabelaQuarto();
});

function PrintQuarto(row) {

    const ajaxPrint = (type) => $.ajax({
        url: window.location.href.includes('Quarto/Voluntarios') ? '/Quarto/GetEquipantesByQuarto' : '/Participante/GetParticipantesByQuarto',
        data: { QuartoId: row.Id },
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

    if (!window.location.href.includes('Quarto/Voluntarios')) {
        CustomSwal(swalQuartos).then(res => { if (res) ajaxPrint(res) })
    } else {
        ajaxPrint("resume")
    }



}



function headerLandscape(doc, evento, page, quarto) {
    if (SelectedEvent.LogoRelatorioId) {
        var img = new Image();
        img.src = `/Arquivo/GetArquivo/${SelectedEvent.LogoRelatorioId}`;
        doc.addImage(img, 'PNG', 10, 10, 50, 21);
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(64, 14, evento);
    doc.text(64, 22, quarto);
    doc.text(64, 30, `Data de Impressão: ${moment().format('DD/MM/YYYY HH:mm')} - Página ${page}`);

    var widthP = 285
    doc.line(10, 38, widthP, 38);

    doc.setFont('helvetica', "bold")
    doc.text(12, 43, "Nome");
    doc.text(115, 43, SelectedEvent.EquipeCirculo ?? "");
    doc.text(165, 43, "Medicamento/Alergia");

    doc.line(10, 45, widthP, 45);
    doc.setFont('helvetica', "normal")
}

function header(doc, evento, page, quarto) {
    if (SelectedEvent.LogoRelatorioId) {
        var img = new Image();
        img.src = `/Arquivo/GetArquivo/${SelectedEvent.LogoRelatorioId}`;
        doc.addImage(img, 'PNG', 10, 10, 50, 21);
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(64, 14, evento);
    doc.text(64, 22, quarto);
    doc.text(64, 30, `Data de Impressão: ${moment().format('DD/MM/YYYY HH:mm')} - Página ${page}`);

    var widthP = 195
    doc.line(10, 38, widthP, 38);

    doc.setFont('helvetica', "bold")
    doc.text(12, 43, "Nome");
    doc.text(115, 43, window.location.href.includes('Quarto/Voluntarios') ? "Apelido" : SelectedEvent.EquipeCirculo ?? "");

    doc.line(10, 45, widthP, 45);
    doc.setFont('helvetica', "normal")
}

function FillDocLandscape(doc, result) {
    var evento = $("#quarto-eventoid option:selected").text();
    headerLandscape(doc, evento, 1, `Quarto - ${result.data[0].Titulo} ${result.data[0].Equipante ? `| ${result.data[0].Equipante}` : ""}`)
    height = 50;

    $(result.data).each((index, participante) => {
        if (index == 36) {
            doc.addPage()
            headerLandscape(doc, evento, 2, `Quarto - ${result.data[0].Titulo} ${result.data[0].Equipante ? `| ${result.data[0].Equipante}` : ""}`)
            height = 50;
        }

        doc.text(12, height, participante.Nome);
        var splitMedicacao = doc.splitTextToSize(participante.Medicacao, 80);
   
        doc.text(115, height, participante.Circulo ?? "");
        
        doc.text(165, height, splitMedicacao);
        height += 6 * splitMedicacao.length;
    });

    AddCount(doc, result.data, height, 285);
}

function FillDoc(doc, result) {
    var evento = $("#quarto-eventoid option:selected").text();
    header(doc, evento, 1, `Quarto - ${result.data[0].Titulo} ${result.data[0].Equipante ? `| ${result.data[0].Equipante}` : ""}`)
    height = 50;

    $(result.data).each((index, participante) => {
        if (index == 36) {
            doc.addPage()
            header(doc, evento, 2, `Quarto - ${result.data[0].Titulo} ${result.data[0].Equipante ? `| ${result.data[0].Equipante}` : ""}`)
            height = 50;
        }

        doc.text(12, height, participante.Nome);
        var splitMedicacao = doc.splitTextToSize(window.location.href.includes('Quarto/Voluntarios') ? participante.Apelido : participante.Circulo?? "", 80);
        doc.text(115, height, splitMedicacao);
        height += 6 * splitMedicacao.length;
    });

    AddCount(doc, result.data, height);
}

function GetQuarto(id) {
    if (id > 0) {
        $.ajax({
            url: "/Quarto/GetQuarto/",
            data: { Id: id },
            datatype: "json",
            type: "GET",
            contentType: 'application/json; charset=utf-8',
            success: function (data) {

                $("#quarto-id").val(data.Quarto.Id);
                $("#quarto-titulo").val(data.Quarto.Titulo);
                $("#quarto-capacidade").val(data.Quarto.Capacidade);
                $(`input[type=radio][name=quarto-sexo][value=${data.Quarto.Sexo}]`).iCheck('check');

                $('#quarto-equipante').append($(`<option value="${data.Quarto.EquipanteId}">${data.Quarto.Equipante}</option>`));
                $("#quarto-equipante").val(data.Quarto.EquipanteId || "Pesquisar").trigger("chosen:updated");

                $(`#quarto-cep`).val(data.Quarto.CEP);
                $(`#quarto-logradouro`).val(data.Quarto.Logradouro);
                $(`#quarto-bairro`).val(data.Quarto.Bairro);
                $(`#quarto-cidade`).val(data.Quarto.Cidade);
                $(`#quarto-estado`).val(data.Quarto.Estado);
                $(`#quarto-numero`).val(data.Quarto.Numero);
                $(`#quarto-complemento`).val(data.Quarto.Complemento);
                $(`#quarto-referencia`).val(data.Quarto.Referencia);
                $(`#quarto-latitude`).val((data.Quarto.Latitude || '').replaceAll(',', '.'));
                $(`#quarto-longitude`).val((data.Quarto.Longitude || '').replaceAll(',', '.'));


            }
        });
    }
    else {
        $("#quarto-id").val(0);
        $("#quarto-titulo").val("");
        $("#quarto-capacidade").val("");
        $(`input[type=radio][name=quarto-sexo][value=1]`).iCheck('check');


        $(`#quarto-cep`).val();
        $(`#quarto-logradouro`).val();
        $(`#quarto-bairro`).val();
        $(`#quarto-cidade`).val();
        $(`#quarto-estado`).val();
        $(`#quarto-numero`).val();
        $(`#quarto-complemento`).val();
        $(`#quarto-referencia`).val();
        $(`#quarto-latitude`).val();
        $(`#quarto-longitude`).val();
    }

    if ($('#map').length > 0) {

        mapLocal = initMap('map')
        markerLayerLocal = createMarkerLayer(mapLocal)
        setInterval(function () {
            mapLocal.invalidateSize();
        }, 100);

    }
}

function EditQuarto(id) {
    GetEquipantes(id);
    $("#modal-quarto").modal();
}


function DeleteQuarto(id) {
    ConfirmMessageDelete().then((result) => {
        if (result) {
            $.ajax({
                url: "/Quarto/DeleteQuarto/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: id
                    }),
                success: function () {
                    SuccessMesageDelete();
                    CarregarTabelaQuarto();
                }
            });
        }
    });
}

function PostQuarto() {
    if (ValidateForm(`#form-quarto`)) {
        $.ajax({
            url: "/Quarto/PostQuarto/",
            datatype: "json",
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(
                {
                    Id: $("#quarto-id").val(),
                    EventoId: SelectedEvent.Id,
                    Titulo: $("#quarto-titulo").val(),
                    Sexo: $("input[type=radio][name=quarto-sexo]:checked").val(),
                    EquipanteId: $("#quarto-equipante").val() != "Pesquisar" ? $("#quarto-equipante").val() : null,
                    Capacidade: $("#quarto-capacidade").val(),

                }),
            success: function () {
                SuccessMesageOperation();
                CarregarTabelaQuarto();
                $("#modal-quarto").modal("hide");
            }
        });
    }
}

function PostQuartoEquipe() {
    if (ValidateForm(`#form-quarto`)) {
        $.ajax({
            url: "/Quarto/PostQuarto/",
            datatype: "json",
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(
                {
                    Id: $("#quarto-id").val(),
                    EventoId: SelectedEvent.Id,
                    Titulo: $("#quarto-titulo").val(),
                    Sexo: $("input[type=radio][name=quarto-sexo]:checked").val(),
                    Capacidade: $("#quarto-capacidade").val(),
                    TipoPessoa: 0,
                    CEP: $(`#quarto-cep`).val(),
                    Logradouro: $(`#quarto-logradouro`).val(),
                    Bairro: $(`#quarto-bairro`).val(),
                    Cidade: $(`#quarto-cidade`).val(),
                    Estado: $(`#quarto-estado`).val(),
                    Numero: $(`#quarto-numero`).val(),
                    Complemento: $(`#quarto-complemento`).val(),
                    Referencia: $(`#quarto-referencia`).val(),
                    Latitude: $(`#quarto-latitude`).val(),
                    Longitude: $(`#quarto-longitude`).val(),
                }),
            success: function () {
                SuccessMesageOperation();
                CarregarTabelaQuarto();
                $("#modal-quarto").modal("hide");
            }
        });
    }
}


function DistribuirQuartos() {
    $.ajax({
        url: "/Quarto/DistribuirQuartos/",
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            {
                EventoId: SelectedEvent.Id,
                Tipo: window.location.href.includes('Quarto/Voluntarios') ? 0 : 1
            }),
        success: function () {
            SuccessMesageOperation();
            CarregarTabelaQuarto();
            $("#modal-quarto").modal("hide");
        }
    });
}

var semQuarto

function GetParticipantesSemQuarto() {


    $.ajax({
        url: "/Quarto/GetParticipantesSemQuarto/",
        data: { EventoId: SelectedEvent.Id, Tipo: window.location.href.includes('Quarto/Voluntarios') ? 0 : 1 },
        datatype: "json",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            semQuarto = data.Participantes
            loadList(rootList, data.Participantes.map(item => ({
                ...item,
                Value: item.Nome
            })), `Participantes sem Quarto`, "Buscar Participante")
        }
    });
}


function DragDropg() {
    $('.draggable').each(function () {
        if (!this._tippy) {
            tippyProfile(this, $(this).data('id'), "Quartos", function () {
                tippy.hideAll()
                CarregarTabelaQuarto();
                rootProfile = []
            },window.location.href.includes('Quarto/Voluntarios') ? "Equipante" : "Participante")
        }
    });
}

function AddMembroQuarto(capacidade, qtd) {
    arrayCapacidade = capacidade.split('');
    arrayCapacidade[0] = (Number(arrayCapacidade[0]) + Number(qtd)).toString();

    return arrayCapacidade.join('');
}

function ChangeQuarto(participanteId, destinoId) {
    $.ajax({
        url: "/Quarto/ChangeQuarto/",
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            {
                ParticipanteId: participanteId,
                DestinoId: destinoId,
                EventoId: SelectedEvent.Id,
                tipo: window.location.href.includes('Quarto/Voluntarios') ? 0 : 1
            }),
        success: function () {
            tippy.hideAll()
            CarregarTabelaQuarto();
        }
    });
}


function PrintAll() {
    const ajaxPrint = (type) => {
        let doc = type == "resume" ? CriarPDFA4() : CriarPDFA4Landscape();
        $.ajax({
            url: '/Quarto/GetQuartos',
            datatype: "json",
            data: { EventoId: SelectedEvent.Id, Tipo: window.location.href.includes('Quarto/Voluntarios') ? 0 : 1 },
            type: "POST",
            success: function (data) {
                var arrPromises = []
                data.data.forEach(element => {
                    if (element.Quantidade > 0) {
                        arrPromises.push($.ajax({
                            url: window.location.href.includes('Quarto/Voluntarios') ? '/Quarto/GetEquipantesByQuarto' : '/Participante/GetParticipantesByQuarto',
                            data: { QuartoId: element.Id },
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
    if (!window.location.href.includes('Quarto/Voluntarios')) {
        CustomSwal(swalQuartos).then(res => ajaxPrint(res || "resume"))
    } else {
        ajaxPrint("resume")
    }
}


document.addEventListener('animationstart', function (event) {
    console.log(event);
    if (event.animationName == 'swalOverlay') {
        tippy('.btn-resume', {
            content: `<ul style="padding-left: 10px;margin:5px;text-align:left">
  <li>
    Nome
  </li>
 
    ${SelectedEvent.EquipeCirculo ? ` <li>${SelectedEvent.EquipeCirculo}</li>` : ""}
   
</ul>`,
            interactive: true,
            allowHTML: true,
            zIndex: 10005,
            trigger: 'mouseenter'
        });

        tippy('.btn-full', {
            content: `<ul style="padding-left: 10px;margin:5px;text-align:left">
  <li>
    Nome
  </li>
  <li>
      ${SelectedEvent.EquipeCirculo}
  </li>
  <li>
    Medicamentos
  </li>
  <li>
    Alergias
  </li>
</ul>`,
            interactive: true,
            allowHTML: true,
            zIndex: 10005,
            trigger: 'mouseenter'
        });
    }
})



function GetEquipantes(id) {
    $("#quarto-equipante").empty();
    $('#quarto-equipante').append($('<option>Pesquisar</option>'));

    $.ajax({
        url: "/Quarto/GetEquipantes/",
        data: { EventoId: SelectedEvent.Id, },
        datatype: "json",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            data.Equipantes.forEach(function (equipante, index, array) {
                $('#quarto-equipante').append($(`<option value="${equipante.EquipanteId}">${equipante.Nome}</option>`));
            });
            $("#quarto-equipante").val($("#quarto-equipante option:first").val()).trigger("chosen:updated");

            GetQuarto(id);
        }
    });
}

function addMapa(lat, long, nome, cor, id, type) {
    return L.marker([lat, long], { icon: getIcon(cor.trim()) }).addTo(markerLayer);


}

markerLayerLocal = undefined
mapLocal = undefined

if ($('#map-geral').length > 0) {

    map = initMap('map-geral')
    markerLayer = createMarkerLayer(map)
    map.setView([-8.050000, -34.900002], 13);
    setInterval(function () {
        map.invalidateSize();
    }, 100);
}

function verificaCep(input) {
    let cep = $(input).val()
    if (cep.length == 9) {
        $.ajax({
            url: `https://api.sysigreja.com/api/cep/${cep.replaceAll('-', '')}`,
            datatype: "json",
            type: "GET",
            contentType: 'application/json; charset=utf-8',
            timeout: 3000,
            error: function () {
                $(`#quarto-logradouro`).prop("disabled", false);
                $(`#quarto-bairro`).prop("disabled", false);
                $(`#quarto-cidade`).prop("disabled", false);
                $(`#quarto-estado`).prop("disabled", false);
                $.unblockUI();
            },
            success: function (data) {
                $(`#quarto-logradouro`).val(data.logradouro)
                $(`#quarto-bairro`).val(data.bairro)
                $(`#quarto-cidade`).val(data.localidade)
                $(`#quarto-estado`).val(data.uf)
                $(`#quarto-latitude`).val(data.lat)
                $(`#quarto-longitude`).val(data.lon)
                montarMapa()
            }
        })
    }
}

function montarMapa() {
    markerLayerLocal.getLayers().forEach(mark => mark.remove())
    var marker = L.marker([$(`#quarto-latitude`).val().toString(), $(`#quarto-longitude`).val().toString()], { icon: getIcon('vermelho') }).addTo(markerLayerLocal);
    marker.bindPopup(`<h4>${$(`#quarto-titulo`).val()}</h4>`).openPopup();
    $('.div-map').css('display', 'block')
    mapLocal.setView([$(`#quarto-latitude`).val(), $(`#quarto-longitude`).val()], 18);
}


function EsvaziarQuarto(id) {
    ConfirmMessage(`Essa ação ira esvaziar o quarto, você confirma a operação?`).then((result) => {
        if (result) {
            $.ajax({
                url: "/Quarto/EsvaziarQuarto/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: id
                    }),
                success: function () {
                    SuccessMesageOperation();
                    CarregarTabelaQuarto();
                }
            });
        }
    });
}



function EsvaziarTodosQuarto() {
    ConfirmMessage(`Essa ação ira esvaziar TODOS os quartos, você confirma a operação?`).then((result) => {
        if (result) {
            $.ajax({
                url: "/Quarto/EsvaziarTodosQuarto/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: SelectedEvent.Id,
                        Tipo: window.location.href.includes('Quarto/Voluntarios') ? 0 : 1
                    }),
                success: function () {
                    SuccessMesageOperation();
                    CarregarTabelaQuarto();
                }
            });
        }
    });
}