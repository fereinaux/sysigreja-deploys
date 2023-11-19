function ErrorMessage(message) {
    var div = document.createElement("div");
    div.innerHTML = `<p style="color:white" class="swal-text">${message.replaceAll('\n', '<br>')}</p>`

    CustomSwal({
        title: "Erro!",
        icon: "error",
        content: div,
        className: "button-center",
    })
}

function SuccessMessage(message) {
    swal({
        title: "Sucesso!",
        icon: "success",
        text: message
    });
}

function SuccessMesageDelete() {
    SuccessMessage("Registro excluído!");
}

function SuccessMesageOperation() {
    SuccessMessage("A operação foi concluída!");
}

async function ConfirmMessage(message) {
    return await swal({
        title: "Você tem certeza?",
        icon: "warning",
        text: message,
        buttons: {
            cancel: "Desistir",
            confirm: "Confirmar"
        }
    });
}


async function CustomSwal(options) {
    return await swal(options);
}

async function ConfirmMessageDelete() {
    return await ConfirmMessage("Essa ação excluirá permanentemente o registro, deseja continuar?");
}

async function ConfirmMessageCancelar(nome) {
    return await ConfirmMessage(`Deseja cancelar a inscrição de ${nome}?`);
}

function RebciboPagamento(valor, formaPagamento, evento) {
    return `Aqui está o seu recibo de pagamento do Realidade:/n/n*R$ ${valor} - ${formaPagamento}*${RodapeEvento(evento)}`;
}

function RodapeEvento(evento) {
    return `*Agradecemos a compreensão!*
*Equipe da Secretaria | ${evento}*
`;
}


function MsgUsuario(user) {
    return `Olá *${user.Nome}*,

Você foi cadastrado(a) como _${getPerfilName(user)}_ para o *${getDestino(user)}*

Para entrar no sistema, acesse: *${window.location.hostname}/login* 

*Dados de Login:*

Usuário: ${user.UserName}
${!user.hasChangedPassword ? `Senha: ${user.Senha}` : ""}
`
}

function getPerfilName(user) {
    switch (user.Perfil) {
        case "Financeiro":
            return "Usuário Financeiro"
        case "Administrativo":
            return "Usuário Administrativo"
        case "Geral":
            return "Administrador Geral"
        case "Admin":
            return "Administrador"
        default:
            return user.Perfil
    }
}

function getDestino(user) {
    switch (user.Perfil) {
        case "Geral":
            return `${window.location.hostname}`
        default:
            return `${user.Evento.Titulo} ${user.Evento.Numeracao}`
    }
}

async function createGroup(name, participants, eventoId, equipeId, file) {
    const status_response = await handleWhatsappConnected()

    const result = await $.ajax({
        url: `https://api.iecbeventos.com.br/api/${status_response.token}/create-group`,
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            {
                name, participants
            }),
    })

    await $.ajax({
        url: `/Equipe/SaveGrupo/`,
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            {
                grupoId: result.response.groupInfo[0].id,
                eventoId,
                equipeId
            }),
    })

    SuccessMesageOperation()
}

async function addGroup(groupId, phone) {
    const status_response = await handleWhatsappConnected()

    await $.ajax({
        url: `https://api.iecbeventos.com.br/api/${status_response.token}/add-participant-group`,
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            {
                groupId, phone
            }),
    })

    SuccessMesageOperation()
}

async function enviarMensagens(mensagemId, ids, tipo, controller) {

    const status_response = await handleWhatsappConnected()

    const dataMsg = await $.ajax({
        url: "/Mensagem/GetMensagem/",
        data: { Id: mensagemId },
        datatype: "json",
        type: "GET",
        contentType: 'application/json; charset=utf-8',

    });

    const data = await $.ajax({
        url: `/${controller}/GetTelefones/`,
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify({
            ids, EventoId: SelectedEvent.Id,
        }),
    })

    async function callback() {
        const pResult = await Promise.allSettled(data.Pessoas.map(pessoa => ($.ajax({
            url: `https://api.iecbeventos.com.br/api/${status_response.token}/send-message`,
            datatype: "json",
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(
                {
                    name: pessoa[`Nome${tipo}`],
                    phone: `${pessoa[`Fone${tipo}`].replaceAll(' ', '').replaceAll('+', '').replaceAll('(', '').replaceAll(')', '').replaceAll('.', '').replaceAll('-', '')}@c.us`,
                    message: dataMsg.Mensagem.Conteudo.replaceAll('${Nome Participante}', pessoa.Nome).replaceAll('${Nome Contato}', pessoa[`Nome${tipo}`]).replaceAll('${Link do MercadoPago}', `https://www.mercadopago.com.br/checkout/v1/payment/redirect/?preference-id=${pessoa.MercadoPagoPreferenceId}`)
                }),
        }))))

        if (pResult.filter(x => x.status == 'rejected' && x.reason.responseJSON.response.error == 'notExists').length > 0) {

            ErrorMessage(`Os números das pessoas a seguir estão incorretos: \n${pResult.filter(x => x.status == 'rejected' && x.reason.responseJSON.response.error == 'notExists').map(x => `- ${x.reason.responseJSON.response.nome
                } \n`).join().replaceAll(',', '')}`)
        } else {
            SuccessMesageOperation()
        }

    }

    if (status_response.status != "CONNECTED") {
        await connectWhatsapp(status_response.token, callback)
    } else {
        await callback()
    }


}