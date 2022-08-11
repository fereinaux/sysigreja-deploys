var realista = {}
var selected = false
eventoId = 0
let table
let map, markerLayer
function CarregarTabelaParticipante(callbackFunction) {
    $('#btn_bulk').css('display', 'none')
    if ($("#participante-eventoid").val() != eventoId) {
        $.ajax({
            url: '/Participante/GetPadrinhos',
            data: { eventoId: $("#participante-eventoid").val() },
            datatype: "json",
            type: "GET",
            success: (result) => {
                eventoId = $("#participante-eventoid").val()
                $("#participante-padrinhoid").html(`
${result.Padrinhos.map(p => `<option value=${p.Id}>${p.Nome}</option>`)}
`)
                $("#participante-padrinhoid").select2()
            }
        });

        $.ajax({
            url: '/Circulo/GetCirculos',
            data: { eventoId: $("#participante-eventoid").val() },
            datatype: "json",
            type: "POST",
            success: (result) => {
                eventoId = $("#participante-eventoid").val()
                $("#participante-circuloid").html(`
${result.data.map(p => `<option value=${p.Id}>${p.Titulo || p.Cor}</option>`)}
`)
                $("#participante-circuloid").select2()
            }
        });

        $.ajax({
            url: '/Etiqueta/GetEtiquetasByEventoId',
            data: { eventoId: $("#participante-eventoid").val() },
            datatype: "json",
            type: "POST",
            success: (result) => {
                eventoId = $("#participante-eventoid").val()
                $("#participante-marcadores").html(`
${result.data.map(p => `<option value=${p.Id}>${p.Nome}</option>`)}
`)
                $("#participante-nao-marcadores").html(`
${result.data.map(p => `<option value=${p.Id}>${p.Nome}</option>`)}
`)
                $('#participante-marcadores').select2();
                $('#participante-nao-marcadores').select2();
                $('#participante-status').select2();

            }
        });
    }



    const tableParticipanteConfig = {
        language: languageConfig,
        searchDelay: 750,
        lengthMenu: [10, 30, 50, 100, 200],
        colReorder: false,
        serverSide: true,
        scrollX: true,
        scrollXollapse: true,
        deferloading: 0,
        orderCellsTop: true,
        fixedHeader: true,
        filter: true,
        orderMulti: false,
        responsive: true, stateSave: true,
        destroy: true,
        dom: domConfig,
        buttons: getButtonsConfig(`Participantes ${$("#participante-eventoid option:selected").text()}`),
        columns: [
            {
                data: "Id", name: "Id", orderable: false, width: "2%",
                "render": function (data, type, row) {
                    return (row.Status != Cancelado && row.Status != Espera) ? GetCheckBox(data, row.Presenca) : '';
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
                    return `<span style = "font-size:18px;color:${cor};" class="p-l-xs pointer"> <i class="fa ${icon}" aria-hidden="true" title="${data}"></i></span >`;
                }
            },
            {
                data: "Nome", name: "Nome", width: "25%", render: function (data, type, row) {
                    return `<div>
${row.Circulo ? `<span style="background-color:${GetCor(row.Circulo)}" class="dot"></span>` : ""}
                        <span>${row.Nome}</br></span>
                        ${row.Etiquetas.map(etiqueta => `<span  class="badge m-r-xs" style="background-color:${etiqueta.Cor};color:#fff">${etiqueta.Nome}</span>`).join().replace(/,/g, '')}
                    </div>`
                }
            },
            { data: "Idade", name: "Idade", width: "5%", },
            { data: "Padrinho", name: "Padrinho", width: "25%" },
            {
                data: "Status", name: "Status", width: "5%", render: function (data, type, row) {
                    if (row.Checkin) {
                        data = "Presente";
                        cor = "warning";
                    }
                    else if (data === Confirmado)
                        cor = "primary";
                    else if (data === Cancelado)
                        cor = "danger";
                    else if (data === Inscrito)
                        cor = "success";
                    else if (data === Espera)
                        cor = "default";
                    return `<span style="font-size:13px" class="text-center label label-${cor}">${data}</span>`;
                }
            },

            {
                data: "Id", name: "Id", orderable: false, width: "25%",
                "render": function (data, type, row) {
                    return row.Status != Cancelado && row.Status != Espera ?

                        `<form enctype="multipart/form-data" id="frm-vacina${data}" method="post" novalidate="novalidate">
${GetButton('Pagamentos', JSON.stringify(row), 'verde', 'far fa-money-bill-alt', 'Pagamentos')}
                        ${!row.HasVacina ? ` <label for="arquivo${data}" class="inputFile">
                                <span style="font-size:18px" class="text-mutted pointer p-l-xs"><i class="fa fa-syringe" aria-hidden="true" title="Vacina"></i></span>
                                <input onchange='PostVacina(${data},${JSON.stringify(row)})' style="display: none;" class="custom-file-input inputFile" id="arquivo${data}" name="arquivo${data}" type="file" value="">
                            </label>`: `<span style="font-size:18px" class="text-success p-l-xs pointer" onclick="toggleVacina(${data})"><i class="fa fa-syringe" aria-hidden="true" title="Vacina"></i></span>`}                        
                        ${!row.HasFoto ? ` <label for="foto${data}" class="inputFile">
                                <span style="font-size:18px" class="text-mutted pointer p-l-xs"><i class="fa fa-camera" aria-hidden="true" title="Foto"></i></span>
                                <input accept="image/*" onchange='Foto(${JSON.stringify(row)})' style="display: none;" class="custom-file-input inputFile" id="foto${data}" name="foto${data}" type="file" value="">
                            </label>`: `<span style="font-size:18px" class="text-success p-l-xs pointer" onclick="toggleFoto(${data})"><i class="fa fa-camera" aria-hidden="true" title="Foto"></i></span>`
                        }
                            ${GetAnexosButton('Anexos', data, row.QtdAnexos)}
                            ${GetIconWhatsApp(row.Fone)}
                            ${GetButton('EditParticipante', data, 'blue', 'fa-edit', 'Editar')}      
                         
                            ${GetButton('Opcoes', JSON.stringify(row), 'cinza', 'fas fa-info-circle', 'Opções')}
                            
                            ${$("#participante-eventoid option:selected").data('status') == 'Encerrado' ? `<a target="_blank" href='${GetLinkWhatsApp(row.Fone, `Olá *${row.Nome}*,

Você gostaria de trabalhar no próximo Realidade de 25 a 27 de Março nossa primeira reunião será na quarta feira (16/02) às 19h30 na *Catedral da Trindade*.

Esse convite é pessoal e *intransferível*.

Carol Bastos.`)}' style="font-size:18px; color:#23c6c8; " class="pointer p-l-xs"><i class="fas fa-envelope" aria-hidden="true" title="${row.Fone}"></i></a>
${GetButton('MakeEquipante', data, 'green', 'fa-broom', 'Equipante')}
` : ''}

                            ${GetButton('CancelarInscricao', JSON.stringify(row), 'red', 'fa-times', 'Cancelar Inscrição')}
                    </form>`
                        : `${isAdm ? ` ${GetLabel('AtivarInscricao', JSON.stringify(row), 'green', 'Ativar Inscrição')}
${row.Status == Cancelado ? GetLabel('DeletarInscricao', JSON.stringify(row), 'red', 'Deletar Inscrição') : ''}` : ''}`


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
            url: '/Participante/GetParticipantesDatatable',
            data: getFiltros(),
            datatype: "json",
            type: "POST"
        }
    };

    tableParticipanteConfig.buttons.forEach(function (o) {
        if (o.extend === "excel") {

            o.action = function (e, dt, button, config) {
                var div = document.createElement("div");
                selected = false
                first = false
                div.innerHTML = `<div class="checkbox i-checks-green"  style="margin-left:20px;text-align:left">
<label style="display:block"> <input id="select-all" type="checkbox" onChange="selectAll()" value="all"> Selecionar Todos <i></i></label>
<label style="display:block"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Nome"> Nome <i></i></label>
<label style="display:block"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Apelido"> Apelido <i></i></label>
<label style="display:block"> <input id="campos-excel" class="campos-excel" type="checkbox" value="DataNascimento"> Data de Nascimento <i></i></label>
<label style="display:block"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Idade"> Idade <i></i></label>
<label style="display:block"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Sexo"> Sexo <i></i></label>
<label style="display:block"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Email"> Email <i></i></label>
<label style="display:block"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Fone"> Fone <i></i></label>
<label style="display:block"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Conjuge"> Cônjuge <i></i></label>
<label style="display:block"> <input id="campos-excel" class="campos-excel" type="checkbox" value="CEP"> CEP <i></i></label>
<label style="display:block"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Logradouro"> Logradouro <i></i></label>
<label style="display:block"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Bairro"> Bairro <i></i></label>
<label style="display:block"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Cidade"> Cidade <i></i></label>
<label style="display:block"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Estado"> Estado <i></i></label>
<label style="display:block"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Numero"> Número <i></i></label>
<label style="display:block"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Complemento"> Complemento <i></i></label>
<label style="display:block"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Referencia"> Referência <i></i></label>
<label style="display:block"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Parente"> Parente <i></i></label>
<label style="display:block"> <input id="campos-excel" class="campos-excel" type="checkbox" value="NomeContato"> Nome do Contato <i></i></label>
<label style="display:block"> <input id="campos-excel" class="campos-excel" type="checkbox" value="FoneContato"> Fone do Contato <i></i></label>
<label style="display:block"> <input id="campos-excel" class="campos-excel" type="checkbox" value="NomeConvite"> Nome de quem Convidou <i></i></label>
<label style="display:block"> <input id="campos-excel" class="campos-excel" type="checkbox" value="FoneConvite"> Fone de quem Convidou <i></i></label>
<label style="display:block"> <input id="campos-excel" class="campos-excel" type="checkbox" value="RestricaoAlimentar"> Restrição Alimentar <i></i></label>
<label style="display:block"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Situacao"> Situação <i></i></label>
<label style="display:block"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Circulo"> Círculo <i></i></label>
<label style="display:block"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Motorista"> Motorista <i></i></label>
<label style="display:block"> <input id="campos-excel" class="campos-excel" type="checkbox" value="HasVacina"> Vacina <i></i></label>
    </div>`;
                CustomSwal({
                    title: "Excel de Participantes",
                    icon: "info",
                    text: "Escolha os campos que deseja exportar",
                    content: div,
                    className: "button-center",
                    dangerMode: true,
                    buttons: {
                        export: {
                            text: "Exportar",
                            value: "export",
                            className: "btn-primary w-150 btn-all"
                        }
                    }
                }).then(res => {
                    if (res) {
                        const data = tableParticipanteConfig.ajax.data
                        data.campos = $('#campos-excel:checked').map(function () {
                            return $(this).val();
                        }).get().join();
                        $.post(
                            tableParticipanteConfig.ajax.url + "?extract=excel",
                            data,
                            function (o) {
                                window.location = `/Participante/DownloadTempFile?fileName=Participantes ${$("#participante-eventoid option:selected").text()}.xlsx&g=` + o;
                            }
                        );
                    };
                })
            }
        }
    });

    table = $("#table-participante").DataTable(tableParticipanteConfig);
}

function ConfirmFoto() {

    $("#main-cropper")
        .croppie("result", {
            type: "canvas",
            size: { height: 750, width: 500 }
        })
        .then(function (resp) {
            var dataToPost = new FormData();
            dataToPost.set('ParticipanteId', realista.Id)
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
                        CarregarTabelaParticipante()

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
            url: '/Arquivo/GetArquivosParticipante',
            data: { participanteid: id ? id : $("#ParticipanteIdModal").val() },
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


function PostVacina(id, realista) {
    var dataToPost = new FormData($(`#frm-vacina${id}`)[0]);
    dataToPost.set('ParticipanteId', id)
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
                $.ajax(
                    {
                        datatype: "json",
                        type: "POST",
                        contentType: 'application/json; charset=utf-8',
                        url: "Participante/ToggleVacina",
                        data: JSON.stringify(
                            {
                                Id: id
                            }),

                        success: function () {
                            CarregarTabelaParticipante()

                        }
                    });

            }
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
                    url: "Arquivo/DeleteFotoParticipante",
                    data: JSON.stringify(
                        {
                            Id: id
                        }),

                    success: function () {
                        CarregarTabelaParticipante()

                    }
                });
        }
    }
    )
}


