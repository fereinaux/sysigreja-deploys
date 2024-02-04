$(document).off('ready-ajax').on('ready-ajax', () => {
    CarregarTela()
    loadCampos()
})


function ExportarExcel() {
    $.ajax({
        url: "/Participante/GetParticipantesDatatable?extract=excel",
        dataType: "text",
        data: {
            EventoId: SelectedEvent.Id,
            CirculoId: [CirculoId],
            Campos: mapCampos(campos.map(campo => campo.Campo)).concat(["Quarto"]).flatMap(campo => campo).join(','),
            columns:
                campos.map(campo => ({ name: campo.Campo, search: { value: "" } }))
            ,
            order: [{
                column: 0,
                dir: "asc"
            }]
        },
        type: "POST",
        success: function (o) {
            window.location = `/Equipante/DownloadTempFile?fileName=${$('.equipe').text()} - ${$("#eventoid option:selected").text()}.xlsx&g=` + o;
        }

    })
}

CirculoId = null
Grupo = null


function PrintCirculo() {

    $.ajax({
        url: '/Participante/GetParticipantesByCirculo',
        data: { CirculoId: CirculoId },
        datatype: "json",
        type: "GET",
        success: (result) => {
            var doc = CriarPDFA4()
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


function loadCampos() {
    $.ajax({
        url: "/Configuracao/GetCamposByEventoId/",
        data: { Id: SelectedEvent.Id },
        datatype: "json",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            campos = data.Campos
        }
    })
}

var membros = []

async function CriarGrupo() {
    await createGroupCirculo(`${$('.equipe').text()} ${SelectedEvent.Titulo} ${SelectedEvent.Numeracao}`,
        membros.filter(x => x.Fone != Usuario.Fone).map(x => x.Fone.replaceAll(' ', '').replaceAll('+', '').replaceAll('(', '').replaceAll(')', '').replaceAll('.', '').replaceAll('-', '')),
        CirculoId
    )

    CarregarTela()
}

async function AddGrupo(phone) {
    await addGroup(Grupo, phone)
}

function CarregarTela() {
    $.ajax({
        url: '/Home/DirigenteGet',
        datatype: "json",
        data: { eventoId: SelectedEvent.Id },
        type: "GET",
        success: (data) => {
            CirculoId = data.result.CirculoId
            Grupo = data.result.Grupo
            $('.equipe').text(`${singularize($('.title-circulo').text()) || "Equipe de Grupos"} ${data.result.Circulo}`)
            $('#btn-excel').prop('disabled', false)
            $('#btn-grupo').prop('disabled', Grupo != null)

            $('.qtd-membros').text(data.result.QtdMembros)
            membros = data.result.Membros;
            $('.membros').html(`${data.result.Membros.map(membro => `
<tr class="foto"  >
    <td data-label="Sexo"><span style="font-size:24px;" class="p-l-xs"> <i class="fa  ${membro.Sexo == "Masculino" ? "fa-male" : "fa-female"} " aria-hidden="true"></i></span></td>
    <td data-label="Nome">${membro.Nome}</td>
    <td data-label="Idade">${membro.Idade}</td>
    
    <td data-label="Faltas">${membro.Faltas}</td>
    <td data-label="Contato" class="membro-fone">${membro.Fone}</td>
    <td data-label="Ações"><i class="fas fa-cog" data-id="${membro.Id}"></i></td>
</tr>
`)}`)
            $(".membro-fone").each((i, element) => {
                $(element).html(`${GetIconWhatsApp($(element).text())}
                            ${GetIconTel($(element).text())}`);
            });

            $('.hide-zero-reunioes').css('display', data.result.Reunioes.length > 0 ? 'block' : 'none')

            $('#reuniaoid').html(`${data.result.Reunioes.map(reuniao => `
<option value="${reuniao.Id}">${reuniao.DataReuniao}</option>
`)}`)

            tippy(`.fa-cog`, {
                trigger: "click",
                content: '',
                allowHTML: true,
                interactive: true,
                onTrigger: (instance, event) => {
                    var membro = membros.find(x => x.Id == $(event.target).data('id'))
                    instance.setContent(`
                    ${membro.HasFoto ? `<img id="foto-participante" style="width:200px" src="/Arquivo/GetFotoByParticipanteId/${membro.Id}" />
                     <button class="btn btn-outline" style="width:100%; margin: 10px 0;border: 1px solid; display: block" onclick="toggleFoto(${membro.Id})"><i class="fas fa-times"></i> Remover Foto </button>` : `

<form enctype="multipart/form-data" id="frm-foto${membro.Id}" method="post" novalidate="novalidate">
                                <label for="foto${membro.Id}" class="inputFile">

                                <span class="btn btn-outline"  style="width:100%; margin: 10px 0;border: 1px solid; display: block"><i class="fa fa-camera"></i> Adicionar Foto </span>
                                <input accept="image/*" onchange='Foto(${JSON.stringify({ Nome: membro.Nome, Id: membro.Id, Fone: membro.Fone })})' style="display: none;" class="custom-file-input inputFile" id="foto${membro.Id}" name="foto${membro.Id}" type="file" value="">
                            </label>                        
                        </form> `                        }
               
                    ${Grupo && (membro.Fone != Usuario.Fone) ?

                            `
                         <div>
                            <button class="btn btn-outline" style="width:100%; margin: 10px 0;border: 1px solid; display: block" onclick="AddGrupo('${membro.Fone}')"><i class="fab fa-whatsapp"></i> Adicionar ao Grupo</button>
                        </div>
                        `
                            : ""
                        }
                   
                    `)
                },
            });
            CarregarTabelaPresenca()
        }
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
                    url: "/Arquivo/PostArquivo",
                    success: function () {
                        $("#modal-fotos").modal("hide");
                        CarregarTela()

                    }
                });
        });
}


function Foto(row) {
    tippy.hideAll()
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
                    url: "/Arquivo/DeleteFotoParticipante",
                    data: JSON.stringify(
                        {
                            Id: id
                        }),

                    success: function () {
                        CarregarTela()

                    }
                });
        }
    }
    )
}


