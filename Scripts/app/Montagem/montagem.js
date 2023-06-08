
    isConvite = $('#eventoid option:selected').data('role') == "Convites"
    HideMenu();
    $(document).ready(function () {
        $('.not-convite').css('display', isConvite ? 'none' : 'block')
            loadPage()
    loadCampos(999)
        })


    function loadPage() {

        $.ajax({
            url: '/Etiqueta/GetEtiquetasByEventoId',
            data: { eventoId: $("#eventoid").val() },
            datatype: "json",
            type: "POST",
            success: (result) => {
                $("#equipante-marcadores").html(`
${result.data.map(p => `<option value=${p.Id}>${p.Nome}</option>`)}
`)
                $("#equipante-nao-marcadores").html(`
${result.data.map(p => `<option value=${p.Id}>${p.Nome}</option>`)}
`)
                $('#equipante-marcadores').select2({ placeholder: "Pesquisar", });
                $('#equipante-nao-marcadores').select2({ placeholder: "Pesquisar", });
                $('#equipante-status').select2({ placeholder: "Pesquisar", });
            }
        });
    $('#equipante-status-montagem').select2({multiple: true, maximumSelectionLength: 1, placeholder: "Pesquisar" });
    $('#eventoid').select2()
    $('#listagem').select2({
        ajax: {
        delay: 750,
    url: '/Equipante/GetEquipanteTipoEvento',
    data: function (params) {
                        var query = {
        Search: params.term,
    EventoId: $("#eventoid").val()
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

    templateSelection: function (data) {
        tipo = data.Tipo
                    console.log(data);
    $('#getHistButton').css('display', tipo == "Equipante" ? 'block' : 'none')
    return data.text;
                }
            });
    $.ajax({
        url: '/Equipe/GetEquipes',
    datatype: "json",
    data: {EventoId: $("#eventoid").val() },
    type: "POST",
                success: (result) => {
        $("#equipe-select").html(`
${result.data.map(p => `<option value=${p.Id}>${p.Equipe}</option>`)}
`)
                    $('#equipe-select').select2({placeholder: "Pesquisar" });
    $("#equipe-select-filtro").html(`
    ${result.data.map(p => `<option value=${p.Id}>${p.Equipe}</option>`)}
    `)
    $('#equipe-select-filtro').select2({placeholder: "Pesquisar" });
                }
            });
    CarregarTabelaEquipante()

        }

    function CarregarTabelaEquipante(callbackFunction) {
        newEventoId = $("#eventoid").val()
            $('#btn_bulk').css('display', 'none')

    const tableEquipanteConfig = {
        language: languageConfig,
    searchDelay: 1000,
    lengthMenu: [10, 30, 50, 100, 200, 500],
    colReorder: true,
    serverSide: true,
    scrollX: true,
    scrollXollapse: true,
    orderCellsTop: true,
    fixedHeader: true,
    filter: true,
    orderMulti: false,
    responsive: true,
    stateSave: true, stateSaveCallback: stateSaveCallback, stateLoadCallback: stateLoadCallback,
    destroy: true,
    colReorder: {
        fixedColumnsLeft: 1
                },
    dom: '<"html5buttons"B>lTgitp',
    buttons: getButtonsConfig(`Montagem`),
    columns: [
    {
        data: "Id", name: "Id", orderable: false, width: "2%", className: 'noVis noSearch noExport',
    "render": function (data, type, row) {
                            return `${GetCheckBox(data, row.Presenca)}`;
                        }
                    },
    {data: "Sexo", name: "Sexo", visible: false, className: 'noVis noSearch noExport', },
    {
        data: "Sexo", title: "Sexo", orderData: 1, name: "Sexo", className: "text-center noSearch noExport", width: "5%",
    "render": function (data, type, row) {
                            if (data == "Masculino") {
        icon = "fa-male";
    cor = "#0095ff";
                            }
    else {
        icon = "fa-female";
    cor = "#ff00d4";
                            }
    return `<span onclick="ToggleSexo(${row.Id})" style="font-size:18px;color:${cor};" class="p-l-xs pointer"> <i class="fa ${icon}" aria-hidden="true" title="${data}"></i></span >`;
                        }
                    },
    {
        data: "Nome", name: "Nome", autoWidth: true
                    },
    {
        data: "Etiquetas", name: "Etiquetas", className: 'noSearch', render: function (data, type, row) {
                            if (type === 'export') {
                                return `<div>

        ${row.Etiquetas.map(etiqueta => {
            if (etiqueta) {
                return etiqueta.Nome.replace(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/, '')
            }
        })}</div>`
                            }

    return `<div>
        ${$("#eventoid").val() != 999 ? row.Etiquetas.map(etiqueta => {
            if (etiqueta) {
                return `<span  class="badge m-r-xs" style="background-color:${etiqueta.Cor};color:#fff">${etiqueta.Nome}</span>`
            }
        }).join().replace(/,/g, '') : ""}
    </div>`
                        }
                    },
    {data: "Fone", name: "Fone", class: "noSearch" },
    {data: "Email", name: "Email", class: "noSearch" },

    {data: "Idade", name: "Idade", class: "noSearch" },
    {
        data: "Equipe", name: "Equipe", autoWidth: true
                    },
    {data: "Bairro", name: "Bairro", class: "noSearch" },
    {data: "Cidade", name: "Cidade", class: "noSearch" },


    {
        data: "StatusMontagem", name: "StatusMontagem", class: "noSearch", render: (data, type, row) =>
    `<span style="font-size:13px" class="text-center label label-${data == 'Ativo' ? 'primary' : 'success'}">${data}</span>`

                    },

    {
        data: "Id", name: "Id", orderable: false, width: "20%", className: 'noVis noSearch noExport',
    "render": function (data, type, row) {
                            var color = !(Coordenador == row.Tipo) ? 'info' : 'yellow';
    return `

    ${!isConvite ? GetLabel('ToggleMembroEquipeTipo', JSON.stringify(row), color, row.Tipo) : ""
    }
    ${GetIconWhatsApp(row.Fone)}
    ${GetIconTel(row.Fone)}
    ${!isConvite ? GetButton('GetHistorico', data, 'green', 'fas fa-history', 'Histórico') : ""}
    ${GetButton('Opcoes', JSON.stringify(row), 'cinza', 'fas fa-info-circle', 'Opções')}
    ${GetButton('EditEquipante', data, 'blue', 'fa-edit', 'Editar')}
    ${!isConvite ? GetButton('DeleteMembroEquipe', data, 'red', 'fa-trash', 'Excluir') : ""}

    `;
                        }
                    }
    ],
    order: [
    [2, "asc"]
    ],
    drawCallback: function () {
        $('.i-checks-green').iCheck({
            checkboxClass: 'icheckbox_square-green',
            radioClass: 'iradio_square-green'
        });
    $('.i-checks-green').on('ifToggled', function (event) {
        checkBulkActions()
    });
    $('#select-all').on('ifClicked', function (event) {
        $('.i-checks-green').iCheck($('#select-all').iCheck('update')[0].checked ? 'uncheck' : 'check')
    });
    if (callbackFunction) {
        callbackFunction()
    }
    if ($("#eventoid").val() != 999) {
        $('.hide-tipoevento').removeClass('d-none')
    } else {
        $('.hide-tipoevento').addClass('d-none')
    }

    changeEvento = false
    var idx = 0
    var api = this.api()
    api
    .columns()
    .every(function (colIdx) {
                            var column = this;
    if (!$(column.header()).hasClass('noSearch')) {
                                var input = $($($($(column.header()).parents('thead').find('tr')[1]).find('th')[idx]).find('input'))
    .on('change keyup clear', _.debounce(function () {
                                        if (column.search() !== this.value) {
        column.search(this.value).draw();
                                        }
                                    }, 500))

    if (oldEventoId != newEventoId) {
        input.val(api.state().columns[colIdx].search.search)
                                    changeEvento = true
                                }


                            }
    if (column.visible()) {
        idx++
    }

                        });
    if (changeEvento) {
        oldEventoId = newEventoId
    }
    newEventoId = $("#eventoid").val()
                },
    ajax: {
        url: '/Equipante/GetEquipantesDataTable',
    data: {
        EventoId: $("#eventoid").val(),
    Origem: "Montagem",
    Etiquetas: $("#equipante-marcadores").val(),
    NaoEtiquetas: $("#equipante-nao-marcadores").val(),
    Equipe: $("#equipe-select-filtro").val() != 999 ? $("#equipe-select-filtro").val() : null,
    StatusMontagem: $("#equipante-status-montagem").val() != 999 ? $("#equipante-status-montagem").val() : null,
                    },
    datatype: "json",
    type: "POST"
                }
            };

    table = $("#table-montagem").DataTable(tableEquipanteConfig);
        }


    function GetHistorico(id) {

        CarregarTabelaHistorico(id);
    $("#modal-historico").modal();

        }


    function CarregarTabelaHistorico(id) {
            const tableHistoricoConfig = {
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
    buttons: getButtonsConfig('Histórico'),
    columns: [
    {data: "Evento", name: "Evento", autoWidth: true },
    {
        data: "Equipe", name: "Equipe", autoWidth: true, render: function (data, type, row) {
                            return `<i class="fas fa-${row.Coordenador == " Coordenador" ? "star" : "user"}"></i> ${ data } `
                        }
                    },
                ],

                order: [
                    [0, "asc"]
                ],
                ajax: {
                    data: { id: id },
                    url: '/Equipante/GetHistorico',
                    datatype: "json",
                    type: "POST"
                }
            };

            const tableHistoricoParticipacaoConfig = {
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
                buttons: getButtonsConfig('Histórico'),
                columns: [
                    { data: "Evento", name: "Evento", autoWidth: true },
                ],

                order: [
                    [0, "asc"]
                ],
                ajax: {
                    data: { id: id },
                    url: '/Equipante/GetHistoricoParticipacao',
                    datatype: "json",
                    type: "POST"
                }
            };

            $("#table-historico").DataTable(tableHistoricoConfig);
            $("#table-historico-participacao").DataTable(tableHistoricoParticipacaoConfig);
        }

        function checkBulkActions() {
            if ($('input[type=checkbox][id!=select-all]:checked').length > 0) {
                $('#btn_bulk').css('display', 'inline-block')
            } else {
                $('#btn_bulk').css('display', 'none')
            }
        }


        function Opcoes(row) {
            equipante = row;
            $('.equipante-etiquetas').select2({ dropdownParent: $("#form-opcoes") });
            $.ajax({
                url: "/Equipante/GetEquipante/",
                data: { Id: row.Id, eventoId: $("#eventoid").val() },
                datatype: "json",
                type: "GET",
                contentType: 'application/json; charset=utf-8',
                success: function (data) {
                    equipante = data.Equipante
                    if ($('#modal-opcoes').is(":hidden")) {
                        $.ajax({
                            url: "/Mensagem/GetMensagensByTipo/",
                            datatype: "json",
                            data: JSON.stringify(
                                {
                                    eventoId: $("#eventoid").val(), tipos: ["Equipe"]
                                }),
                            type: "POST",
                            contentType: 'application/json; charset=utf-8',
                            success: function (dataMsg) {
                                $("#msg-list").html(`
${ dataMsg.data.map(p => `<option value=${p.Id}>${p.Titulo}</option>`) }
`)

                            }
                        })
                    }
                    $('.realista-nome').text(equipante.Nome)

                    $('#equipante-etiquetas').val(data.Equipante.Etiquetas.map(etiqueta => etiqueta.Id))
                    $('.equipante-etiquetas').select2({ dropdownParent: $("#form-opcoes") });
                    $('#equipante-obs').val(data.Equipante.Observacao)

                    arrayData = table.data().toArray()
                    let index = arrayData.findIndex(r => r.Id == row.Id)

                    $('#btn-previous').css('display', 'block')
                    $('#btn-next').css('display', 'block')
                    if (index == 0) {

                        $('#btn-previous').css('display', 'none')
                    }

                    if (index == arrayData.length - 1) {
                        $('#btn-next').css('display', 'none')
                    }

                    $("#modal-opcoes").modal();
                }
            });


        }


        function DeleteMembroEquipe(id) {
            ConfirmMessageDelete().then((result) => {
                if (result) {
                    $.ajax({
                        url: "/Equipe/DeleteMembroEquipeByEquipante/",
                        datatype: "json",
                        type: "POST",
                        contentType: 'application/json; charset=utf-8',
                        data: JSON.stringify(
                            {
                                Id: id,
                                EventoId: $('#eventoid').val()
                            }),
                        success: function () {
                            SuccessMesageDelete();
                            CarregarTabelaEquipante();
                        },
                        error: function (data) {
                            ErrorMessage("O Equipante está vinculado a um registro de Padrinho, não será possível deletá-lo")
                        }
                    });
                }
            });
        }


        var realista;
        let table

        var oldEventoId
        var newEventoId


        function AddMembroEquipe() {
            if ($("#listagem").val()) {
                $.ajax({
                    url: "/Equipe/AddMembroEquipe/",
                    datatype: "json",
                    type: "POST",
                    contentType: 'application/json; charset=utf-8',
                    data: JSON.stringify(
                        {
                            EquipanteId: $("#listagem").val(),
                            EventoId: $("#eventoid").val(),
                            EquipeId: $("#equipe-select").val(),
                            Tipo: tipo,
                            Origem: "Montagem"
                        }),
                    success: function () {
                        $("#listagem").val('');
                        $("#listagem").trigger('change');
                        CarregarTabelaEquipante()
                        $("#listagem").select2('open')
                    }
                });
            }
        }

        let tipo


        async function openBulkActions() {
            let ids = getCheckedIds()

            if ($("#eventoid").val() == 999) {
                $('.evento-bulk').css('display', 'block');
                $('.not-evento-bulk').css('display', 'none');
            } else {
                $('.evento-bulk').css('display', 'none');
                $('.not-evento-bulk').css('display', 'block');
            }

            await loadEquipesBulk()

            $.ajax({
                url: "/Mensagem/GetMensagensByTipo/",
                datatype: "json",
                data: JSON.stringify(
                    {
                        eventoId: $("#eventoid").val(), tipos: ["Equipe"]
                    }),
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                success: function (dataMsg) {
                    $("#bulk-mensagem").html(`
                                                                  ${ dataMsg.data.map(p => `<option value=${p.Id}>${p.Titulo}</option>`) }
`).select2({
                        width: 'resolve',
                        dropdownParent: $('#modal-bulk')
                    })

                }
            })

            $("#modal-actions").modal();
        }

        function getCheckedIds() {
            let ids = [];
            $('input[type=checkbox]:checked').each((index, input) => {
                if ($(input).data('id') != 'all') {
                    ids.push($(input).data('id'))
                }

            })
            return ids
        }

        async function applyBulk() {
            let ids = getCheckedIds()

            let arrPromises = []
            arrayData = table.data().toArray()
            ids.forEach(id => {
                if ($("#bulk-change-equipe").val()) {
                    arrPromises.push($.ajax({
                        url: "/Equipe/AddMembroEquipe/",
                        datatype: "json",
                        type: "POST",
                        contentType: 'application/json; charset=utf-8',
                        data: JSON.stringify(
                            {
                                EquipanteId: id,
                                EventoId: $("#eventoid").val(),
                                EquipeId: $("#bulk-change-equipe").val(),
                                Origem: "Montagem"
                            }),

                    }))
                }
            })

            await Promise.all(arrPromises);
            SuccessMesageOperation();
            CarregarTabelaEquipante()
        }


        async function loadEquipesBulk() {
            const equipes = await $.ajax({
                url: '/Equipe/GetEquipes',
                datatype: "json",
                data: { EventoId: $('#eventoid').val() },
                type: "POST"
            })

            $("#bulk-change-equipe").html(`
                                                                  ${ equipes.data.map(p => `<option value=${p.Id}>${p.Equipe}</option>`) }
`).select2({
                width: 'resolve',
                dropdownParent: $('#modal-bulk')
            })
        }
        function enviarMensagens() {

            let ids = getCheckedIds()


            $.ajax({
                url: "/Mensagem/GetMensagem/",
                data: { Id: $("#bulk-mensagem").val() },
                datatype: "json",
                type: "GET",
                contentType: 'application/json; charset=utf-8',
                success: function (dataMsg) {

                    $.ajax({
                        url: "/Equipante/GetTelefones/",
                        datatype: "json",
                        type: "POST",
                        contentType: 'application/json; charset=utf-8',
                        data: JSON.stringify({ ids }),
                        success: function (data) {

                            $.ajax({
                                url: "https://api.iecbeventos.com.br/whatsapp/message",
                                datatype: "json",
                                type: "POST",
                                contentType: 'application/json; charset=utf-8',
                                data: JSON.stringify(
                                    {
                                        session: username,
                                        messages: data.Equipantes.map(equipante => ({
                                            number: `${ equipante.Fone.replaceAll(' ', '').replaceAll('+', '').replaceAll('(', '').replaceAll(')', '').replaceAll('.', '').replaceAll('-', '') } @c.us`,
                                            text: dataMsg.Mensagem.Conteudo.replaceAll('${Nome Participante}', equipante.Nome)
                                        }))
                                    }),
success: function () {
    SuccessMesageOperation();
}
                            });

                        }
                    })
                }
            });



        }



function enviar() {
    var windowReference = window.open('_blank');
    $.ajax({
        url: "/Mensagem/GetMensagem/",
        data: { Id: $("#msg-list").val() },
        datatype: "json",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            var text = data.Mensagem.Conteudo.replaceAll('${Nome Participante}', equipante.Nome);
            windowReference.location = GetLinkWhatsApp(equipante.Fone, text)
        }
    });


}

function ToggleMembroEquipeTipo(row) {
    if (Membro == row.Tipo) {
        var windowReference = window.open('_blank');

    }
    $.ajax({
        url: "/Equipe/ToggleMembroEquipeTipoByEquipante/",
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            {
                Id: row.Id,
                EventoId: $('#eventoid').val()
            }),
        success: function (data) {
            CarregarTabelaEquipante();
            if (data) {

                windowReference.location = GetLinkWhatsApp(data.User.Fone, MsgUsuario(data.User))
            }

        },
        error: function (error) {
            ErrorMessage(error.statusText);
        }
    });
}

$("#modal-opcoes").on('hidden.bs.modal', function () {
    PostInfo()
});

function PostInfo(callback) {
    $.ajax({
        url: "/Equipante/PostEtiquetas/",
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            {
                Id: equipante.Id,
                eventoId: $("#eventoid").val(),
                Etiquetas: $('.equipante-etiquetas').val(),
                Obs: $('#equipante-obs').val(),
            }),
        success: function () {
            CarregarTabelaEquipante(callback)
        }
    });
}