function MakeEquipante(id) {
    ConfirmMessage("Transformar em Equipante?").then((result) => {
        if (result) {
            $.ajax(
                {
                    datatype: "json",
                    type: "POST",
                    contentType: 'application/json; charset=utf-8',
                    url: "Participante/MakeEquipante",
                    data: JSON.stringify(
                        {
                            Id: id
                        }),

                    success: function () {


                    }
                });
        }
    })
}


function toggleVacina(id) {
    ConfirmMessage("Essa ação removerá a vacina, deseja continuar?").then((result) => {
        $.ajax(
            {
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                url: "Participante/ToggleVacina",
                data: JSON.stringify(
                    {
                        Id: id
                    }),

                success: function () {
                    CarregarTabelaParticipante()

                }
            });
    })
}

function PostArquivo() {

    var dataToPost = new FormData($('#frm-upload-arquivo-modal')[0]);
    var filename = dataToPost.get('arquivo-modal').name
    var arquivo = new File([dataToPost.get('arquivo-modal')], 'Pagamento ' + realista.Nome + filename.substr(filename.indexOf('.')));
    dataToPost.set('Arquivo', arquivo)
    dataToPost.set('ParticipanteId', dataToPost.get('ParticipanteIdModal'))
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

function Anexos(id) {
    $("#ParticipanteIdModal").val(id);
    $("#LancamentoIdModal").val('');
    GetAnexos(id);
    $("#modal-anexos").modal();
}

function AnexosLancamento(row) {
    $("#LancamentoIdModal").val(row.Id);
    $("#ParticipanteIdModal").val(row.ParticipanteId);
    GetAnexosLancamento(row.Id)
    $("#modal-pagamentos").modal('hide');
    $("#modal-anexos").modal();
}


$("#arquivo-modal").change(function () {
    PostArquivo();
});

$("#modal-anexos").on('hidden.bs.modal', function () {
    CarregarTabelaParticipante()
});

var tipoGlobal = 'pagamento'
$(`.${tipoGlobal}`).addClass('moldura-modal')
var destinatarioGlobal = 'realista'
$(`.${destinatarioGlobal}`).addClass('moldura-modal')

function enviar() {
    if (getNome(destinatarioGlobal)) {

        var windowReference = window.open('_blank');
        $.ajax({
            url: "/Mensagem/GetMensagem/",
            data: { Id: $("#msg-list").val() },
            datatype: "json",
            type: "GET",
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                var text = data.Mensagem.Conteudo.replaceAll('${Nome Contato}', getNome(destinatarioGlobal)).replaceAll('${Nome Participante}', getNome('realista'));
                windowReference.location = GetLinkWhatsApp(getTelefone(destinatarioGlobal), text)

            }
        });
    } else {
        ErrorMessage('Você deve escolher o destinatário da mensagem')

    }


}

