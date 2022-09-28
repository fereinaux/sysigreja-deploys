﻿var realista;
let table


function checkEvento() {
    if ($("#equipante-eventoid-filtro").val() != 999) {
        $('.hide-tipoevento').removeClass('d-none')

        $.ajax({
            url: '/Etiqueta/GetEtiquetasByEventoId',
            data: { eventoId: $("#equipante-eventoid-filtro").val() },
            datatype: "json",
            type: "POST",
            success: (result) => {
                $("#equipante-marcadores").html(`
${result.data.map(p => `<option value=${p.Id}>${p.Nome}</option>`)}
`)
                $("#equipante-nao-marcadores").html(`
${result.data.map(p => `<option value=${p.Id}>${p.Nome}</option>`)}
`)
                $('#equipante-marcadores').select2();
                $('#equipante-nao-marcadores').select2();
                $('#equipante-status').select2();
            }
        });
    } else {
        $('.hide-tipoevento').addClass('d-none')
    }
}

function loadEquipes() {
    checkEvento()

    getEquipes()
    CarregarTabelaEquipante()


}

function CarregarTabelaEquipante(callbackFunction) {
    $('#btn_bulk').css('display', 'none')

    const tableEquipanteConfig = {
        language: languageConfig,
        searchDelay: 750,
        lengthMenu: [10, 30, 50, 100, 200],
        colReorder: false,
        serverSide: true,
        deferloading: 0,
        orderCellsTop: true,
        fixedHeader: true,
        filter: true,
        orderMulti: false,
        responsive: true,
        stateSave: true,
        destroy: true,
        dom: domConfig,
        stateLoadParams: function (settings, data) {
            for (var i = 0; i < data.columns.length; i++) {
                data.columns[i].visible = settings.aoColumns[i].visible != undefined ? settings.aoColumns[i].visible : true
            }
        },
        buttons: getButtonsConfig('Equipantes'),
        columns: [
            {
                data: "Id", name: "Id", orderable: false, width: "2%",
                "render": function (data, type, row) {
                    return `${GetCheckBox(data, row.Presenca)}`;
                }
            },
            { data: "Sexo", name: "Sexo", visible: false },
            {
                data: "Sexo", orderData: 0, name: "Sexo", className: "text-center", width: "5%",
                "render": function (data, type, row) {
                    if (data == "Masculino") {
                        icon = "fa-male";
                        cor = "#0095ff";
                    }
                    else {
                        icon = "fa-female";
                        cor = "#ff00d4";
                    }
                    return `<span onclick="ToggleSexo(${row.Id})" style = "font-size:18px;color:${cor};" class="p-l-xs pointer"> <i class="fa ${icon}" aria-hidden="true" title="${data}"></i></span >`;
                }
            },
            {
                data: "Nome", name: "Nome", autoWidth: true, render: function (data, type, row) {
                    return `<div>
                        <span>${row.Nome}</br></span>
                        ${$("#equipante-eventoid-filtro").val() != 999 ? row.Etiquetas.map(etiqueta => {
                        if (etiqueta) {
                            return `<span  class="badge m-r-xs" style="background-color:${etiqueta.Cor};color:#fff">${etiqueta.Nome}</span>`
                        }
                    }).join().replace(/,/g, '') : ""}
                    </div>`
                }
            },
            { data: "Idade", name: "Idade", },
            { data: "Equipe", name: "Equipe", autoWidth: true, visible: $("#equipante-eventoid-filtro").val() != 999 },
            { data: "Faltas", name: "Faltas", visible: $("#equipante-eventoid-filtro").val() != 999 },
            {
                data: "HasOferta", name: "HasOferta", autoWidth: true, visible: $("#equipante-eventoid-filtro").val() != 999, render: function (data, type, row) {
                    if (row.Status == "Em espera") {
                        return `<span style="font-size:13px" class="text-center label label-default}">Em espera</span>`;
                    }
                    return `<span style="font-size:13px" class="text-center label label-${row.HasOferta ? 'primary' : 'warning'}">${row.HasOferta ? 'Pago' : 'Pendente'}</span>`;
                }
            },
            {
                data: "Id", name: "Id", orderable: false, width: "20%",
                "render": function (data, type, row) {
                    return `   

<form enctype="multipart/form-data" id="frm-vacina${data}" method="post" novalidate="novalidate">
${GetAnexosButton('Anexos', data, row.QtdAnexos)}
                                ${!row.HasFoto ? ` <label for="foto${data}" class="inputFile">
                                <span style="font-size:18px" class="text-mutted pointer p-l-xs"><i class="fa fa-camera" aria-hidden="true" title="Foto"></i></span>
                                <input accept="image/*" onchange='Foto(${JSON.stringify(row)})' style="display: none;" class="custom-file-input inputFile" id="foto${data}" name="foto${data}" type="file" value="">
                            </label>`: `<span style="font-size:18px" class="text-success p-l-xs pointer" onclick="toggleFoto(${data})"><i class="fa fa-camera" aria-hidden="true" title="Foto"></i></span>`
                        }
${!row.HasVacina ? ` <label for="arquivo${data}" class="inputFile">
                                <span style="font-size:18px" class="text-mutted pointer p-l-xs"><i class="fa fa-syringe" aria-hidden="true" title="Vacina"></i></span>
                                <input onchange='PostVacina(${data},${JSON.stringify(row)})' style="display: none;" class="custom-file-input inputFile" id="arquivo${data}" name="arquivo${data}" type="file" value="">
                            </label>`: `<span style="font-size:18px" class="text-success p-l-xs pointer" onclick="toggleVacina(${data})"><i class="fa fa-syringe" aria-hidden="true" title="Vacina"></i></span>`}
                           
          ${GetIconWhatsApp(row.Fone)}
                            ${GetIconTel(row.Fone)}
                            ${$("#equipante-eventoid-filtro").val() != 999 ? GetButton('Pagamentos', JSON.stringify(row), 'verde', 'far fa-money-bill-alt', 'Pagamentos') : ""}
                            ${$("#equipante-eventoid-filtro").val() != 999 ? GetButton('EditEquipante', data, 'blue', 'fa-edit', 'Editar') : ""}
${$("#equipante-eventoid-filtro").val() != 999 ? GetButton('Opcoes', JSON.stringify(row), 'cinza', 'fas fa-info-circle', 'Opções') : ""}
                            ${GetButton('DeleteEquipante', data, 'red', 'fa-trash', 'Excluir')}
                        </form> 
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
        },
        ajax: {
            url: '/Equipante/GetEquipantesDataTable',
            data: getFiltros(),
            datatype: "json",
            type: "POST"
        }
    };

    table = $("#table-equipantes").DataTable(tableEquipanteConfig);
}

function getEquipes() {
    if ($("#equipante-eventoid-filtro").val() != 999) {

        $.ajax({
            url: '/Equipe/GetEquipes',
            datatype: "json",
            data: { EventoId: $("#equipante-eventoid-filtro").val() },
            type: "POST",
            success: (result) => {
                $("#equipe-select").html(`
<option value=999>Selecione</option>
${result.data.map(p => `<option value=${p.Id}>${p.Equipe}</option>`)}
`)
                $('#equipe-select').select2();
            }
        });
    } else {
        $("#equipe-select").html(`
<option value=999>Selecione</option>`)
    }
}

function Anexos(id) {
    $("#EquipanteIdModal").val(id);
    $("#LancamentoIdModal").val('');
    $("#EventoIdModal").val($("#equipante-eventoid").val());
    GetAnexos(id);
    $("#modal-anexos").modal();
}


function GetAnexosLancamento(id) {
    const tableArquivoConfig = {
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
        columns: [
            { data: "Nome", name: "Nome", autoWidth: true },
            { data: "Extensao", name: "Extensao", autoWidth: true },
            {
                data: "Id", name: "Id", orderable: false, width: "15%",
                "render": function (data, type, row) {
                    return `${GetButton('GetArquivo', data, 'blue', 'fa-download', 'Download')}
                            ${GetButton('DeleteArquivo', data, 'red', 'fa-trash', 'Excluir')}`;
                }
            }
        ],
        order: [
            [0, "asc"]
        ],
        ajax: {
            url: '/Arquivo/GetArquivosLancamento',
            data: { id: id ? id : $("#LancamentoIdModal").val() },
            datatype: "json",
            type: "POST"
        }
    };

    $("#table-anexos").DataTable(tableArquivoConfig);
}

function AnexosLancamento(row) {
    $("#LancamentoIdModal").val(row.Id);
    $("#equipanteIdModal").val(row.equipanteId);
    GetAnexosLancamento(row.Id)
    $("#modal-pagamentos").modal('hide');
    $("#modal-anexos").modal();
}




function GetAnexos(id) {
    const tableArquivoConfig = {
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
        columns: [
            { data: "Nome", name: "Nome", autoWidth: true },
            { data: "Extensao", name: "Extensao", autoWidth: true },
            {
                data: "Id", name: "Id", orderable: false, width: "15%",
                "render": function (data, type, row) {
                    return `${GetButton('GetArquivo', data, 'blue', 'fa-download', 'Download')}
                            ${GetButton('DeleteArquivo', data, 'red', 'fa-trash', 'Excluir')}`;
                }
            }
        ],
        order: [
            [0, "asc"]
        ],
        ajax: {
            url: '/Arquivo/GetArquivosEquipanteEvento',
            data: { equipanteid: id ? id : $("#EquipanteIdModal").val(), eventoid: $("#equipante-eventoid").val() },
            datatype: "json",
            type: "POST"
        }
    };

    $("#table-anexos").DataTable(tableArquivoConfig);
}

function GetArquivo(id) {
    window.open(`/Arquivo/GetArquivo/${id}`)
}

function DeleteArquivo(id) {
    ConfirmMessageDelete().then((result) => {
        if (result) {
            $.ajax({
                url: "/Arquivo/DeleteArquivo/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: id
                    }),
                success: function () {
                    SuccessMesageDelete();
                    GetAnexos();
                }
            });
        }
    });
}

function ConfirmFoto() {

    $("#main-cropper")
        .croppie("result", {
            type: "canvas",
            size: { height: 750, width: 500 }
        })
        .then(function (resp) {
            var dataToPost = new FormData();
            dataToPost.set('EquipanteId', realista.Id)
            dataToPost.set('Arquivo', dataURLtoFile(resp, `Foto ${realista.Nome}.jpg`))
            dataToPost.set('IsFoto', true)
            $.ajax(
                {
                    processData: false,
                    contentType: false,
                    type: "POST",
                    data: dataToPost,
                    url: "Arquivo/PostArquivo",
                    success: function () {
                        $("#modal-fotos").modal("hide");
                        CarregarTabelaEquipante()

                    }
                });
        });
}

function dataURLtoFile(dataurl, filename) {

    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime })

}


function Foto(row) {

    realista = row

    var input = $(`#foto${realista.Id}`)[0]

    const file = input.files[0];


    if (!file) {
        return;
    }

    new Compressor(file, {
        quality: 0.6,
        convertSize: 1000000,
        // The compression process is asynchronous,
        // which means you have to access the `result` in the `success` hook function.
        success(result) {

            var reader = new FileReader();

            reader.onload = function (e) {
                $("#main-cropper").croppie("bind", {
                    url: e.target.result
                });

            };

            reader.readAsDataURL(result);


            $("#modal-fotos").modal();
            var boundaryWidth = $("#fotocontent").width();

            var boundaryHeight = boundaryWidth * 1.5;

            var viewportWidth = boundaryWidth - (boundaryWidth / 100 * 25);

            var viewportHeight = boundaryHeight - (boundaryHeight / 100 * 25);

            $("#main-cropper").croppie({

                viewport: { width: viewportWidth, height: viewportHeight },
                boundary: { width: boundaryWidth, height: boundaryHeight },
                enableOrientation: true,
                showZoomer: true,
                enableExif: true,
                enableResize: false,

            });
        },
        error(err) {
            console.log(err.message);
        },
    });
}

function toggleFoto(id) {
    ConfirmMessage("Essa ação removerá a foto, deseja continuar?").then((result) => {
        if (result) {
            $.ajax(
                {
                    datatype: "json",
                    type: "POST",
                    contentType: 'application/json; charset=utf-8',
                    url: "Arquivo/DeleteFotoEquipante",
                    data: JSON.stringify(
                        {
                            Id: id
                        }),

                    success: function () {
                        CarregarTabelaEquipante()

                    }
                });
        }
    }
    )
}

function PostVacina(id, realista) {
    var dataToPost = new FormData($(`#frm-vacina${id}`)[0]);
    dataToPost.set('EquipanteId', id)
    var filename = dataToPost.get(`arquivo${id}`).name
    var arquivo = new File([dataToPost.get(`arquivo${id}`)], 'Vacina ' + realista.Nome + filename.substr(filename.indexOf('.')));
    dataToPost.set('Arquivo', arquivo)
    $.ajax(
        {
            processData: false,
            contentType: false,
            type: "POST",
            data: dataToPost,
            url: "Arquivo/PostArquivo",
            success: function () {
                toggleVacina(id)

            }
        });
}

function toggleVacina(id) {
    $.ajax(
        {
            datatype: "json",
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            url: "Equipante/ToggleVacina",
            data: JSON.stringify(
                {
                    Id: id
                }),

            success: function () {
                CarregarTabelaEquipante()

            }
        });
}

function PostArquivo() {

    var dataToPost = new FormData($('#frm-upload-arquivo-modal')[0]);
    var filename = dataToPost.get('arquivo-modal').name

    var arquivo = dataToPost.get('LancamentoIdModal') > 0 ? new File([dataToPost.get('arquivo-modal')], 'Pagamento ' + realista.Nome + filename.substr(filename.indexOf('.'))) : dataToPost.get('arquivo-modal');

    dataToPost.set('Arquivo', arquivo)
    dataToPost.set('EventoId', $("#equipante-eventoid").val())
    dataToPost.set('EquipanteId', dataToPost.get('EquipanteIdModal'))
    dataToPost.set('LancamentoId', dataToPost.get('LancamentoIdModal'))
    $.ajax(
        {
            processData: false,
            contentType: false,
            type: "POST",
            data: dataToPost,
            url: "Arquivo/PostArquivo",
            success: function () {
                if (dataToPost.get('LancamentoIdModal')) {
                    GetAnexosLancamento();
                } else {
                    GetAnexos();
                }

            }
        });
}

$("#arquivo-modal").change(function () {
    PostArquivo();
});

$("#equipante-eventoid").change(function () {
    GetAnexos($("#EquipanteIdModal").val())
});


$("#modal-anexos").on('hidden.bs.modal', function () {
    CarregarTabelaEquipante()
});

$("#modal-pagamentos").on('hidden.bs.modal', function () {
    if (!$('#LancamentoIdModal').val()) {
        CarregarTabelaEquipante();

    }
})



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



function CarregarTabelaPagamentos(id) {
    const tablePagamentosConfig = {
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
        columns: [
            { data: "FormaPagamento", name: "FormaPagamento", autoWidth: true },
            { data: "Valor", name: "Valor", autoWidth: true },
            {
                data: "Id", name: "Id", orderable: false, width: "15%",
                "render": function (data, type, row) {
                    return `${GetAnexosButton('AnexosLancamento', JSON.stringify(row), row.QtdAnexos)}
                            ${GetIconWhatsApp($("#pagamentos-whatsapp").val(), RebciboPagamento(row.Valor, row.FormaPagamento))}
                            ${GetButton('DeletePagamento', data, 'red', 'fa-trash', 'Excluir')}`;
                }
            }
        ],
        order: [
            [0, "asc"]
        ],
        ajax: {
            url: '/Lancamento/GetPagamentos',
            data: { EquipanteId: id, EventoId: $('#equipante-eventoid-filtro').val() },
            datatype: "json",
            type: "POST"
        }
    };
    $("#table-pagamentos").DataTable(tablePagamentosConfig);
}

function Pagamentos(row) {
    $("#pagamentos-whatsapp").val(row.Fone);
    $("#pagamentos-valor").val($("#pagamentos-valor").data("valor-equipante"));
    $("#pagamentos-origem").val('')
    $("#pagamentos-data").val(moment().format('DD/MM/YYYY'));
    $("#pagamentos-equipanteid").val(row.Id);
    $("#pagamentos-meiopagamento").val($("#pagamentos-meiopagamento option:first").val());
    CarregarTabelaPagamentos(row.Id);
    realista = row
    $("#modal-pagamentos").modal();
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
                if (data.Equipante.Congregacao == 'Trindade' || data.Equipante.Congregacao == 'Recon') {
                    $(`input[type=radio][name=equipante-congregacao][value='${data.Equipante.Congregacao}']`).iCheck('check');
                } else {
                    $(`input[type=radio][name=equipante-congregacao][value='Outra']`).iCheck('check');
                    $(`#equipante-congregacaodescricao`).val(data.Equipante.Congregacao);
                    $('.congregacao').removeClass('d-none');
                    $("#equipante-congregacaodescricao").addClass('required');
                }

                $("#equipante-checkin").val(data.Equipante.Checkin);
                $(`#equipante-nome`).val(data.Equipante.Nome);
                $(`#equipante-apelido`).val(data.Equipante.Apelido);
                $("#equipante-data-nascimento").val(moment(data.Equipante.DataNascimento).format('DD/MM/YYYY'));
                $(`#equipante-email`).val(data.Equipante.Email);
                $(`#equipante-fone`).val(data.Equipante.Fone);

                $(`#equipante-nome-pai`).val(data.Equipante.NomePai);
                $(`#equipante-fone-pai`).val(data.Equipante.FonePai);
                $(`#equipante-nome-mae`).val(data.Equipante.NomeMae);
                $(`#equipante-fone-mae`).val(data.Equipante.FoneMae);
                $(`#equipante-cep`).val(data.Equipante.CEP);
                $(`#equipante-logradouro`).val(data.Equipante.Logradouro);
                $(`#equipante-bairro`).val(data.Equipante.Bairro);
                $(`#equipante-cidade`).val(data.Equipante.Cidade);
                $(`#equipante-estado`).val(data.Equipante.Estado);
                $(`#equipante-numero`).val(data.Equipante.Numero);
                $(`#equipante-complemento`).val(data.Equipante.Complemento);
                $(`#equipante-conjuge`).val(data.Equipante.Conjuge);
                $(`#equipante-referencia`).val(data.Equipante.Referencia);

                $(`#equipante-latitude`).val((data.Equipante.Latitude || '').replaceAll(',', '.'));
                $(`#equipante-longitude`).val((data.Equipante.Longitude || '').replaceAll(',', '.'));

                if ($('#map').length > 0) {

                    montarMapa()

                }
                $(`#equipante-nome-convite`).val(data.Equipante.NomeConvite);
                $(`#equipante-fone-convite`).val(data.Equipante.FoneConvite);
                $(`#equipante-nome-contato`).val(data.Equipante.NomeContato);
                $(`#equipante-fone-contato`).val(data.Equipante.FoneContato);
                $(`#equipante-restricaoalimentar`).val(data.Equipante.RestricaoAlimentar);
                $(`#equipante-medicacao`).val(data.Equipante.Medicacao);
                $(`#equipante-alergia`).val(data.Equipante.Alergia);
                $(`#equipante-convenio`).val(data.Equipante.Convenio);
                $(`#equipante-hospitais`).val(data.Equipante.Hospitais);
                console.log(data.Equipante.HasRestricaoAlimentar);
                console.log(data.Equipante.Sexo);
                $(`input[type=radio][name=equipante-sexo][value=${data.Equipante.Sexo}]`).iCheck('check');
                $(`input[type=radio][name=equipante-hasalergia][value=${data.Equipante.HasAlergia}]`).iCheck('check');
                $(`input[type=radio][name=equipante-hasmedicacao][value=${data.Equipante.HasMedicacao}]`).iCheck('check');
                $(`input[type=radio][name=equipante-hasconvenio][value=${data.Equipante.HasConvenio}]`).iCheck('check');
                $(`input[type=radio][name=equipante-hasrestricaoalimentar][value=${data.Equipante.HasRestricaoAlimentar}]`).iCheck('check');
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
        $(`#equipante-restricaoalimentar`).val("");
        $(`#equipante-medicacao`).val("");
        $(`#equipante-alergia`).val("");
        $(`#equipante-cep`).val("");
        $(`#equipante-logradouro`).val("");
        $(`#equipante-bairro`).val('');
        $(`#equipante-cidade`).val('');
        $(`#equipante-estado`).val('');
        $(`#equipante-numero`).val('');
        $(`#equipante-complemento`).val('');
        $(`#equipante-referencia`).val('');
        $(`input[type=radio][name=equipante-sexo][value=1]`).iCheck('check');
        $(`input[type=radio][name=equipante-hasalergia][value=false]`).iCheck('check');
        $(`input[type=radio][name=equipante-hasmedicacao][value=false]`).iCheck('check');
        $(`input[type=radio][name=equipante-hasrestricaoalimentar][value=false]`).iCheck('check');
    }


    $('#has-medicacao').on('ifChecked', function (event) {
        $('.medicacao').removeClass('d-none');
        $("#equipante-medicacao").addClass('required');
    });

    $('#not-medicacao').on('ifChecked', function (event) {
        $('.medicacao').addClass('d-none');
        $("#equipante-medicacao").removeClass('required');
    });

    $('#has-convenio').on('ifChecked', function (event) {
        $('.convenio').removeClass('d-none');
        $("#equipante-convenio").addClass('required');
    });

    $('#not-convenio').on('ifChecked', function (event) {
        $('.convenio').addClass('d-none');
        $("#equipante-convenio").removeClass('required');
    });


    $('#has-alergia').on('ifChecked', function (event) {
        $('.alergia').removeClass('d-none');
        $("#equipante-alergia").addClass('required');
    });

    $('#not-alergia').on('ifChecked', function (event) {
        $('.alergia').addClass('d-none');
        $("#equipante-alergia").removeClass('required');
    });

    $('#has-restricaoalimentar').on('ifChecked', function (event) {
        $('.restricaoalimentar').removeClass('d-none');
        $("#equipante-restricaoalimentar").addClass('required');
    });

    $('#not-restricaoalimentar').on('ifChecked', function (event) {
        $('.restricaoalimentar').addClass('d-none');
        $("#equipante-restricaoalimentar").removeClass('required');
    });


    $('#has-parente').on('ifChecked', function (event) {
        $('.parente').removeClass('d-none');
        $("#equipante-parente").addClass('required');
    });

    $('#not-parente').on('ifChecked', function (event) {
        $('.parente').addClass('d-none');
        $("#equipante-parente").removeClass('required');
    });

    $('#trindade').on('ifChecked', function (event) {
        $('.congregacao').addClass('d-none');
        $("#equipante-congregacaodescricao").removeClass('required');
    });

    $('#recon').on('ifChecked', function (event) {
        $('.congregacao').addClass('d-none');
        $("#equipante-congregacaodescricao").removeClass('required');
    });

    $('#outra').on('ifChecked', function (event) {
        $('.congregacao').removeClass('d-none');
        $("#equipante-congregacaodescricao").addClass('required');
    });
}

function EditEquipante(id) {
    GetEquipante(id);
    $("#modal-equipantes").modal();
}

function DeleteEquipante(id) {
    ConfirmMessageDelete().then((result) => {
        if (result) {
            $.ajax({
                url: "/Equipante/DeleteEquipante/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: id
                    }),
                success: function () {
                    SuccessMesageDelete();
                    CarregarTabelaEquipante();
                }
            });
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
function Opcoes(row) {
    equipante = row;
    $('.equipante-etiquetas').select2({ dropdownParent: $("#form-opcoes") });
    $.ajax({
        url: "/Equipante/GetEquipante/",
        data: { Id: row.Id, eventoId: $("#equipante-eventoid-filtro").val() },
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
                            eventoId: $("#equipante-eventoid-filtro").val(), tipos: ["Equipe"]
                        }),
                    type: "POST",
                    contentType: 'application/json; charset=utf-8',
                    success: function (dataMsg) {
                        $("#msg-list").html(`
${dataMsg.data.map(p => `<option value=${p.Id}>${p.Titulo}</option>`)}
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
                eventoId: $("#equipante-eventoid-filtro").val(),
                Etiquetas: $('.equipante-etiquetas').val(),
                Obs: $('#equipante-obs').val(),
            }),
        success: function () {
            CarregarTabelaEquipante(callback)
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
                    Apelido: $(`#equipante-apelido`).val(),
                    DataNascimento: moment($("#equipante-data-nascimento").val(), 'DD/MM/YYYY', 'pt-br').toJSON(),
                    Email: $(`#equipante-email`).val(),
                    Fone: $(`#equipante-fone`).val(),
                    Instagram: $('#equipante-instagram').val(),
                    HasRestricaoAlimentar: $("input[type=radio][name=equipante-hasrestricaoalimentar]:checked").val(),
                    RestricaoAlimentar: $(`#equipante-restricaoalimentar`).val(),
                    HasMedicacao: $("input[type=radio][name=equipante-hasmedicacao]:checked").val(),
                    Medicacao: $(`#equipante-medicacao`).val(),
                    HasAlergia: $("input[type=radio][name=equipante-hasalergia]:checked").val(),
                    Alergia: $(`#equipante-alergia`).val(),
                    CEP: $(`#equipante-cep`).val(),
                    Logradouro: $(`#equipante-logradouro`).val(),
                    Bairro: $(`#equipante-bairro`).val(),
                    Cidade: $(`#equipante-cidade`).val(),
                    Estado: $(`#equipante-estado`).val(),
                    Numero: $(`#equipante-numero`).val(),
                    Complemento: $(`#equipante-complemento`).val(),
                    Referencia: $(`#equipante-referencia`).val(),
                    Latitude: $(`#equipante-latitude`).val(),
                    Longitude: $(`#equipante-longitude`).val(),
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


function DeletePagamento(id) {
    ConfirmMessageDelete().then((result) => {
        if (result) {
            $.ajax({
                url: "/Lancamento/DeletePagamento/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: id
                    }),
                success: function () {
                    SuccessMesageDelete();
                    CarregarTabelaPagamentos($("#pagamentos-equipanteid").val());
                }
            });
        }
    });
}

function PostPagamento() {
    if (ValidateForm(`#form-pagamento`)) {
        $.ajax({
            url: "/Lancamento/PostPagamento/",
            datatype: "json",
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(
                {
                    EquipanteId: $("#pagamentos-equipanteid").val(),
                    EventoId: $("#equipante-eventoid-filtro").val(),
                    Origem: $("#pagamentos-origem").val(),
                    Data: moment($("#pagamentos-data").val(), 'DD/MM/YYYY', 'pt-br').toJSON(),
                    MeioPagamentoId: $("#pagamentos-meiopagamento").val(),
                    ContaBancariaId: $('.contabancaria').hasClass('d-none') ? 0 : $("#pagamentos-contabancaria").val(),
                    Valor: Number($("#pagamentos-valor").val())
                }),
            success: function () {
                SuccessMesageOperation();
                $("#pagamentos-origem").val('')
                $("#pagamentos-data").val(moment().format('DD/MM/YYYY'));
                CarregarTabelaPagamentos($("#pagamentos-equipanteid").val());
            }
        });
    }
}

$(document).ready(function () {
    loadEquipes()
    checkEvento()
    CarregarTabelaEquipante();
    loadCampos($("[id$='eventoid']").val());
});

function previous() {
    PostInfo(function () {
        arrayData = table.data().toArray()
        let index = arrayData.findIndex(r => r.Id == equipante.Id)
        if (index > 0) {
            Opcoes(arrayData[index - 1])
        }
    })
}

function next() {
    PostInfo(function () {
        arrayData = table.data().toArray()
        let index = arrayData.findIndex(r => r.Id == equipante.Id)
        if (index + 1 < arrayData.length) {
            Opcoes(arrayData[index + 1])
        }
    })
}



async function loadCrachaImprimir(Foto) {
    ids = [];
    $('input[type=checkbox]:checked').each((index, input) => {
        if ($(input).data('id') && $(input).data('id') != 'all') {
            ids.push($(input).data('id'))
        }

    })
    const result = await $.ajax(
        {
            processData: false,
            contentType: false,
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(ids.length > 0 ? { Ids: ids, Foto: Foto, EventoId: $("#equipante-eventoid-filtro").val() } : getFiltros(Foto)),
            url: "Equipante/GetCracha",
        });

    return result.data
}

function getFiltros(Foto) {
    return {
        EventoId: $("#equipante-eventoid-filtro").val() != 999 ? $("#equipante-eventoid-filtro").val() : null,
        Status: $("#equipante-status").val(),
        Etiquetas: $("#equipante-marcadores").val(),
        NaoEtiquetas: $("#equipante-nao-marcadores").val(),
        Equipe: $("#equipe-select").val() != 999 ? $("#equipe-select").val() : null,
        Foto: Foto
    }
}


function checkBulkActions() {
    if ($('input[type=checkbox][id!=select-all]:checked').length > 0) {
        $('#btn_bulk').css('display', 'inline-block')
    } else {
        $('#btn_bulk').css('display', 'none')
    }
}

async function loadEquipesBulk() {
    const equipes = await $.ajax({
        url: '/Equipe/GetEquipes',
        datatype: "json",
        data: { EventoId: $("#equipante-eventoid-filtro").val() != 999 ? $("#equipante-eventoid-filtro").val() : $('#equipante-eventoid-bulk').val() },
        type: "POST"
    })

    $("#bulk-equipe").html(`
<option value=999>Selecione</option>
        ${equipes.data.map(p => `<option value=${p.Id}>${p.Equipe}</option>`)}
        `)
}

async function openBulkActions() {
    let ids = getCheckedIds()

    if ($("#equipante-eventoid-filtro").val() == 999) {
        $('.evento-bulk').css('display', 'block');
        $('.not-evento-bulk').css('display', 'none');
    } else {
        $('.evento-bulk').css('display', 'none');
        $('.not-evento-bulk').css('display', 'block');
    }

    const quartos = await $.ajax({
        url: '/Quarto/GetQuartos',
        datatype: "json",
        data: {
            EventoId: $("#equipante-eventoid-filtro").val() != 999 ? $("#equipante-eventoid-filtro").val() : $('#equipante-eventoid-bulk').val(), Tipo: 0 },
        type: "POST"
    })

    await loadEquipesBulk()

    const etiquetas = await $.ajax({
        url: '/Etiqueta/GetEtiquetasByEventoId',
        data: { eventoId: $("#equipante-eventoid-filtro").val() != 999 ? $("#equipante-eventoid-filtro").val() : $('#equipante-eventoid-bulk').val() },
        datatype: "json",
        type: "POST",
    });

    arrayData = table.data().toArray()
    let idsM = ids.filter(x => arrayData.find(y => y.Id == x && y.Sexo == "Masculino"))
    let idsF = ids.filter(x => arrayData.find(y => y.Id == x && y.Sexo == "Feminino"))

    if ((quartos.data.filter(x => x.CapacidadeInt - x.Quantidade >= idsM.length && x.Sexo == "Masculino").length == 0) || idsM.length == 0) {
        $('.quarto-m').css('display', 'none')
    } else {
        $('.quarto-m').css('display', 'block')
    }

    $("#bulk-quarto-m").html(`
<option value=999>Selecione</option>
        ${quartos.data.filter(x => x.CapacidadeInt - x.Quantidade >= idsM.length && x.Sexo == "Masculino").map(p => `<option value=${p.Id}>${p.Titulo} ${p.Equipante}</option>`)}
        `)

    if ((quartos.data.filter(x => x.CapacidadeInt - x.Quantidade >= idsF.length && x.Sexo == "Feminino").length == 0) || idsF.length == 0) {
        $('.quarto-f').css('display', 'none')
    } else {
        $('.quarto-f').css('display', 'block')
    }

    $("#bulk-quarto-f").html(`
<option value=999>Selecione</option>
        ${quartos.data.filter(x => x.CapacidadeInt - x.Quantidade >= idsF.length && x.Sexo == "Feminino").map(p => `<option value=${p.Id}>${p.Titulo} ${p.Equipante}</option>`)}
        `)


    if (quartos.data.filter(x => x.CapacidadeInt - x.Quantidade >= ids.length && x.Sexo == "Misto").length == 0) {
        $('.quarto-misto').css('display', 'none')
    } else {
        $('.quarto-misto').css('display', 'block')
    }

    $("#bulk-quarto-misto").html(`
<option value=999>Selecione</option>
        ${quartos.data.filter(x => x.CapacidadeInt - x.Quantidade >= ids.length && x.Sexo == "Misto").map(p => `<option value=${p.Id}>${p.Titulo} ${p.Equipante}</option>`)}
        `)

    $("#bulk-add-etiqueta").html(`
<option value=999>Selecione</option>
${etiquetas.data.map(p => `<option value=${p.Id}>${p.Nome}</option>`)}
`)
    $("#bulk-remove-etiqueta").html(`
<option value=999>Selecione</option>
${etiquetas.data.map(p => `<option value=${p.Id}>${p.Nome}</option>`)}
`)

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

        if (($("#bulk-quarto-m").val() != 999) && arrayData.find(x => x.Id == id).Sexo == "Masculino") {
            arrPromises.push($.ajax({
                url: "/Quarto/ChangeQuarto/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        ParticipanteId: id,
                        DestinoId: $("#bulk-quarto-m").val(),
                        tipo: 0
                    }),
            }))
        }

        if (($("#bulk-quarto-f").val() != 999) && arrayData.find(x => x.Id == id).Sexo == "Feminino") {
            arrPromises.push($.ajax({
                url: "/Quarto/ChangeQuarto/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        equipanteId: id,
                        DestinoId: $("#bulk-quarto-f").val(),
                        tipo: 0
                    }),
            }))
        }

        if (($("#bulk-quarto-misto").val() != 999)) {
            arrPromises.push($.ajax({
                url: "/Quarto/ChangeQuarto/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        equipanteId: id,
                        DestinoId: $("#bulk-quarto-misto").val(),
                        tipo: 0
                    }),
            }))
        }

        if ($("#bulk-add-etiqueta").val() != 999) {
            arrPromises.push($.ajax({
                url: "/Etiqueta/AddEtiqueta/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        destinoId: id,
                        etiquetaId: $("#bulk-add-etiqueta").val(),
                        EventoId: $("#equipante-eventoid-filtro").val(),
                        tipo: 0
                    }),

            }))
        }

        if ($("#bulk-remove-etiqueta").val() != 999) {
            arrPromises.push($.ajax({
                url: "/Etiqueta/RemoveEtiqueta/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        destinoId: id,
                        etiquetaId: $("#bulk-remove-etiqueta").val(),
                        EventoId: $("#equipante-eventoid-filtro").val(),
                        tipo: 0
                    }),

            }))
        }

        if ($("#bulk-equipe").val() != 999) {
            arrPromises.push($.ajax({
                url: "/Equipe/AddMembroEquipe/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        EquipanteId: id,
                        EventoId: $("#equipante-eventoid-filtro").val() != 999 ? $("#equipante-eventoid-filtro").val() : $('#equipante-eventoid-bulk').val(),
                        EquipeId: $("#bulk-equipe").val()
                    }),

            }))
        }
    })

    await Promise.all(arrPromises);
    SuccessMesageOperation();
    CarregarTabelaEquipante()
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
                            </div>` : ''}
${campos.find(x => x.Campo == 'Gênero') ? `<div class="col-sm-12 p-w-md m-t-md text-center">
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
                            </div>` : ''}

${campos.find(x => x.Campo == 'Cônjuge') ? `  <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Cônjuge</h5>

                                <input type="text" class="form-control required" id="equipante-conjuge" data-field="Cônjuge" />
                            </div>` : ''}


${campos.find(x => x.Campo == 'Instagram') ? ` <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Instagram</h5>

                                <input type="text" class="form-control required" id="equipante-instagram" data-field="Apelido" />
                            </div>` : ''}

     ${campos.find(x => x.Campo == 'Camisa') ? `        <div class="col-sm-12 p-w-md m-t-md text-center">
                            <h5>Tamanho da Camisa</h5>

                            <select class="form-control" id="equipante-camisa">
 <option value="8">8</option>
                                    <option value="10">10</option>
                                    <option value="12">12</option>
                                    <option value="14">14</option>
                                <option value="PP">PP</option>
                                <option value="P">P</option>
                                <option value="M">M</option>
                                <option value="G">G</option>
                                <option value="GG">GG</option>
                                <option value="XGG">XGG</option>
                            </select>
                        </div>` : ''}

${campos.find(x => x.Campo == 'Endereço') ? `<div class="col-sm-3 p-w-md m-t-md text-center">
                                <h5>CEP</h5>

                                <input type="text" class="form-control required cep" id="equipante-cep" data-field="CEP" onkeyup="verificaCep(this)" />
                                <input type="hidden" id="equipante-latitude" />
                                <input type="hidden" id="equipante-longitude" />
                            </div>

                            <div class="col-sm-9 p-w-md m-t-md text-center">
                                <h5>Logradouro</h5>

                                <input type="text" class="form-control required" disabled id="equipante-logradouro" data-field="Logradouro" />
                            </div>

                            <div class="col-sm-5 p-w-md m-t-md text-center">
                                <h5>Bairro</h5>

                                <input type="text" class="form-control required" disabled id="equipante-bairro" data-field="Bairro" />
                            </div>

                            <div class="col-sm-5 p-w-md m-t-md text-center">
                                <h5>
                                    Cidade
                                </h5>

                                <input type="text" class="form-control required" disabled id="equipante-cidade" data-field="Cidade" />
                            </div>

                            <div class="col-sm-2 p-w-md m-t-md text-center">
                                <h5>
                                    Estado
                                </h5>

                                <input type="text" class="form-control required" disabled id="equipante-estado" data-field="Estado" />
                            </div>

                            <div class="col-sm-4 p-w-md m-t-md text-center">
                                <h5>
                                    Número
                                </h5>

                                <input type="text" class="form-control" id="equipante-numero" data-field="Número" />
                            </div>


                            <div class="col-sm-8 p-w-md m-t-md text-center">
                                <h5>
                                    Complemento
                                </h5>

                                <input type="text" class="form-control" id="equipante-complemento" data-field="Complemento" />
                            </div>


                            <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>
                                    Ponto de Referência
                                </h5>

                                <input type="text" class="form-control" id="equipante-referencia" data-field="Ponto de Referência" />
                            </div>

                            <div class="col-sm-12 p-w-md m-t-md text-center div-map" style="display: none">
                                <div id="map" style="height:300px;">
                                </div>
                            </div>` : ''}

${campos.find(x => x.Campo == 'Dados da Mãe') ? ` <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Nome da Mãe</h5>

                                <input type="text" class="form-control required" id="equipante-nomemae" data-field="Nome da Mã" />
                            </div>
                            <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Fone da Mãe</h5>

                                <input type="text" class="form-control fone" id="equipante-fonemae" data-field="Fone da Mãe" placeholder="+55 (81) 9999-9999" />
                            </div>` : ''}

${campos.find(x => x.Campo == 'Dados do Pai') ? `<div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Nome do Pai</h5>

                                <input type="text" class="form-control required" id="equipante-nomepai" data-field="Nome do Pai" />
                            </div>
                            <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Fone do Pai</h5>

                                <input type="text" class="form-control fone" id="equipante-fonepai" data-field="Fone do Pai" placeholder="+55 (81) 9999-9999" />
                            </div>` : ''}

${campos.find(x => x.Campo == 'Dados do Contato') ? ` <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Pessoa de Contato</h5>

                                <input type="text" class="form-control required" id="equipante-nomecontato" data-field="Pessoa de Contato" />
                            </div>
                            <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Fone do Contato</h5>

                                <input type="text" class="form-control fone" id="equipante-fonecontato" data-field="Fone do Contato" placeholder="+55 (81) 9999-9999" />
                            </div>` : ''}

${campos.find(x => x.Campo == 'Dados do Convite') ? `<div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Pessoa que Convidou</h5>

                                <input type="text" class="form-control required" id="equipante-nomeconvite" data-field="Pessoa de Convite" />
                            </div>
                            <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Fone de quem convidou</h5>

                                <input type="text" class="form-control fone" id="equipante-foneconvite" data-field="Fone do Convite" placeholder="+55 (81) 9999-9999" />
                            </div>` : ''}

${campos.find(x => x.Campo == 'Parente') ? ` <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Tem algum Parente fazendo o ${$('#equipante-eventoid option:selected').text()}?</h5>

                                <div class="radio i-checks-green inline"><label> <input type="radio" id="has-parente" value="true" name="equipante-hasparente"> <i></i> Sim </label></div>
                                <div class="radio i-checks-green inline"><label> <input type="radio" id="not-parente" checked="" value="false" name="equipante-hasparente"> <i></i> Não </label></div>

                                <div class="parente d-none">
                                    <h5>Nome do Parente</h5>
                                    <input type="text" class="form-control" id="equipante-parente" data-field="Nome do Parente" />
                                </div>
                            </div>` : ''}

${campos.find(x => x.Campo == 'Congregação') ? `<div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Participa de qual Congregação?</h5>
                                <div class="radio i-checks-green inline"><label> <input type="radio" id="trindade" value="Trindade" name="equipante-congregacao"> <i></i> Trindade </label></div>
                                <div class="radio i-checks-green inline"><label> <input type="radio" id="recon" checked="" value="Recon" name="equipante-congregacao"> <i></i> Reconciliação </label></div>
                                <div class="radio i-checks-green inline"><label> <input type="radio" id="outra" checked="" value="Outra" name="equipante-congregacao"> <i></i> Outra </label></div>

                                <div class="congregacao d-none">
                                    <h5>Qual?</h5>
                                    <input type="text" class="form-control" id="equipante-congregacaodescricao" data-field="Congregação" />
                                </div>
                            </div>` : ''}

${campos.find(x => x.Campo == 'Convênio') ? ` <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Possui convênio médico?</h5>

                                <div class="radio i-checks-green inline"><label> <input type="radio" id="has-convenio" value="true" name="equipante-hasconvenio"> <i></i> Sim </label></div>
                                <div class="radio i-checks-green inline"><label> <input type="radio" id="not-convenio" checked="" value="false" name="equipante-hasconvenio"> <i></i> Não </label></div>

                                <div class="convenio d-none">
                                    <h5>Qual?</h5>
                                    <input type="text" class="form-control" id="equipante-convenio" data-field="Convênio" />
                     <h5>Quais hospitais atendem?</h5>
                                <input type="text" class="form-control" id="equipante-hospitais" data-field="Hospitais" />
                                </div>
                            </div>` : ''}

${campos.find(x => x.Campo == 'Medicação') ? ` <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Toma alguma medicação?</h5>

                                <div class="radio i-checks-green inline"><label> <input type="radio" id="has-medicacao" value="true" name="equipante-hasmedicacao"> <i></i> Sim </label></div>
                                <div class="radio i-checks-green inline"><label> <input type="radio" id="not-medicacao" checked="" value="false" name="equipante-hasmedicacao"> <i></i> Não </label></div>

                                <div class="medicacao d-none">
                                    <h5>Qual?</h5>
                                    <input type="text" class="form-control" id="equipante-medicacao" data-field="Medicação" />
                                </div>
                            </div>` : ''}

${campos.find(x => x.Campo == 'Alergia') ? `<div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Tem alguma alergia?</h5>

                                <div class="radio i-checks-green inline"><label> <input type="radio" id="has-alergia" value="true" name="equipante-hasalergia"> <i></i> Sim </label></div>
                                <div class="radio i-checks-green inline"><label> <input type="radio" id="not-alergia" checked="" value="false" name="equipante-hasalergia"> <i></i> Não </label></div>

                                <div class="alergia d-none">
                                    <h5>Qual?</h5>
                                    <input type="text" class="form-control" id="equipante-alergia" data-field="Alergia" />
                                </div>
                            </div>` : ''}

${campos.find(x => x.Campo == 'Restrição Alimentar') ? `<div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Tem alguma restrição alimentar?</h5>

                                <div class="radio i-checks-green inline"><label> <input type="radio" id="has-restricaoalimentar" value="true" name="equipante-hasrestricaoalimentar"> <i></i> Sim </label></div>
                                <div class="radio i-checks-green inline"><label> <input type="radio" id="not-restricaoalimentar" checked="" value="false" name="equipante-hasrestricaoalimentar"> <i></i> Não </label></div>

                                <div class="restricaoalimentar d-none">
                                    <h5>Qual?</h5>
                                    <input type="text" class="form-control" id="equipante-restricaoalimentar" data-field="Restrição Alimentar" />
                                </div>
                            </div>` : ''}
`)


            initInputs()



            if ($('#map').length > 0) {

                map = initMap('map')
                markerLayer = createMarkerLayer(map)


            }

        }
    });
}

$("*[id*='eventoid']").change(function () {
    loadCampos(this.value)
})



function montarMapa() {
    markerLayer.getLayers().forEach(mark => mark.remove())
    var marker = L.marker([$(`#equipante-latitude`).val().toString(), $(`#equipante-longitude`).val().toString()], { icon: getIcon('vermelho') }).addTo(markerLayer);
    marker.bindPopup(`<h4>${$(`#equipante-nome`).val()}</h4>`).openPopup();
    $('.div-map').css('display', 'block')
    map.setView([$(`#equipante-latitude`).val(), $(`#equipante-longitude`).val()], 18);
}

function verificaCep(input) {
    let cep = $(input).val()
    if (cep.length == 9) {
        $.ajax({
            url: `https://api.iecbeventos.com.br/cep/${cep.replaceAll('-', '')}`,
            datatype: "json",
            type: "GET",
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                $(`#equipante-logradouro`).val(data.logradouro)
                $(`#equipante-bairro`).val(data.bairro)
                $(`#equipante-cidade`).val(data.localidade)
                $(`#equipante-estado`).val(data.uf)
                $(`#equipante-latitude`).val(data.lat)
                $(`#equipante-longitude`).val(data.lon)
                montarMapa()
            }
        })
    }
}