function EditReuniao(id) {
    GetReuniao(id);
    $("#modal-reunioes").modal();
}

function DeleteReuniao(id) {
    ConfirmMessageDelete().then((result) => {
        if (result) {
            $.ajax({
                url: "/Reuniao/DeleteReuniao/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: id
                    }),
                success: function () {
                    SuccessMesageDelete();
                    CarregarTela();
                }
            });
        }
    });
}

function PostReuniao() {
    if (ValidateForm(`#form-reuniao`)) {
        $.ajax({
            url: "/Reuniao/PostReuniao/",
            datatype: "json",
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(
                {
                    Id: $("#reuniao-id").val(),
                    EventoId: SelectedEvent.Id,
                    CirculoId: CirculoId,
                    Titulo: $("#reuniao-titulo").val(),
                    Tipo: 1,
                    //Pauta: pauta.summernote('code'),
                    DataReuniao: moment($("#reuniao-data").val(), 'DD/MM/YYYY HH:mm', 'pt-br').toJSON()
                }),
            success: function () {
                SuccessMesageOperation();
                $("#modal-reunioes").modal("hide");
                CarregarTela()
            }
        });
    }
}

function GetReuniao(id) {
    if (id > 0) {
        $.ajax({
            url: "/Reuniao/GetReuniao/",
            data: { Id: id },
            datatype: "json",
            type: "GET",
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                $("#reuniao-id").val(data.Reuniao.Id);
                $("#reuniao-titulo").val(data.Reuniao.Titulo),
                    $("#reuniao-data").val(moment(data.Reuniao.DataReuniao).format('DD/MM/YYYY'));
            }
        });
    }
    else {
        $("#reuniao-id").val(0);
        $("#reuniao-data").val("");
    }
}

function CarregarTabelaPresenca() {
    if ($("#reuniaoid").val()) {
        $.ajax({
            url: '/Home/GetPresencaParticipantes',
            datatype: "json",
            data: { ReuniaoId: $("#reuniaoid").val() },
            type: "GET",
            success: (data) => {
                html = '';
                $(membros).each((i, element) => {
                    html += `<tr>                        
                        <td>${element.Nome}</td>                        
                        <td class="membro-fone"><div class="checkbox i-checks-green"><label> <input type="checkbox" data-id="${element.Id}" value="" ${data.presenca.indexOf(element.Id) > 0 ? 'checked=""' : ''}> <i></i></label></div></td>
                    </tr>`;
                });

                $('.tbpresenca').html(html);

                $('.i-checks-green').iCheck({
                    checkboxClass: 'icheckbox_square-green',
                    radioClass: 'iradio_square-green'
                });
                $('.i-checks-green').on('ifClicked', function (event) {
                    TogglePresenca($(event.target).data("id"));
                });

                $("td.fa").css("font-size", "25px");
                $("td").css("font-size", "15px");
                $("th").css("font-size", "15px");
            }
        });
    }
}


function TogglePresenca(id) {
    $.ajax({
        url: "/Circulo/TogglePresenca/",
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            {
                ParticipanteId: id,
                ReuniaoId: $("#reuniaoid").val()
            })
    });
}