//function enviar() {
//    var text = ''
//    switch (tipoGlobal) {
//        case 'covid':
//            text = `Olá, *${getNome(destinatarioGlobal)}*!

//Estou vendo aqui que a inscrição de *${getNome('realista')}* para o *Realidade* já foi paga e sua vaga está garantida, sendo assim, tenho uns avisos:

//Tendo em vista a situação do novo Coronavírus e os decretos do governo do estado, a realização e apresentação do resultado do RT-PCR ou Teste Rápido é OPCIONAL , mas ainda fica obrigatório a apresentação do Cartão de Vacinação do participante com pelo menos 2 doses da vacina.

//- Caso vá realizar o exeme, a realização do RT-PCR deverá ser feita em até 48h antes do dia do evento (a partir do dia 23/03). Já o Teste Rápido deverá ser realizado em até 24h antes do dia do evento (a partir do dia 24/03). O resultado deve ser NEGATIVO e apresentado no dia do evento ou enviado previamente.

//- Caso o resultado do participante dê *POSITIVO*, o valor do evento será reembolsado.

//${RodapeEvento($("#participante-eventoid option:selected").text())}`
//            break;
//        case 'pagamento':
//            text = `Olá, *${getNome(destinatarioGlobal)}*!

//Estamos com a inscrição de *${getNome('realista')}* para o Realidade, cursilho para jovens da IECB Catedral da Trindade. Porém, para confirmá-la é preciso efetuar o pagamento.

//Como ainda estamos em pandemia, precisamos tomar um cuidado extra e por isso teremos *apenas 100 vagas*;

//O investimento está custando *R$ 300,00*, e poderá ser feito através do PIX (celular): 81996557814, cartão ou dinheiro. *A secretaria estará na frente da livraria após os cultos das quartas e domingos para recebê-lo(a).*

//No caso do PIX, lembra de enviar o comprovante de pagamento para mim! 

//*Corre para garantir tua vaga!*  🥳

//${RodapeEvento($("#participante-eventoid option:selected").text())}`
//            break;
//        case 'info':
//            text = `Olá, *${getNome(destinatarioGlobal)}*!

//Seguem AVISOS IMPORTANTES sobre o Realidade:

//PAIS, LEIAM COM ATENÇÃO

//• O Realidade começará as 19h da sexta-feira dia 25 e se encerrará às 18h do dia 27 de março. 🥳

//• Onde será:📍
//Colonial Aldeia, Km 11,5
//R. Sete de Setembro - Aldeia dos Camarás
//https://goo.gl/maps/ZYcmct2f4jrMa1bw9

//• Na mala, coloque máscaras suficientes para troca durante o dia, pois o uso será obrigatório durante todo o evento. 😷

//• Levar roupa de cama e banho, produtos de higiene pessoal 🧼 e medicações, caso o adolescente faça uso.💊

//• O nosso plenário é bem frio então sugerimos levar casaco. 🧥

//• Os quartos serão divididos com outras 5 pessoas, respeitando o distanciamento durante as dormidas.

//⚠️⚠️⚠️
//* Vocês precisarão providenciar mensagens, escritas ou impressas, de amigos próximos e da família*

//Estaremos recebendo as mensagens no sábado do evento das 8h30 até as 12h30 na Catedral da Trindade, Rua Carneiro Vilela 569.

//VOCÊ JÁ FEZ CURSILHO OU REALIDADE?
//Se sim, me confirme por mensagem!!

//${RodapeEvento($("#participante-eventoid option:selected").text())}`
//            break;
//        case 'carta':
//            text = `Ficamos felizes por você ter participado de um dos nossos Cursilhos e temos um convite a lhe fazer! 😍

//Temos um momento no Realidade que se parece muito com a Mañanitas, é a nossa Noitita que acontece no sábado à noite, a partir das 17h.

//Então você e outras pessoas próximas do/da realista que já participaram de algum Cursilho/Realidade são muito bem-vindos.

//É um momento muito especial onde demonstramos a importância de ser parte do corpo de Cristo para eles!

//Lembramos que esse não é um momento entre família e filhos e sim um momento de CURSILHISTAS com os REALISTAS

//Para participar da nossa Noitita, pedimos que siga algumas orientações:

//- Use máscara  durante todo o momento e respeite o distanciamento orientado pela nossa equipe.

//- Caso você esteja com sintomas de gripe, pedimos que não compareça, para sua segurança e a nossa.
//(teremos mais de 200 adolescente entre participantes e equipe de trabalho na bolha do Realidade.)

//Pode ficar tranquilo  que seu realista vai receber todo o amor e cuidado que o momento sugere.


//Te esperamos lá! 🥰
//*Equipe da Secretaria | ${$("#participante-eventoid option:selected").text()}*`
//            break;
//        case 'foto':
//            text = `Oi, *${getNome('realista')}*! Como estão as expectativas para o Realidade? Espero que boas! 🥳

//Somos da secretaria do Realidade e devido a pandemia e ao uso obrigatório da máscara no evento, vamos precisar de uma foto sua para o seu crachá de identificação.

//Orientações:

//1. Foto estilo retrato
//2. Formato vertical
//3. Sem óculos de sol ou máscara

//Escolhe e me manda o mais rápido possível.

//${RodapeEvento($("#participante-eventoid option:selected").text())}`
//            break;
//        default:
//            break;
//    }

//    window.open(GetLinkWhatsApp(getTelefone(tipoGlobal == 'foto' ? 'realista' : destinatarioGlobal), text), '_blank').focus();

//}




function select1(tipo) {
    $('.covid').removeClass('moldura-modal')
    $('.pagamento').removeClass('moldura-modal')
    $('.carta').removeClass('moldura-modal')
    $('.info').removeClass('moldura-modal')
    tipoGlobal = tipo
    $(`.${tipo}`).addClass('moldura-modal')
}

