$(document).off('ready-ajax').on('ready-ajax', () => {
    CarregarTela()
    loadCampos()
})


function ExportarExcel() {
    $.ajax({
        url: "/Equipante/GetEquipantesDataTable?extract=excel",
        dataType: "text",
        data: {
            EventoId: SelectedEvent.Id,
            Equipe: [EquipeId],
            Campos: mapCampos(campos.map(campo => campo.Campo)).concat(["Quarto", "Equipe", "Situacao"]).flatMap(campo => campo).join(','),
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

EquipeId = null
Grupo = null

function CarregarTabelaArquivos(id) {
    $.ajax({
        url: '/Arquivo/GetArquivosEquipeByEventoId',
        datatype: "json",
        data: { Equipe: id, IsComunEquipe: true, EventoId: SelectedEvent.Id, },
        type: "POST",
        success: (data) => {
            html = '';
            if (data.data.length == 0) {
                $('.col-arquivo').css('display', 'none')
            } else {
                $('.col-arquivo').css('display', 'block')
            }
            $('.qtd-arquivos').text(`Quantidade: ${data.data.length}`)
            $(data.data).each((i, element) => {
                html += `<tr>                        
                        <td>${element.Nome}</td>
                        <td>${GetButton('GetArquivo', element.Id, 'blue', 'fa-download', 'Download')}</td>
                    </tr>`;
            });
            $('.tbarquivos').html(html);

            $("td.fa").css("font-size", "25px");
            $("td").css("font-size", "15px");
            $("th").css("font-size", "15px");
        }
    });
}

function loadCampos() {
    $.ajax({
        url: "/Configuracao/GetCamposEquipeByEventoId/",
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
    await createGroup(`${$('.equipe').text()} ${SelectedEvent.Titulo} ${SelectedEvent.Numeracao}`,
        membros.filter(x => x.Fone != Usuario.Fone).map(x => x.Fone.replaceAll(' ', '').replaceAll('+', '').replaceAll('(', '').replaceAll(')', '').replaceAll('.', '').replaceAll('-', '')),
        SelectedEvent.Id,
        EquipeId
    )
}

async function AddGrupo(phone) {
    await addGroup(Grupo, phone)
}

function CarregarTela() {
    $.ajax({
        url: '/Home/CoordenadorGet',
        datatype: "json",
        data: { eventoId: SelectedEvent.Id },
        type: "GET",
        success: (data) => {
            EquipeId = data.result.EquipeEnum
            Grupo = data.result.Grupo
            $('#col-equipe').css('display', data.result.EquipePai ? 'block' : 'none')
            $('.equipe').text(data.result.Equipe)
            $('#btn-excel').prop('disabled', false)
            $('#btn-grupo').prop('disabled', Grupo != null)

            $('.qtd-membros').text(data.result.QtdMembros)
            membros = data.result.Membros;
            $('.membros').html(`${data.result.Membros.map(membro => `
<tr class="foto"  >
    <td data-label="Sexo"><span style="font-size:24px;" class="p-l-xs"> <i class="fa  ${membro.Sexo == "Masculino" ? "fa-male" : "fa-female"} " aria-hidden="true"></i></span></td>
    <td data-label="Nome">${membro.Nome}</td>
    <td data-label="Idade">${membro.Idade}</td>
    ${data.result.EquipePai ? `    <td data-label="Equipe">${membro.Equipe}</td>` : ""}
    
    <td data-label="Oferta"> <span style="font-size:24px;"> <i class="fa ${membro.Oferta ? "fa-check" : "fa-times"} " aria-hidden="true"></i></span></td>
    <td data-label="Faltas">${membro.Presenca.filter(x => x == false).length}</td>
    <td data-label="Contato" class="membro-fone">${membro.Fone}</td>
    <td data-label="Ações"><i class="fas fa-cog" data-id="${membro.Id}"></i></td>
</tr>
`)}`)
            $(".membro-fone").each((i, element) => {
                $(element).html(`${GetIconWhatsApp($(element).text())}
                            ${GetIconTel($(element).text())}`);
            });
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
                    ${membro.HasFoto ? `<img id="foto-participante" style="width:200px" src="/Arquivo/GetFotoByEquipanteId/${membro.Id}" />
                     <button class="btn btn-outline" style="width:100%; margin: 10px 0;border: 1px solid; display: block" onclick="toggleFoto(${membro.Id})"><i class="fas fa-times"></i> Remover Foto </button>` : `

<form enctype="multipart/form-data" id="frm-foto${membro.Id}" method="post" novalidate="novalidate">
                                <label for="foto${membro.Id}" class="inputFile">

                                <span class="btn btn-outline"  style="width:100%; margin: 10px 0;border: 1px solid; display: block"><i class="fa fa-camera"></i> Adicionar Foto </span>
                                <input accept="image/*" onchange='Foto(${JSON.stringify({ Nome: membro.Nome, Id: membro.Id, Fone: membro.Fone })})' style="display: none;" class="custom-file-input inputFile" id="foto${membro.Id}" name="foto${membro.Id}" type="file" value="">
                            </label>                        
                        </form> `                        }
               
                    ${Grupo ?

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
            CarregarTabelaArquivos(data.result.EquipeEnum)
            CarregarTabelaPresenca()
        }
    });
}

function GetArquivo(id) {
    window.open(`/Arquivo/GetArquivo/${id}`)
}

function CarregarTabelaPresenca() {
    $.ajax({
        url: '/Home/GetPresenca',
        datatype: "json",
        data: { ReuniaoId: $("#reuniaoid").val() },
        type: "GET",
        success: (data) => {
            html = '';
            $(membros).each((i, element) => {
                html += `<tr>                        
                        <td>${element.Nome}</td>                        
                        <td class="membro-fone"><div class="checkbox i-checks-green"><label> <input type="checkbox" data-id="${element.EquipanteEventoId}" value="" ${data.presenca.indexOf(element.EquipanteEventoId) > 0 ? 'checked=""' : ''}> <i></i></label></div></td>
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


function TogglePresenca(id) {
    $.ajax({
        url: "/Equipe/TogglePresenca/",
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            {
                EquipanteEventoId: id,
                ReuniaoId: $("#reuniaoid").val()
            })
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
            dataToPost.set('EquipanteId', realista.Id)
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
                    url: "/Arquivo/DeleteFotoEquipante",
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