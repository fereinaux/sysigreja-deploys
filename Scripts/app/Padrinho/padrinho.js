
rootPadrinhos = ReactDOM.createRoot(document.getElementById("padrinhos"));
rootList = ReactDOM.createRoot(document.getElementById("list"));
loadList = typeof loadList !== 'undefined' ? loadList : function () { }
loadPanels = typeof loadPanels !== 'undefined' ? loadPanels : function () { }
function CarregarTabelaPadrinho() {

    $('#gerenciar').text("Gerenciar Padrinhos");
    $('#participantes-sem').text("Participantes sem Padrinho");
    var columnsTb = [
        { data: "Padrinho", name: "Padrinho", autoWidth: true },
        { data: "Quantidade", name: "Quantidade", autoWidth: true },
        {
            data: "Id", name: "Id", orderable: false, width: "15%",
            "render": function (data, type, row) {
                return `
                            ${GetButton('PrintPadrinho', JSON.stringify(row), 'green', 'fa-print', 'Imprimir')}  
                            ${GetButton('DeletePadrinho', data, 'red', 'fa-trash', 'Excluir')}`;
            }
        }
    ]


    const tablePadrinhoConfig = {
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


            const arrayData = this.api().rows({ search: 'applied', order: 'applied' })
                .data()
                .toArray()
            loadPanels(rootPadrinhos, arrayData.map((padrinho) => {
                return {
                    ...padrinho,
                    Cor: '#424242',
                    Title: padrinho.Padrinho,
                    Total: padrinho.Quantidade,
                    Participantes: _.orderBy(padrinho.Participantes, "Nome", "asc"),
                };
            }), PrintPadrinho)
            GetParticipantesSemPadrinho();
        },
        ajax: {
            url: '/Padrinho/GetPadrinhos',
            datatype: "json",
            data: { EventoId: function () { return SelectedEvent.Id }, },
            type: "POST"
        }
    };

    if (!$.fn.DataTable.isDataTable('#table-padrinho')) {
        $('#table-padrinho').DataTable(tablePadrinhoConfig)
    } else {

        $("#table-padrinho").DataTable().ajax.reload()
    }
}

$(document).off('ready-ajax').on('ready-ajax', () => {
    $("#Participante").on("keyup", function () {
        var value = $(this).val().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
        $("#table-participantes tr").filter(function () {
            $(this).toggle($(this).text().normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().indexOf(value) > -1)
        });
    });

    PadrinhoRefresh()
});


function PadrinhoRefresh() {

    CarregarTabelaPadrinho();
    GetParticipantesSemPadrinho();

}

function PrintPadrinho(row) {
    $.ajax({
        url: '/Padrinho/GetParticipantesByPadrinhos',
        data: { PadrinhoId: row.Id },
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
    doc.text(77, 15, $("#padrinho-eventoid option:selected").text());



    doc.text(77, 20, `Relação de Padrinho`);
    doc.text(77, 25, `${result.data[0].Padrinho}`);

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
    });

    AddCount(doc, result.data, height);
}

function GetPadrinho(id) {

    $("#padrinho-id").val(0);

}

function EditPadrinho(row) {
    GetEquipantes();
    GetPadrinho(row.Id);
    $("#modal-padrinho").modal();
}


function DeletePadrinho(id) {
    ConfirmMessageDelete().then((result) => {
        if (result) {
            $.ajax({
                url: "/Padrinho/DeletePadrinho/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: id
                    }),
                success: function () {
                    SuccessMesageDelete();
                    PadrinhoRefresh();
                    GetPadrinhosComParticipantes()
                }
            });
        }
    });
}

function PostPadrinho() {
    if (ValidateForm(`#form-padrinho`)) {
        CustomSwal({
            title: "Você tem certeza?",
            icon: "logo",
            text: `Um usuário com acesso "Padrinho" para ${$("#padrinho-equipante option:selected").text()} será criado`,
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
            if (result) {
                $.ajax({
                    url: "/Padrinho/PostPadrinho/",
                    datatype: "json",
                    type: "POST",
                    contentType: 'application/json; charset=utf-8',
                    data: JSON.stringify(
                        {
                            Id: $("#padrinho-id").val(),
                            EquipanteEventoId: $("#padrinho-equipante").val(),
                        }),
                    success: function (data) {
                        windowReference.location = GetLinkWhatsApp(data.User.Fone, MsgUsuario(data.User))
                        SuccessMesageOperation();
                        PadrinhoRefresh();
                        $("#modal-padrinho").modal("hide");
                    }
                });
            }
        })
    }
}