function select2(destinatario) {
    $('.realista').removeClass('moldura-modal')
    $('.mae').removeClass('moldura-modal')
    $('.pai').removeClass('moldura-modal')
    $('.convite').removeClass('moldura-modal')
    $('.contato').removeClass('moldura-modal')
    $('.realista').removeClass('moldura-modal')
    destinatarioGlobal = destinatario
    $(`.${destinatario}`).addClass('moldura-modal')
    $('.btn-ligar').attr("href", `tel:${getTelefone(destinatario)}`)
    getMensagensByTipo(destinatario == 'realista' ? ["Participante"] : ['Contato'])
}


function getNome(destinatario) {
    switch (destinatario) {
        case 'realista':
            return realista.Nome.trim()
            break;
        case 'mae':
            return realista.NomeMae.trim()
            break;
        case 'pai':
            return realista.NomePai.trim()
            break;
        case 'convite':
            return realista.NomeConvite.trim()
            break;
        case 'contato':
            return realista.NomeContato.trim()
            break;
        default:
            break;
    }
}

function getTelefone(destinatario) {
    switch (destinatario) {
        case 'realista':
            return realista.Fone
            break;
        case 'mae':
            return realista.FoneMae
            break;
        case 'pai':
            return realista.FonePai
            break;
        case 'convite':
            return realista.FoneConvite
            break;
        case 'contato':
            return realista.FoneContato
            break;
        default:
            break;
    }
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
                            ${GetButton('DeletePagamento', data, 'red', 'fa-trash', 'Excluir')}`;
                }
            }
        ],
        order: [
            [0, "asc"]
        ],
        ajax: {
            url: '/Lancamento/GetPagamentos',
            data: { ParticipanteId: id },
            datatype: "json",
            type: "POST"
        }
    };
    $("#table-pagamentos").DataTable(tablePagamentosConfig);
}

$(document).ready(function () {
    HideMenu()
    CarregarTabelaParticipante();
    loadCampos($("[id$='eventoid']").val());

});


function Pagamentos(row) {
    realista = row;
    $("#pagamentos-whatsapp").val(row.Fone);
    $("#pagamentos-valor").val($("#pagamentos-valor").data("valor-realista"));
    $("#pagamentos-origem").val('')
    $("#pagamentos-data").val(moment().format('DD/MM/YYYY'));
    $("#pagamentos-participanteid").val(row.Id);
    $("#pagamentos-meiopagamento").val($("#pagamentos-meiopagamento option:first").val());
    CarregarTabelaPagamentos(row.Id);
    $("#modal-pagamentos").modal();
}

$("#modal-pagamentos").on('hidden.bs.modal', function () {
    if (!$('#LancamentoIdModal').val()) {
        CarregarTabelaParticipante();
    }
})

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
                    CarregarTabelaPagamentos($("#pagamentos-participanteid").val());
                }
            });
        }
    });
}

function ToggleSexo(id) {
    ConfirmMessage("Confirma a mudança de gênero?").then((result) => {
        if (result) {
            $.ajax({
                url: "/Participante/ToggleSexo/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: id
                    }),
                success: function () {
                    SuccessMesageOperation();
                    CarregarTabelaParticipante();
                }
            });
        }
    });
}

function CancelarInscricao(row) {
    ConfirmMessageCancelar(row.Nome).then((result) => {
        if (result) {
            $.ajax({
                url: "/Participante/CancelarInscricao/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: row.Id
                    }),
                success: function () {
                    SuccessMesageOperation();
                    CarregarTabelaParticipante();
                }
            });
        }
    });
}


function DeletarInscricao(row) {
    ConfirmMessage(`Deseja deletar permanentemente a inscrição de ${row.Nome}?`).then((result) => {
        if (result) {
            $.ajax({
                url: "/Participante/DeletarInscricao/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: row.Id
                    }),
                success: function () {
                    SuccessMesageOperation();
                    CarregarTabelaParticipante();
                }
            });
        }
    });
}

function AtivarInscricao(row) {
    ConfirmMessage(`Deseja ativar a inscrição de ${row.Nome}?`).then((result) => {
        if (result) {
            $.ajax({
                url: "/Participante/AtivarInscricao/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: row.Id
                    }),
                success: function () {
                    SuccessMesageOperation();
                    CarregarTabelaParticipante();
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
                    Origem: $("#pagamentos-origem").val(),
                    EventoId: $("#participante-eventoid").val(),
                    ParticipanteId: $("#pagamentos-participanteid").val(),
                    Data: moment($("#pagamentos-data").val(), 'DD/MM/YYYY', 'pt-br').toJSON(),
                    MeioPagamentoId: $("#pagamentos-meiopagamento").val(),
                    ContaBancariaId: $('.contabancaria').hasClass('d-none') ? 0 : $("#pagamentos-contabancaria").val(),
                    Valor: Number($("#pagamentos-valor").val())
                }),
            success: function () {
                $("#pagamentos-origem").val('')
                $("#pagamentos-data").val(moment().format('DD/MM/YYYY'));
                CarregarTabelaPagamentos($("#pagamentos-participanteid").val());
                SuccessMesageOperation();
            }
        });
    }
}

function getMensagensByTipo(tipos) {
    $.ajax({
        url: "/Mensagem/GetMensagensByTipo/",
        data: JSON.stringify({ eventoId: $("#participante-eventoid").val(), tipos: tipos }),
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        success: function (dataMsg) {
            $("#msg-list").html(`
${dataMsg.data.map(p => `<option value=${p.Id}>${p.Titulo}</option>`)}
`)

        }
    })
}

function Opcoes(row) {
    realista = row;
    $('.participante-etiquetas').select2({ dropdownParent: $("#form-opcoes") });
    $.ajax({
        url: "/Participante/GetParticipante/",
        data: { Id: row.Id },
        datatype: "json",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            realista = data.Participante
            select1(realista.Status == 'Inscrito' ? 'pagamento' : 'covid')
            $('.maetext').text(realista.NomeMae)
            $('.realista-nome').text(realista.Nome)
            $('.paitext').text(realista.NomePai)
            $('.convitetext').text(realista.NomeConvite)
            $('.contatotext').text(realista.NomeContato)
            $('#participante-obs').val(realista.Observacao)
            if ($('#modal-opcoes').is(":hidden")) {
                getMensagensByTipo(["Participante"])
            }

            $('#participante-etiquetas').val(data.Participante.Etiquetas.map(etiqueta => etiqueta.Id))
            console.log($('#participante-etiquetas').val());
            $('.participante-etiquetas').select2({ dropdownParent: $("#form-opcoes") });
            if (realista.Status == "Confirmado") {
                $('.pagamento').hide()
            }

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

function GetParticipanteContato(id) {
    $.ajax({
        url: "/Participante/GetParticipante/",
        data: { Id: id },
        datatype: "json",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            $("#participantecontato-id").val(data.Participante.Id);
            $(`#participante-nome`).val(data.Participante.Nome);
            $(`#participante-apelido`).val(data.Participante.Apelido);
            $("#participante-data-nascimento").val(moment(data.Participante.DataNascimento).format('DD/MM/YYYY'));
            $(`#participante-email`).val(data.Participante.Email);
            $(`#participante-fone`).val(data.Participante.Fone);
            $(`#participante-nomepai`).val(data.Participante.NomePai);
            $(`#participante-fonepai`).val(data.Participante.FonePai);
            $(`#participante-nomemae`).val(data.Participante.NomeMae);
            $(`#participante-fonemae`).val(data.Participante.FoneMae);
            $(`#participante-nomeconvite`).val(data.Participante.NomeConvite);
            $(`#participante-foneconvite`).val(data.Participante.FoneConvite);
            $(`#participante-nomecontato`).val(data.Participante.NomeContato);
            $(`#participante-fonecontato`).val(data.Participante.FoneContato);
            $(`#participante-restricaoalimentar`).val(data.Participante.RestricaoAlimentar);
            $(`#participante-medicacao`).val(data.Participante.Medicacao);
            $(`#participante-alergia`).val(data.Participante.Alergia);
            $(`#participante-parente`).val(data.Participante.Parente);
            if (data.Participante.Congregacao == 'Trindade' || data.Participante.Congregacao == 'Recon') {
                $(`input[type=radio][name=participante-congregacao][value='${data.Participante.Congregacao}']`).iCheck('check');
            } else {
                $(`input[type=radio][name=participante-congregacao][value='Outra']`).iCheck('check');
                $(`#participante-congregacaodescricao`).val(data.Participante.Congregacao);
            }
            $(`input[type=radio][name=participante-sexo][value=${data.Participante.Sexo}]`).iCheck('check');
            $(`input[type=radio][name=participante-hasalergia][value=${data.Participante.HasAlergia}]`).iCheck('check');
            $(`input[type=radio][name=participante-hasmedicacao][value=${data.Participante.HasMedicacao}]`).iCheck('check');
            $(`input[type=radio][name=participante-hasrestricaoalimentar][value=${data.Participante.HasRestricaoAlimentar}]`).iCheck('check');

            $("#participante-numeracao").val(data.Participante.Numeracao);
        }
    });
}

