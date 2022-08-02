function ErrorMessage(message) {
    swal({
        title: "Erro!",
        icon: "error",
        text: message
    });
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
${!user.hasChangedPassword ? `Senha: ${user.Senha}` : "" }
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
            return `${user.Evento.Titulo} ${user.Evento.Numeracao }`
    }
}