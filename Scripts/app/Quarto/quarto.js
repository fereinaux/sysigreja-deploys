let table
let columnsParticipantes = [
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
                            ${GetButton('DeleteQuarto', data, 'red', 'fa-trash', 'Excluir')}`;
        }
    }
]

let columnsEquipantes = [
    { data: "Titulo", name: "Titulo", autoWidth: true },
    { data: "Sexo", name: "Sexo", autoWidth: true },
    { data: "Capacidade", name: "Capacidade", autoWidth: true },
    {
        data: "Id", name: "Id", className: "text-center", orderable: false, width: "15%",
        "render": function (data, type, row) {
            return `
                            ${GetButton('PrintQuarto', JSON.stringify(row), 'green', 'fa-print', 'Imprimir')}  
                            ${GetButton('EditQuarto', data, 'blue', 'fa-edit', 'Editar')}                            
                            ${GetButton('DeleteQuarto', data, 'red', 'fa-trash', 'Excluir')}`;
        }
    }
]

function CarregarTabelaQuarto() {
    const tableQuartoConfig = {
        language: languageConfig,
        lengthMenu: [200, 500, 1000],
        colReorder: false,
        serverSide: false,
        deferloading: 0,
        orderCellsTop: true,
        fixedHeader: true,
        filter: true,
        orderMulti: false,
        responsive: true, stateSave: true,
        destroy: true,
        dom: domConfigNoButtons,
        columns: window.location.href.includes('QuartoEquipe') ? columnsEquipantes : columnsParticipantes,
        order: [
            [0, "asc"]
        ],
        drawCallback: function (settings) {
            if (settings.aoData.length > 0) {

                let column = settings.aoColumns[settings.aaSorting[0][0]].data
                let dir = settings.aaSorting[0][1]
                let search = settings.oPreviousSearch.sSearch

                GetQuartosComParticipantes(column, dir, search);
            }

        },
        ajax: {
            url: '/Quarto/GetQuartos',
            datatype: "json",
            data: { EventoId: $("#quarto-eventoid").val(), Tipo: window.location.href.includes('QuartoEquipe') ? 0 : 1 },
            type: "POST"
        }
    };
    table = $("#table-quarto").DataTable(tableQuartoConfig);
}


$(document).ready(function () {
    $('#col-chave').text(window.location.href.includes('QuartoEquipe') ? 'Equipantes' : 'Participantes')

    $("#Participante").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $("#table-participantes tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });

    CarregarTabelaQuarto();
});

function PrintQuarto(row) {

    const ajaxPrint = (type) => $.ajax({
        url: window.location.href.includes('QuartoEquipe') ? '/Quarto/GetEquipantesByQuarto' : '/Participante/GetParticipantesByQuarto',
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

    if (!window.location.href.includes('QuartoEquipe')) {
        CustomSwal(swalQuartos).then(res => { if (res) ajaxPrint(res) })
    } else {
        ajaxPrint("resume")
    }



}

const swalQuartos = {
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
        }
    }


}

function headerLandscape(doc, evento, page, quarto) {
    if (logoRelatorio) {
        var img = new Image();
        img.src = `data:image/png;base64,${logoRelatorio}`;
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
    doc.text(115, 43, "Círculo");
    doc.text(165, 43, "Medicamento/Alergia");

    doc.line(10, 45, widthP, 45);
    doc.setFont('helvetica', "normal")
}

function header(doc, evento, page, quarto) {
    if (logoRelatorio) {
        var img = new Image();
        img.src = `data:image/png;base64,${logoRelatorio}`;
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
    doc.text(115, 43, window.location.href.includes('QuartoEquipe') ? "Apelido" : "Círculo");

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
        doc.text(115, height, participante.Circulo);
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
        var splitMedicacao = doc.splitTextToSize(window.location.href.includes('QuartoEquipe') ? participante.Apelido : participante.Circulo, 80);
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
            }
        });
    }
    else {
        $("#quarto-id").val(0);
        $("#quarto-titulo").val("");
        $("#quarto-capacidade").val("");
        $(`input[type=radio][name=quarto-sexo][value=1]`).iCheck('check');
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
                    EventoId: $("#quarto-eventoid").val(),
                    Titulo: $("#quarto-titulo").val(),
                    Sexo: $("input[type=radio][name=quarto-sexo]:checked").val(),
                    EquipanteId: $("#quarto-equipante").val() != "Pesquisar" ? $("#quarto-equipante").val() : null,
                    Capacidade: $("#quarto-capacidade").val()
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
                    EventoId: $("#quarto-eventoid").val(),
                    Titulo: $("#quarto-titulo").val(),
                    Sexo: $("input[type=radio][name=quarto-sexo]:checked").val(),
                    Capacidade: $("#quarto-capacidade").val(),
                    TipoPessoa: 0
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
                EventoId: $("#quarto-eventoid").val()
            }),
        success: function () {
            SuccessMesageOperation();
            CarregarTabelaQuarto();
            $("#modal-quarto").modal("hide");
        }
    });
}

function GetParticipantesSemQuarto() {
    $("#table-participantes").empty();

    $.ajax({
        url: "/Quarto/GetParticipantesSemQuarto/",
        data: { EventoId: $("#quarto-eventoid").val(), Tipo: window.location.href.includes('QuartoEquipe') ? 0 : 1 },
        datatype: "json",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            data.Participantes.forEach(function (participante, index, array) {
                $('#table-participantes').append($(`<tr><td class="participante" data-id="${participante.Id}">${participante.Nome}</td></tr>`));
            });

            DragDropg();
        }
    });
}


function GetQuartosComParticipantes(column, dir, search) {
    $("#quartos").empty();

    $.ajax({
        url: '/Quarto/GetQuartos',
        datatype: "json",
        data: {
            EventoId: $("#quarto-eventoid").val(), Tipo: window.location.href.includes('QuartoEquipe') ? 0 : 1,
            columnName: column, columnDir: dir, search
        },
        type: "POST",
        success: function (data) {
            data.data.forEach(function (quarto, index, array) {
                $("#quartos").append($(`<div data-id="${quarto.Id}" style="margin-bottom:25px;background-color:${quarto.Sexo == "Masculino" ? "#0095ff" : "#ff00d4"}; background-clip: content-box;border-radius: 28px;" class= "p-xs col-xs-12 col-lg-4 quarto text-center text-white" >
            <div class="p-h-xs"><h4 id="capacidade-${quarto.Id}">${quarto.Capacidade}</h4>
                <h4>${quarto.Titulo}</h4>
                ${quarto.Equipante ? `<h5>${quarto.Equipante}</h5></div>` : ""}
                <table class="table">
                    <tbody id="quarto-${quarto.Id}">

                    </tbody>
                </table>
                <button type="button" class="btn btn-rounded btn-default print-button" onclick='PrintQuarto(${JSON.stringify(quarto)})' ></button>
            </div>`));
            });

            $('.print-button').append('<i class="fa fa-2x fa-print">')

            $.ajax({
                url: "/Quarto/GetQuartosComParticipantes/",
                data: { EventoId: $("#quarto-eventoid").val(), Tipo: window.location.href.includes('QuartoEquipe') ? 0 : 1 },
                datatype: "json",
                type: "GET",
                contentType: 'application/json; charset=utf-8',
                success: function (data) {
                    data.Quartos.forEach(function (quarto, index, array) {
                        $(`#quarto-${quarto.QuartoId}`).append($(`<tr><td class="participante" data-id="${quarto.ParticipanteId}">${quarto.Nome}</td></tr>`));
                    });
                    GetParticipantesSemQuarto();
                    DragDropg();
                }
            });
        }
    });
}