function GetParticipante(id) {
    if (id > 0) {
        $.ajax({
            url: "/Participante/GetParticipante/",
            data: { Id: id },
            datatype: "json",
            type: "GET",
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                $("#participante-id").val(data.Participante.Id);
                $(`#participante-nome`).val(data.Participante.Nome);
                $(`#participante-apelido`).val(data.Participante.Apelido);
                $("#participante-data-nascimento").val(moment(data.Participante.DataNascimento).format('DD/MM/YYYY'));
                $(`#participante-email`).val(data.Participante.Email);
                $(`#participante-fone`).val(data.Participante.Fone);
                $(`#participante-nomepai`).val(data.Participante.NomePai);
                $(`#participante-fonepai`).val(data.Participante.FonePai);
                $(`#participante-nomemae`).val(data.Participante.NomeMae);
                $(`#participante-fonemae`).val(data.Participante.FoneMae);
                $(`#participante-nomeconvite`).val(data.Participante.NomeConvite);
                $(`#participante-foneconvite`).val(data.Participante.FoneConvite);
                $(`#participante-nomecontato`).val(data.Participante.NomeContato);
                $(`#participante-fonecontato`).val(data.Participante.FoneContato);
                $(`#participante-restricaoalimentar`).val(data.Participante.RestricaoAlimentar);
                $(`#participante-medicacao`).val(data.Participante.Medicacao);
                $(`#participante-alergia`).val(data.Participante.Alergia);
                $(`#participante-parente`).val(data.Participante.Parente);
                if (data.Participante.Congregacao == 'Trindade' || data.Participante.Congregacao == 'Recon') {
                    $(`input[type=radio][name=participante-congregacao][value='${data.Participante.Congregacao}']`).iCheck('check');
                } else {
                    $(`input[type=radio][name=participante-congregacao][value='Outra']`).iCheck('check');
                    $(`#participante-congregacaodescricao`).val(data.Participante.Congregacao);
                    $('.congregacao').removeClass('d-none');
                    $("#participante-congregacaodescricao").addClass('required');
                }
                $(`input[type=radio][name=participante-sexo][value=${data.Participante.Sexo}]`).iCheck('check');
                $(`input[type=radio][name=participante-hasparente][value=${data.Participante.HasParente}]`).iCheck('check');
                $(`input[type=radio][name=participante-hasalergia][value=${data.Participante.HasAlergia}]`).iCheck('check');
                $(`input[type=radio][name=participante-hasmedicacao][value=${data.Participante.HasMedicacao}]`).iCheck('check');
                $(`input[type=radio][name=participante-hasrestricaoalimentar][value=${data.Participante.HasRestricaoAlimentar}]`).iCheck('check');
                $(`#participante-cep`).val(data.Participante.CEP);
                $(`#participante-logradouro`).val(data.Participante.Logradouro);
                $(`#participante-bairro`).val(data.Participante.Bairro);
                $(`#participante-cidade`).val(data.Participante.Cidade);
                $(`#participante-estado`).val(data.Participante.Estado);
                $(`#participante-numero`).val(data.Participante.Numero);
                $(`#participante-complemento`).val(data.Participante.Complemento);
                $(`#participante-conjuge`).val(data.Participante.Conjuge);
                $(`#participante-referencia`).val(data.Participante.Referencia);

                $(`#participante-latitude`).val((data.Participante.Latitude || '').replaceAll(',', '.'));
                $(`#participante-longitude`).val((data.Participante.Longitude || '').replaceAll(',', '.'));
                if ($('#map').length > 0) {
                    montarMapa()
                }
                $("#participante-numeracao").val(data.Participante.Numeracao);
            }
        });
    }
    else {
        $("#participante-id").val(0);
        $(`#participante-nome`).val("");
        $(`#participante-apelido`).val("");
        $("#participante-data-nascimento").val("");
        $(`#participante-email`).val("");
        $(`#participante-fone`).val("");
        $(`#participante-restricaoalimentar`).val("");
        $(`#participante-medicacao`).val("");
        $(`#participante-alergia`).val("");
        $(`#participante-nomepai`).val("");
        $(`#participante-fonepai`).val("");
        $(`#participante-nomemae`).val("");
        $(`#participante-fonemae`).val("");
        $(`#participante-nomeconvite`).val("");
        $(`#participante-foneconvite`).val("");
        $(`#participante-nomecontato`).val("");
        $(`#participante-fonecontato`).val("");
        $(`#participante-cep`).val("");
        $(`#participante-logradouro`).val("");
        $(`#participante-bairro`).val('');
        $(`#participante-cidade`).val('');
        $(`#participante-estado`).val('');
        $(`#participante-numero`).val('');
        $(`#participante-complemento`).val('');
        $(`#participante-conjuge`).val('');
        $(`#participante-referencia`).val('');
        $(`input[type=radio][name=participante-sexo][value=1]`).iCheck('check');
        $(`input[type=radio][name=participante-hasalergia][value=false]`).iCheck('check');
        $(`input[type=radio][name=participante-congregacao][value='Trindade']`).iCheck('check');
        $(`input[type=radio][name=participante-parente][value=false]`).iCheck('check');
        $(`input[type=radio][name=participante-hasmedicacao][value=false]`).iCheck('check');
        $(`input[type=radio][name=participante-hasrestricaoalimentar][value=false]`).iCheck('check');
    }
}

