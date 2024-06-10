function openModalCracha(id) {
    $('#modal-impressao-cracha').modal();
    idImpressao = id || null
}

var idImpressao

razao = 37.79
modelo = {}
atualRow = 1
atualCol = 1

async function printData(data) {
    const forLoop = async _ => {
        for (let index = 0; index < data.length; index++) {
            const x = data[index]
            await renderCracha(x)
        }
        printDoc(doc)
    }
    forLoop()
}

async function getModelo() {
    const cracha = await $.ajax({
        url: '/Cracha/GetCracha',
        data: { Id: $("#crachaid").val() },
        datatype: "json",
        type: "GET",
    });

    modelo = cracha.Cracha

    linhas = ""
    colunas = ""

    for (var i = 0; i < modelo.Colunas; i++) {
        colunas += `
<div class="coluna " data-col="${i}" onclick="printSome(this)" style="cursor:pointer;background-color:#6f7172;width:${razao / 2 * modelo.Largura}px;height:${razao / 2 * modelo.Altura}px;margin:4px"></div>
`
    }

    for (var i = 0; i < modelo.Linhas; i++) {
        linhas += `
<div class="linha" data-row="${i}" style="display:flex;margin:auto">${colunas}</div>
`
    }

    $('.preview-layout').css('display', 'flex').html(`
        ${linhas}

`)
}

async function printSome(evt) {

    print($(evt).parent().data('row'), $(evt).data('col'))
}

async function print(linha, col) {

    const results = await loadCrachaImprimir(modelo.Background == 'foto', idImpressao)
    $("#container-cracha").height(modelo.Altura * razao)
    $("#cracha").height(modelo.Altura * razao)
    $("#cracha").width(modelo.Largura * razao)
    $("#cracha").html(modelo.Conteudo)
    var formatArray = modelo.Papel == 'custom' ? new Array(modelo.Largura, modelo.Altura) : modelo.Papel
    doc = new jsPDF(modelo.Orientacao, 'cm', formatArray);
    atualRow = linha
    atualCol = col
    await printData(results)

    reset()

}

function reset() {
    $('#container-cracha').css('display', 'none')
    $('.preview-layout').css('display', 'none')
    $("#crachaid").val("Pesquisar").trigger("chosen:updated");
}

$("#modal-impressao-cracha").on('hidden.bs.modal', reset)

async function renderCracha(data) {
    $('.preview-layout').css('display', 'none')
    await $('img.background').attr('src', `data:image/png;base64,${data.Foto}`)
    $('#container-cracha').css('display', 'block')
    var splittedNome = data.Nome.split(' ');
    $('span.nome-cracha').text(modelo.NomeCompleto ? data.Nome : `${splittedNome[0]} ${splittedNome[splittedNome.length - 1]}`)
    $('span.apelido-cracha').text(data.Apelido)
    $('span.equipe-cracha').text(data.Equipe || '')
    $('span.circulo-cracha').text(data.Circulo || '')
    $('span.quarto-cracha').text(data.Quarto || '')
    $('#cracha').toggleClass('moldura-modal')
    var html_string = $("#cracha").parent().html();
    var iframe = document.createElement('iframe');
    document.body.appendChild(iframe);

        var iframedoc = iframe.contentDocument || iframe.contentWindow.document;
    iframedoc.body.innerHTML = html_string;
    $(iframedoc.body).css("line-height", 1.42857143)
    $(iframedoc.body).css("font-family", "open sans, Helvetica Neue , Helvetica")   
    console.log(iframedoc.body);
        const canvas = await html2canvas($(iframedoc.body).find('#cracha')[0], {
       
        });
    var imgData = canvas.toDataURL(
        'image/png');

    if (modelo.Papel == 'custom') {
        doc.addImage(imgData, 'PNG', 0, 0);
    } else {
        doc.addImage(imgData, 'PNG', modelo.MargemVertical + (atualCol * modelo.Largura), modelo.MargemHorizontal + (atualRow * modelo.Altura), (modelo.Largura), (modelo.Altura));
    }
    

    $('#cracha').toggleClass('moldura-modal')
    $('span.nome-cracha').text('{Nome}')
    $('span.apelido-cracha').text('{Apelido}')
    $('span.equipe-cracha').text('{Equipe}')
    $('span.circulo-cracha').text('{Circulo}')
    $('span.quarto-cracha').text('{Quarto}')

        if (atualCol < modelo.Colunas - 1) {
            atualCol++
        } else {
            atualCol = 0
            if (atualRow < modelo.Linhas - 1) {
                atualRow++
            } else {
                doc.addPage();
                atualRow = 0
                atualCol = 0
            }
        }
    
}

function GetCrachas() {
    $("#crachaid").empty();
    $('#crachaid').append($('<option>Pesquisar</option>'));
    $.ajax({
        url: '/Cracha/GetCrachasByEventoId',
        data: { eventoId: SelectedEvent.Id },
        datatype: "json",
        type: "POST",
        success: (result) => {
            result.data.forEach(function (cracha, index, array) {
                $('#crachaid').append($(`<option value="${cracha.Id}">${cracha.Titulo}</option>`));
            });
            $("#crachaid").val("Pesquisar").trigger("chosen:updated");
        }
    });
}
