    function openModalCracha() {
        $('#modal-impressao-cracha').modal();

    }

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

        const results = await loadCrachaImprimir(modelo.Background == 'foto')
        $("#container-cracha").height(modelo.Altura * razao)
        $("#cracha").height(modelo.Altura * razao)
        $("#cracha").width(modelo.Largura * razao)
        $("#cracha").html(modelo.Conteudo)
        var formatArray = modelo.Papel == 'custom' ? new Array(modelo.Largura, modelo.Altura) : modelo.Papel
        doc = new jsPDF(modelo.Papel == 'custom' ? 'p' : modelo.Orientacao, 'cm', formatArray);
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
        const canvas = await html2canvas($("#cracha")[0])
        var imgData = canvas.toDataURL(
            'image/png');

        doc.addImage(imgData, 'PNG', modelo.MargemVertical + (atualCol * modelo.Largura), modelo.MargemHorizontal + (atualRow * modelo.Altura), (modelo.Largura), (modelo.Altura));
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

    $(document).ready(function () {
        GetCrachas()
        $("*[id*='eventoid']").change(function () {
            GetCrachas()

        })
    });