function EditParticipante(id) {
    GetParticipante(id);
    $("#modal-participantes").modal();
}


function PostParticipante() {
    if (ValidateForm(`#form-participante`)) {
        $.ajax({
            url: "/Inscricoes/PostInscricao/",
            datatype: "json",
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(
                {
                    Id: $("#participante-id").val(),
                    EventoId: $("#participante-eventoid").val(),
                    Nome: $(`#participante-nome`).val(),
                    Apelido: $(`#participante-apelido`).val(),
                    DataNascimento: moment($("#participante-data-nascimento").val(), 'DD/MM/YYYY', 'pt-br').toJSON(),
                    Email: $(`#participante-email`).val(),
                    Fone: $(`#participante-fone`).val(),
                    NomePai: $(`#participante-nomepai`).val(),
                    FonePai: $(`#participante-fonepai`).val(),
                    NomeMae: $(`#participante-nomemae`).val(),
                    FoneMae: $(`#participante-fonemae`).val(),
                    NomeConvite: $(`#participante-nomeconvite`).val(),
                    FoneConvite: $(`#participante-foneconvite`).val(),
                    NomeContato: $(`#participante-nomecontato`).val(),
                    FoneContato: $(`#participante-fonecontato`).val(),
                    CEP: $(`#participante-cep`).val(),
                    Logradouro: $(`#participante-logradouro`).val(),
                    Bairro: $(`#participante-bairro`).val(),
                    Cidade: $(`#participante-cidade`).val(),
                    Estado: $(`#participante-estado`).val(),
                    Numero: $(`#participante-numero`).val(),
                    Complemento: $(`#participante-complemento`).val(),
                    Conjuge: $(`#participante-conjuge`).val(),
                    Referencia: $(`#participante-referencia`).val(),
                    Latitude: $(`#participante-latitude`).val(),
                    Longitude: $(`#participante-longitude`).val(),
                    HasRestricaoAlimentar: $("input[type=radio][name=participante-hasrestricaoalimentar]:checked").val(),
                    RestricaoAlimentar: $(`#participante-restricaoalimentar`).val(),
                    HasMedicacao: $("input[type=radio][name=participante-hasmedicacao]:checked").val(),
                    Medicacao: $(`#participante-medicacao`).val(),
                    HasAlergia: $("input[type=radio][name=participante-hasalergia]:checked").val(),
                    Alergia: $(`#participante-alergia`).val(),
                    HasParente: $("input[type=radio][name=participante-hasparente]:checked").val(),
                    Parente: $(`#participante-parente`).val(),
                    Congregacao: $("input[type=radio][name=participante-congregacao]:checked").val() != "Outra" ? $("input[type=radio][name=participante-congregacao]:checked").val() : $(`#participante-congregacaodescricao`).val(),
                    Sexo: $("input[type=radio][name=participante-sexo]:checked").val()
                }),
            success: function () {
                SuccessMesageOperation();
                CarregarTabelaParticipante();
                $("#modal-participantes").modal("hide");
            }
        });
    }
}



function previous() {
    PostInfo(function () {
        arrayData = table.data().toArray()
        let index = arrayData.findIndex(r => r.Id == realista.Id)
        if (index > 0) {
            Opcoes(arrayData[index - 1])
        }
    })
}

function next() {
    PostInfo(function () {
        arrayData = table.data().toArray()
        let index = arrayData.findIndex(r => r.Id == realista.Id)
        if (index + 1 < arrayData.length) {
            Opcoes(arrayData[index + 1])
        }
    })
}


$("#modal-opcoes").on('hidden.bs.modal', function () {
    PostInfo()
});

function PostInfo(callback) {
    $.ajax({
        url: "/Participante/PostInfo/",
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            {
                Id: realista.Id,
                Observacao: $('#participante-obs').val(),
                MsgVacina: $(`#participante-msgcovid`).prop("checked"),
                MsgPagamento: $(`#participante-msgpagamento`).prop("checked"),
                MsgNoitita: $(`#participante-msgnoitita`).prop("checked"),
                MsgGeral: $(`#participante-msggeral`).prop("checked"),
                MsgFoto: $(`#participante-msgfoto`).prop("checked"),
                Etiquetas: $('.participante-etiquetas').val()
            }),
        success: function () {
            CarregarTabelaParticipante(callback)
        }
    });
}

function montarMapa() {
    markerLayer.getLayers().forEach(mark => mark.remove())
    var marker = L.marker([$(`#participante-latitude`).val().toString(), $(`#participante-longitude`).val().toString()], { icon: getIcon('vermelho') }).addTo(markerLayer);
    marker.bindPopup(`<h4>${$(`#participante-nome`).val()}</h4>`).openPopup();
    $('.div-map').css('display', 'block')
    map.setView([$(`#participante-latitude`).val(), $(`#participante-longitude`).val()], 18);
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
                $(`#participante-logradouro`).val(data.logradouro)
                $(`#participante-bairro`).val(data.bairro)
                $(`#participante-cidade`).val(data.localidade)
                $(`#participante-estado`).val(data.uf)
                $(`#participante-latitude`).val(data.lat)
                $(`#participante-longitude`).val(data.lon)
                montarMapa()
            }
        })
    }
}

function selectAll() {
    selected = !selected
    $('.campos-excel').attr('checked', selected)
}

$('body').on('DOMNodeInserted', '.swal-overlay', function () {
    tippy('.btn-export', {
        content: `Exporta os campos selecionados`,
        interactive: true,
        allowHTML: true,
        zIndex: 10005,
        trigger: 'mouseenter'
    });
});


$("[id$='eventoid']").change(function () {
    loadCampos(this.value)
})