function loadCampos(id) {
    $.ajax({
        url: "/Configuracao/GetCamposEquipeByEventoId/",
        data: { Id: id },
        datatype: "json",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            campos = data.Campos
            $('.campos-cadastro').html(`
                              <input type="hidden" id="equipante-id" />
${campos.find(x => x.Campo == "Nome e Sobrenome") ? `<div class="col-sm-12 p-w-md m-t-md text-center">
                                                    <h5>Nome</h5>

                                                    <input type="text" class="form-control required" id="equipante-nome" data-field="Nome" />
                                                </div>` : ""}

${campos.find(x => x.Campo == "Apelido") ? ` <div class="col-sm-12 p-w-md m-t-md text-center">
                                                    <h5>Apelido</h5>

                                                    <input type="text" class="form-control required" id="equipante-apelido" data-field="Apelido" />
                                                </div>` : ""}
${campos.find(x => x.Campo == 'Data Nascimento') ? `<div class="col-sm-12 p-w-md m-t-md text-center">
                                                    <h5>Data de Nascimento</h5>

                                                    <input type="text" class="form-control full-date required" id="equipante-data-nascimento" data-field="Data de Nascimento" />
                                                </div><div class="col-sm-12 p-w-md m-t-md text-center">
                                                    <h5>Sexo</h5>

                                                    <div class="radio i-checks-green inline"><label> <input type="radio" id="equipante-sexo" checked="" value="1" name="equipante-sexo"> <i></i> Masculino </label></div>
                                                    <div class="radio i-checks-green inline"><label> <input type="radio" id="equipante-sexo" value="2" name="equipante-sexo"> <i></i> Feminino </label></div>
                                                </div>` : ''}
${campos.find(x => x.Campo == 'Email') ? `<div class="col-sm-12 p-w-md m-t-md text-center">
                                                    <h5>Email</h5>

                                                    <input type="email" class="form-control" id="equipante-email" data-field="Email" />
                                                </div>` : ''}

${campos.find(x => x.Campo == 'Fone') ? `  <div class="col-sm-12 p-w-md m-t-md text-center">
                                                    <h5>WhatsApp</h5>

                                                    <input type="text" class="form-control fone" id="equipante-fone" data-field="WhatsApp" placeholder="+55 (81) 9999-9999" />
                                                </div>` : ''}`)


            initInputs()

        }
    });
}