function DragDropg() {
    Drag();

    $('.quarto').droppable({
        drop: function (event, ui) {
            var origem = $($($(ui.draggable).parent().parent().parent().parent().children()[0]).children()[0]);
            $(ui.draggable).parent().remove();
            ChangeQuarto($(ui.draggable).data('id'), $(this).data('id'));
            origem.text(AddMembroQuarto(origem.text(), -1));
            if ($(this).data('id')) {
                $(`#capacidade-${$(this).data('id')}`).text(AddMembroQuarto($(`#capacidade - ${$(this).data('id')}`).text(), 1));
                $(`#quarto-${$(this).data('id')}`).append($(`<tr><td class="participante" data-id="${$(ui.draggable).data('id')}">${$(ui.draggable).text()}</td></tr>`));
            } else {
                $('#table-participantes').append($(`<tr><td class="participante" data-id="${$(ui.draggable).data('id')}">${$(ui.draggable).text()}</td></tr>`));
            }
            Drag();
        }
    });
}

function AddMembroQuarto(capacidade, qtd) {
    arrayCapacidade = capacidade.split('');
    arrayCapacidade[0] = (Number(arrayCapacidade[0]) + Number(qtd)).toString();

    return arrayCapacidade.join('');
}

function Drag() {
    $('.participante').each(function () {
        $(this).css("cursor", "move");
        $(this).draggable({
            zIndex: 999,
            revert: true,
            revertDuration: 0
        });
    });
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
                tipo: window.location.href.includes('QuartoEquipe') ? 0 : 1
            }),
        success: function () {
            CarregarTabelaQuarto();
        },
        error: function (error) {
            ErrorMessage(error.statusText);

        }
    });
}


function PrintAll() {
    const ajaxPrint = (type) => {
        let doc = type == "resume" ? CriarPDFA4() : CriarPDFA4Landscape();
        $.ajax({
            url: '/Quarto/GetQuartos',
            datatype: "json",
            data: { EventoId: $("#quarto-eventoid").val(), Tipo: window.location.href.includes('QuartoEquipe') ? 0 : 1 },
            type: "POST",
            success: function (data) {
                var arrPromises = []
                data.data.forEach(element => {
                    if (element.Quantidade > 0) {
                        arrPromises.push($.ajax({
                            url: window.location.href.includes('QuartoEquipe') ? '/Quarto/GetEquipantesByQuarto' : '/Participante/GetParticipantesByQuarto',
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
    if (!window.location.href.includes('QuartoEquipe')) {
        CustomSwal(swalQuartos).then(res => ajaxPrint(res || "resume"))
    } else {
        ajaxPrint("resume")
    }
}



$('body').on('DOMNodeInserted', '.swal-overlay', function () {
    tippy('.btn-resume', {
        content: `<ul style="padding-left: 10px;margin:5px;text-align:left">
  <li>
    Nome
  </li>
  <li>
    Círculo
  </li> 
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
    Círculo
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
});



function GetEquipantes(id) {
    $("#quarto-equipante").empty();
    $('#quarto-equipante').append($('<option>Pesquisar</option>'));

    $.ajax({
        url: "/Quarto/GetEquipantes/",
        data: { EventoId: $("#quarto-eventoid").val(), },
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