function loadCampos(id) {
    $.ajax({
        url: "/Configuracao/GetCamposByEventoId/",
        data: { Id: id },
        datatype: "json",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            campos = data.Campos
            $('.campos-cadastro').html(`
          <input type="hidden" id="participante-id" />
${campos.find(x => x.Campo == "Nome e Sobrenome") ? `<div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Nome</h5>

                                <input type="text" class="form-control required" id="participante-nome" data-field="Nome" />
                            </div>` : ""}

${campos.find(x => x.Campo == "Apelido") ? ` <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Apelido</h5>

                                <input type="text" class="form-control required" id="participante-apelido" data-field="Apelido" />
                            </div>` : ""}
${campos.find(x => x.Campo == 'Data Nascimento') ? `<div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Data de Nascimento</h5>

                                <input type="text" class="form-control full-date required" id="participante-data-nascimento" data-field="Data de Nascimento" />
                            </div>` : ''}
${campos.find(x => x.Campo == 'Gênero') ? `<div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Sexo</h5>

                                <div class="radio i-checks-green inline"><label> <input type="radio" id="participante-sexo" checked="" value="1" name="participante-sexo"> <i></i> Masculino </label></div>
                                <div class="radio i-checks-green inline"><label> <input type="radio" id="participante-sexo" value="2" name="participante-sexo"> <i></i> Feminino </label></div>
                            </div>` : ''}
${campos.find(x => x.Campo == 'Email') ? `<div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Email</h5>

                                <input type="email" class="form-control" id="participante-email" data-field="Email" />
                            </div>` : ''}

${campos.find(x => x.Campo == 'Fone') ? `  <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>WhatsApp</h5>

                                <input type="text" class="form-control fone" id="participante-fone" data-field="WhatsApp" placeholder="+55 (81) 9999-9999" />
                            </div>` : ''}

${campos.find(x => x.Campo == 'Cônjuge') ? `  <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Cônjuge</h5>

                                <input type="text" class="form-control required" id="participante-conjuge" data-field="Cônjuge" />
                            </div>` : ''}


${campos.find(x => x.Campo == 'Instagram') ? ` <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Instagram</h5>

                                <input type="text" class="form-control required" id="participante-instagram" data-field="Apelido" />
                            </div>` : ''}

${campos.find(x => x.Campo == 'Endereço') ? `<div class="col-sm-3 p-w-md m-t-md text-center">
                                <h5>CEP</h5>

                                <input type="text" class="form-control required cep" id="participante-cep" data-field="CEP" onkeyup="verificaCep(this)" />
                                <input type="hidden" id="participante-latitude" />
                                <input type="hidden" id="participante-longitude" />
                            </div>

                            <div class="col-sm-9 p-w-md m-t-md text-center">
                                <h5>Logradouro</h5>

                                <input type="text" class="form-control required" disabled id="participante-logradouro" data-field="Logradouro" />
                            </div>

                            <div class="col-sm-5 p-w-md m-t-md text-center">
                                <h5>Bairro</h5>

                                <input type="text" class="form-control required" disabled id="participante-bairro" data-field="Bairro" />
                            </div>

                            <div class="col-sm-5 p-w-md m-t-md text-center">
                                <h5>
                                    Cidade
                                </h5>

                                <input type="text" class="form-control required" disabled id="participante-cidade" data-field="Cidade" />
                            </div>

                            <div class="col-sm-2 p-w-md m-t-md text-center">
                                <h5>
                                    Estado
                                </h5>

                                <input type="text" class="form-control required" disabled id="participante-estado" data-field="Estado" />
                            </div>

                            <div class="col-sm-4 p-w-md m-t-md text-center">
                                <h5>
                                    Número
                                </h5>

                                <input type="text" class="form-control" id="participante-numero" data-field="Número" />
                            </div>


                            <div class="col-sm-8 p-w-md m-t-md text-center">
                                <h5>
                                    Complemento
                                </h5>

                                <input type="text" class="form-control" id="participante-complemento" data-field="Complemento" />
                            </div>


                            <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>
                                    Ponto de Referência
                                </h5>

                                <input type="text" class="form-control" id="participante-referencia" data-field="Ponto de Referência" />
                            </div>

                            <div class="col-sm-12 p-w-md m-t-md text-center div-map" style="display: none">
                                <div id="map" style="height:300px;">
                                </div>
                            </div>` : ''}

${campos.find(x => x.Campo == 'Dados da Mãe') ? ` <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Nome da Mãe</h5>

                                <input type="text" class="form-control required" id="participante-nomemae" data-field="Nome da Mã" />
                            </div>
                            <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Fone da Mãe</h5>

                                <input type="text" class="form-control fone" id="participante-fonemae" data-field="Fone da Mãe" placeholder="+55 (81) 9999-9999" />
                            </div>` : ''}

${campos.find(x => x.Campo == 'Dados do Pai') ? `<div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Nome do Pai</h5>

                                <input type="text" class="form-control required" id="participante-nomepai" data-field="Nome do Pai" />
                            </div>
                            <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Fone do Pai</h5>

                                <input type="text" class="form-control fone" id="participante-fonepai" data-field="Fone do Pai" placeholder="+55 (81) 9999-9999" />
                            </div>` : ''}

${campos.find(x => x.Campo == 'Dados do Contato') ? ` <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Pessoa de Contato</h5>

                                <input type="text" class="form-control required" id="participante-nomecontato" data-field="Pessoa de Contato" />
                            </div>
                            <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Fone do Contato</h5>

                                <input type="text" class="form-control fone" id="participante-fonecontato" data-field="Fone do Contato" placeholder="+55 (81) 9999-9999" />
                            </div>` : ''}

${campos.find(x => x.Campo == 'Dados do Convite') ? `<div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Pessoa que Convidou</h5>

                                <input type="text" class="form-control required" id="participante-nomeconvite" data-field="Pessoa de Convite" />
                            </div>
                            <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Fone de quem convidou</h5>

                                <input type="text" class="form-control fone" id="participante-foneconvite" data-field="Fone do Convite" placeholder="+55 (81) 9999-9999" />
                            </div>` : ''}

${campos.find(x => x.Campo == 'Parente') ? ` <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Tem algum Parente fazendo o ${$('#participante-eventoid option:selected').text()}?</h5>

                                <div class="radio i-checks-green inline"><label> <input type="radio" id="has-parente" value="true" name="participante-hasparente"> <i></i> Sim </label></div>
                                <div class="radio i-checks-green inline"><label> <input type="radio" id="not-parente" checked="" value="false" name="participante-hasparente"> <i></i> Não </label></div>

                                <div class="parente d-none">
                                    <h5>Nome do Parente</h5>
                                    <input type="text" class="form-control" id="participante-parente" data-field="Nome do Parente" />
                                </div>
                            </div>` : ''}

${campos.find(x => x.Campo == 'Congregação') ? `<div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Participa de qual Congregação?</h5>
                                <div class="radio i-checks-green inline"><label> <input type="radio" id="trindade" value="Trindade" name="participante-congregacao"> <i></i> Trindade </label></div>
                                <div class="radio i-checks-green inline"><label> <input type="radio" id="recon" checked="" value="Recon" name="participante-congregacao"> <i></i> Reconciliação </label></div>
                                <div class="radio i-checks-green inline"><label> <input type="radio" id="outra" checked="" value="Outra" name="participante-congregacao"> <i></i> Outra </label></div>

                                <div class="congregacao d-none">
                                    <h5>Qual?</h5>
                                    <input type="text" class="form-control" id="participante-congregacaodescricao" data-field="Congregação" />
                                </div>
                            </div>` : ''}

${campos.find(x => x.Campo == 'Medicação') ? ` <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Toma alguma medicação?</h5>

                                <div class="radio i-checks-green inline"><label> <input type="radio" id="has-medicacao" value="true" name="participante-hasmedicacao"> <i></i> Sim </label></div>
                                <div class="radio i-checks-green inline"><label> <input type="radio" id="not-medicacao" checked="" value="false" name="participante-hasmedicacao"> <i></i> Não </label></div>

                                <div class="medicacao d-none">
                                    <h5>Qual?</h5>
                                    <input type="text" class="form-control" id="participante-medicacao" data-field="Medicação" />
                                </div>
                            </div>` : ''}

${campos.find(x => x.Campo == 'Alergia') ? `<div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Tem alguma alergia?</h5>

                                <div class="radio i-checks-green inline"><label> <input type="radio" id="has-alergia" value="true" name="participante-hasalergia"> <i></i> Sim </label></div>
                                <div class="radio i-checks-green inline"><label> <input type="radio" id="not-alergia" checked="" value="false" name="participante-hasalergia"> <i></i> Não </label></div>

                                <div class="alergia d-none">
                                    <h5>Qual?</h5>
                                    <input type="text" class="form-control" id="participante-alergia" data-field="Alergia" />
                                </div>
                            </div>` : ''}

${campos.find(x => x.Campo == 'Restrição Alimentar') ? `<div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Tem alguma restrição alimentar?</h5>

                                <div class="radio i-checks-green inline"><label> <input type="radio" id="has-restricaoalimentar" value="true" name="participante-hasrestricaoalimentar"> <i></i> Sim </label></div>
                                <div class="radio i-checks-green inline"><label> <input type="radio" id="not-restricaoalimentar" checked="" value="false" name="participante-hasrestricaoalimentar"> <i></i> Não </label></div>

                                <div class="restricaoalimentar d-none">
                                    <h5>Qual?</h5>
                                    <input type="text" class="form-control" id="participante-restricaoalimentar" data-field="Restrição Alimentar" />
                                </div>
                            </div>` : ''}
`)


            initInputs()


            if ($('#map').length > 0) {

                map = initMap('map')
                markerLayer = createMarkerLayer(map)


            }

            $('#has-medicacao').on('ifChecked', function (event) {
                $('.medicacao').removeClass('d-none');
                $("#participante-medicacao").addClass('required');
            });

            $('#not-medicacao').on('ifChecked', function (event) {
                $('.medicacao').addClass('d-none');
                $("#participante-medicacao").removeClass('required');
            });


            $('#has-alergia').on('ifChecked', function (event) {
                $('.alergia').removeClass('d-none');
                $("#participante-alergia").addClass('required');
            });

            $('#not-alergia').on('ifChecked', function (event) {
                $('.alergia').addClass('d-none');
                $("#participante-alergia").removeClass('required');
            });

            $('#has-restricaoalimentar').on('ifChecked', function (event) {
                $('.restricaoalimentar').removeClass('d-none');
                $("#participante-restricaoalimentar").addClass('required');
            });

            $('#not-restricaoalimentar').on('ifChecked', function (event) {
                $('.restricaoalimentar').addClass('d-none');
                $("#participante-restricaoalimentar").removeClass('required');
            });


            $('#has-parente').on('ifChecked', function (event) {
                $('.parente').removeClass('d-none');
                $("#participante-parente").addClass('required');
            });

            $('#not-parente').on('ifChecked', function (event) {
                $('.parente').addClass('d-none');
                $("#participante-parente").removeClass('required');
            });

            $('#trindade').on('ifChecked', function (event) {
                $('.congregacao').addClass('d-none');
                $("#participante-congregacaodescricao").removeClass('required');
            });

            $('#recon').on('ifChecked', function (event) {
                $('.congregacao').addClass('d-none');
                $("#participante-congregacaodescricao").removeClass('required');
            });

            $('#outra').on('ifChecked', function (event) {
                $('.congregacao').removeClass('d-none');
                $("#participante-congregacaodescricao").addClass('required');
            });

        }
    });
}