function DistribuirPadrinhos() {
    $.ajax({
        url: "/Padrinho/DistribuirPadrinhos/",
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            {
                EventoId: SelectedEvent.Id
            }),
        success: function () {
            SuccessMesageOperation();
            PadrinhoRefresh()
        }
    });
}


function GetEquipantes(id) {
    $("#padrinho-equipante").empty();

    $.ajax({
        url: "/Padrinho/GetEquipantes/",
        data: { EventoId: SelectedEvent.Id, },
        datatype: "json",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            data.Equipantes.forEach(function (equipante, index, array) {
                $('#padrinho-equipante').append($(`<option value="${equipante.Id}">${equipante.Nome}</option>`));
            });
            $("#padrinho-equipante").val($("#padrinho-equipante option:first").val()).trigger("chosen:updated");
            if ($("#padrinho-equipantes option").length === 0 && id == 0) {
                ErrorMessage("Não existem Equipantes disponíveis");
                $("#modal-padrinho").modal("hide");
            }
        }
    });
}


function GetParticipantesSemPadrinho() {
 

    $.ajax({
        url: "/Padrinho/GetParticipantesSemPadrinho/",
        data: { EventoId: SelectedEvent.Id },
        datatype: "json",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            semPadrinho = data.Participantes
            loadList(rootList, data.Participantes.map(item => ({
                ...item,
                Value: item.Nome
            })), `Participantes sem Padrinho`, "Buscar Participante")
        }
    });
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

                var Padrinhos = $("#table-padrinho").DataTable().data().toArray();

                var PadrinhoParticipante = Padrinhos.find(x => x.Participantes.some(y => y.ParticipanteId == $(this).data('id')))

                if (PadrinhoParticipante) {

                    var Participante = PadrinhoParticipante.Participantes.find(x => x.ParticipanteId == $(this).data('id'))

                    instance.setContent(`<div class="popup-handler" style="display:flex"><div style="width:350px"><h4 class="hide-multiple">Nome: ${Participante.Nome}</h4><div>
                    <ul class="change-circulo-ul">
                       ${Padrinhos.filter(x => x.Id != PadrinhoParticipante.Id).map(c => `<li onclick="ChangePadrinho(${Participante.ParticipanteId + "@@@@@@" + c.Id})" class="change-circulo-li" style="background:#424242"><span>${c.Padrinho}</span><span>Participantes: ${c.Quantidade}</span></li>`).join().replace(/,/g, '').replace(/@@@@@@/g, ',')}
                    ${`<li onclick = "ChangePadrinho(${Participante.ParticipanteId + "@@@@@@" + null})" class="change-circulo-li" style = "background:#bb2d2d"><span>Remover</span></li>`.replace(/,/g, '').replace(/@@@@@@/g, ',')}
                       </ul>
                    </div></div></div>`)

                } else {
                    var Participante = semPadrinho.find(x => x.Id == $(this).data('id'))

                    instance.setContent(`<div class="popup-handler" style="display:flex"><div style="width:350px"><h4 class="hide-multiple">Nome: ${Participante.Nome}</h4><div>
                    <ul class="change-circulo-ul">
                       ${Padrinhos.map(c => `<li onclick="ChangePadrinho(${Participante.Id + "@@@@@@" + c.Id})" class="change-circulo-li" style="background:#424242"><span>${c.Padrinho}</span><span>Participantes: ${c.Quantidade}</span></li>`).join().replace(/,/g, '').replace(/@@@@@@/g, ',')}
                    </ul>
                    </div></div></div>`)
                }
            },
        });
    });
  
}

var semPadrinho
function ChangePadrinho(participanteId, destinoId) {
    $.ajax({
        url: "/Padrinho/ChangePadrinho/",
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            {
                ParticipanteId: participanteId,
                DestinoId: destinoId || null
            }),
        success: function () {
            tippy.hideAll()
            CarregarTabelaPadrinho();
        }
    });
}


function PrintAll() {
    var doc = CriarPDFA4()
    $.ajax({
        url: '/Padrinho/GetPadrinhos',
        datatype: "json",
        data: { EventoId: SelectedEvent.Id },
        type: "POST",
        success: function (data) {
            var arrPromises = []
            data.data.forEach(padrinho => {
                if (padrinho.Quantidade > 0) {
                    arrPromises.push($.ajax({
                        url: '/Padrinho/GetParticipantesByPadrinhos',
                        data: { PadrinhoId: padrinho.Id },
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