function PostEquipante() {
    if (ValidateForm(`#form-equipante`)) {
        $.ajax({
            url: "/Equipante/PostEquipante/",
            datatype: "json",
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(
                {
                    Id: $("#equipante-id").val(),
                    Nome: $(`#equipante-nome`).val(),
                    DataNascimento: moment($("#equipante-data-nascimento").val(), 'DD/MM/YYYY', 'pt-br').toJSON(),
                    Email: $(`#equipante-email`).val(),
                    Fone: $(`#equipante-fone`).val(),
                    Sexo: $("input[type=radio][name=equipante-sexo]:checked").val()
                }),
            success: function () {
                SuccessMesageOperation();
                CarregarTabelaEquipante();
                $("#modal-equipantes").modal("hide");
            }
        });
    }
}

function EditEquipante(id) {
    GetEquipante(id);
    $("#modal-equipantes").modal();
}


function GetEquipante(id) {
    $('.equipante-etiquetas').select2({ dropdownParent: $("#form-equipante") });
    if (id > 0) {
        $.ajax({
            url: "/Equipante/GetEquipante/",
            data: { Id: id },
            datatype: "json",
            type: "GET",
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                $("#equipante-id").val(data.Equipante.Id);
                $(`#equipante-nome`).val(data.Equipante.Nome);
                $(`#equipante-apelido`).val(data.Equipante.Apelido);
                $("#equipante-data-nascimento").val(moment(data.Equipante.DataNascimento, 'DD/MM/YYYY').format('DD/MM/YYYY'));
                $("#equipante-data-casamento").val(moment(data.Equipante.DataCasamento, 'DD/MM/YYYY').format('DD/MM/YYYY'));
                $(`#equipante-email`).val(data.Equipante.Email);
                $(`#equipante-fone`).val(data.Equipante.Fone);
                $(`input[type=radio][name=equipante-sexo][value=${data.Equipante.Sexo == 'Feminino' ? 2 : 1}]`).iCheck('check');
            }
        });
    }
    else {
        $("#equipante-id").val(0);
        $(`#equipante-nome`).val("");
        $(`#equipante-apelido`).val("");
        $("#equipante-data-nascimento").val("");
        $(`#equipante-email`).val("");
        $(`#equipante-fone`).val("");
        $(`input[type=radio][name=equipante-sexo][value=1]`).iCheck('check');
    }

}

function ToggleSexo(id) {
    ConfirmMessage("Confirma a mudança de gênero?").then((result) => {
        if (result) {
            $.ajax({
                url: "/Equipante/ToggleSexo/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: id
                    }),
                success: function () {
                    SuccessMesageOperation();
                    CarregarTabelaEquipante();
                }
            });
        }
    });
}