async function loadCrachaImprimir(Foto) {
    let ids = getCheckedIds()
    const result = await $.ajax(
        {
            processData: false,
            contentType: false,
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(ids.length > 0 ? { Ids: ids, Foto: Foto, EventoId: $("#participante-eventoid").val() } : getFiltros(Foto)),
            url: "Participante/GetCracha",
        });

    return result.data
}

function getFiltros(Foto) {
    return {
        EventoId: $("#participante-eventoid").val(),
        CirculoId: $("#participante-circuloid").val(),
        PadrinhoId: $("#participante-padrinhoid").val(),
        Status: $("#participante-status").val(),
        Etiquetas: $("#participante-marcadores").val(),
        NaoEtiquetas: $("#participante-nao-marcadores").val(),
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

async function openBulkActions() {
    let ids = getCheckedIds()
    const quartos = await $.ajax({
        url: '/Quarto/GetQuartos',
        datatype: "json",
        data: { EventoId: $("#participante-eventoid").val(), Tipo: 1 },
        type: "POST"
    })

    const caronas = await $.ajax({
        url: '/Carona/GetCaronas',
        datatype: "json",
        data: { EventoId: $("#participante-eventoid").val(), Tipo: 1 },
        type: "POST"
    })

    const circulos = await $.ajax({
        url: '/Circulo/GetCirculos',
        datatype: "json",
        data: { EventoId: $("#participante-eventoid").val() },
        type: "POST"
    })

    const padrinhos = await $.ajax({
        url: '/Padrinho/GetPadrinhos',
        datatype: "json",
        data: { EventoId: $("#participante-eventoid").val() },
        type: "POST"
    })

    const etiquetas = await $.ajax({
        url: '/Etiqueta/GetEtiquetasByEventoId',
        data: { eventoId: $("#participante-eventoid").val() },
        datatype: "json",
        type: "POST",
    });

    $("#bulk-circulo").html(`
<option value=999>Selecione</option>
        ${circulos.data.map(p => `<option value=${p.Id}>${p.Titulo || p.Cor}</option>`)}
        `)

    $("#bulk-padrinho").html(`
<option value=999>Selecione</option>
        ${padrinhos.data.map(p => `<option value=${p.Id}>${p.Padrinho}</option>`)}
        `)

    if (caronas.data.filter(x => x.CapacidadeInt - x.Quantidade >= ids.length).length == 0) {
        $('.carona').css('display', 'none')
    } else {
        $('.carona').css('display', 'block')
    }

    $("#bulk-carona").html(`
<option value=999>Selecione</option>
        ${caronas.data.filter(x => x.CapacidadeInt - x.Quantidade >= ids.length).map(p => `<option value=${p.Id}>${p.Motorista}</option>`)}
        `)

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
                        tipo: 1
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
                        ParticipanteId: id,
                        DestinoId: $("#bulk-quarto-f").val(),
                        tipo: 1
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
                        ParticipanteId: id,
                        DestinoId: $("#bulk-quarto-misto").val(),
                        tipo: 1
                    }),
            }))
        }

        if ($("#bulk-circulo").val() != 999) {
            arrPromises.push($.ajax({
                url: "/Circulo/ChangeCirculo/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        ParticipanteId: id,
                        DestinoId: $("#bulk-circulo").val()
                    }),
            }))
        }

        if ($("#bulk-carona").val() != 999) {
            arrPromises.push($.ajax({
                url: "/Carona/ChangeCarona/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        ParticipanteId: id,
                        DestinoId: $("#bulk-carona").val()
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
                        tipo: 1
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
                        tipo: 1
                    }),

            }))
        }

        if ($("#bulk-padrinho").val() != 999) {
            arrPromises.push($.ajax({
                url: "/Padrinho/ChangePadrinho/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        ParticipanteId: id,
                        DestinoId: $("#bulk-padrinho").val()
                    }),

            }))
        }
    })

    await Promise.all(arrPromises);
    SuccessMesageOperation();
    CarregarTabelaParticipante()
}
