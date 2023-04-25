function CarregarTabelaUsuario() {
    const tableUsuarioConfig = {
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
        buttons: getButtonsConfig('Usuarios'),
        columns: [
            { data: "UserName", name: "UserName", autoWidth: true },
            { data: "Perfil", name: "Perfil", autoWidth: true },
            {
                data: "Id", name: "Id", orderable: false, width: "15%",
                "render": function (data, type, row) {
                    if (!(Ativo == row.Status)) {
                        var color = 'red';
                        var title = 'Inativo';
                    } else {
                        var color = 'green';
                        var title = 'Ativo';
                    }

                    return `${GetLabel('ToggleUsuarioStatus', "'" + data + "'", color, title)}
                            ${GetButton('EditUsuario', '"' + data + '"', 'blue', 'fa-edit', 'Editar')}
                            ${GetButton('DeleteUsuario', '"' + data + '"', 'red', 'fa-trash', 'Excluir')}`;
                }
            }
        ],
        order: [
            [0, "asc"]
        ],
        ajax: {
            url: '/Account/GetUsuarios',
            datatype: "json",
            type: "POST"
        }
    };
    $("#table-usuarios").DataTable(tableUsuarioConfig);
}

function GetUsuario(id) {
    $("#usuario-login").prop('disabled', false);
    $("#usuario-senha").prop('disabled', false);
    $('.password-click').css('display', 'block')
    if (id) {
        $.ajax({
            url: "/Account/GetUsuario/",
            data: { Id: id },
            datatype: "json",
            type: "GET",
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                $("#usuario-id").val(data.Usuario.Id);
                $("#usuario-login").val(data.Usuario.UserName);
                $("#usuario-senha").val(data.Usuario.Senha);
                $("#usuario-oldsenha").val(data.Usuario.Senha);
                $(`input[type=radio][value=${data.Usuario.Perfil}]`).iCheck('check');
                if (data.Usuario.Perfil != "Admin") {
                    $(".eventos").addClass('d-none');
                } else {
                    $(".eventos").removeClass('d-none');
                }
                if (data.Usuario.EquipanteId > 0) {
                    var newOption = new Option(data.Usuario.Nome, data.Usuario.EquipanteId, true, true);
                    $('#usuario-equipanteid').append(newOption)
                }

                $("#usuario-equipanteid").val(data.Usuario.EquipanteId > 0 ? data.Usuario.EquipanteId : "").trigger("change");
                $("#usuario-eventos").val(data.Usuario.Eventos)
                $("#usuario-eventos").select2({ dropdownParent: $("#form-usuario") })
            }
        });
    }
    else {
        $("#usuario-id").val("");
        $("#usuario-login").val("");
        $("#usuario-senha").val("");
        $("#usuario-oldsenha").val("");
        $(`input[type=radio][value=Admin]`).iCheck('check');
        $("#usuario-equipanteid").val("Selecione").trigger("chosen:updated");
        $("#usuario-eventos").val()
        $("#usuario-eventos").select2({ dropdownParent: $("#form-usuario") })
    }
}

function EditUsuario(id) {
    GetEquipantes(id);
    $("#modal-usuarios").modal();
}

function ToggleUsuarioStatus(id) {
    $.ajax({
        url: "/Account/ToggleUsuarioStatus/",
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            {
                Id: id
            }),
        success: function () {
            CarregarTabelaUsuario();
        }
    });
}

function DeleteUsuario(id) {
    ConfirmMessageDelete().then((result) => {
        if (result) {
            $.ajax({
                url: "/Account/DeleteUsuario/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: id
                    }),
                success: function () {
                    CarregarTabelaUsuario();
                }
            });
        }
    })
}

function PostUsuario() {
    if (ValidateForm(`#form-usuario`)) {
        if (!$("#usuario-id").val()) {
            var windowReference = window.open('_blank');
        }
        $.ajax({
            url: "/Account/Register/",
            datatype: "json",
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(
                {
                    Id: $("#usuario-id").val(),
                    UserName: $("#usuario-login").val(),
                    Password: $("#usuario-senha").val(),
                    Perfil: $("input[type=radio][name=usuario-perfil]:checked").val(),
                    Eventos: $("#usuario-eventos").val(),
                    OldPassword: $("#usuario-oldsenha").val(),
                    EquipanteId: $("#usuario-equipanteid").val() != "Selecione" ? $("#usuario-equipanteid").val() : 0
                }),
            success: function (data) {
                SuccessMesageOperation();
                CarregarTabelaUsuario();
                $("#modal-usuarios").modal("hide");
                if (!$("#usuario-id").val()) {
                    windowReference.location = GetLinkWhatsApp(data.User.Fone, MsgUsuario(data.User))
                }
            }
        });
    }
}

$(document).ready(function () {
    GetTipos()
    CarregarTabelaUsuario();

    $(".password-click").mousedown(function () {
        $("#usuario-senha").attr("type", "text");
    });

    $(".password-click").mouseup(function () {
        $("#usuario-senha").attr("type", "password");
    });
});

function GetEquipantes(id) {
    GetUsuario(id);
    $('#usuario-equipanteid').select2({
        ajax: {
            url: "/Account/GetEquipantes/",
            data: function (params) {
                var query = {
                    Id: id,
                    Search: params.term,
                }

                // Query parameters will be ?search=[term]&type=public
                return query;
            },
            processResults: function (data) {

                // Transforms the top-level key of the response object from 'items' to 'results'
                return {
                    results: data.Equipantes
                };
            }
        },
        placeholder: "Pesquisar",
        minimumInputLength: 3,
        dropdownParent: $('#form-usuario')
    });

}

$('#usuario-equipanteid').on("change", function () {


    $.ajax({
        url: "/Account/GetUsuarioByEquipanteId/",
        data: { Id: $('#usuario-equipanteid').val() },
        datatype: "json",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {

            if (data.Usuario) {
                $("#usuario-login").val(data.Usuario.UserName);
                $("#usuario-id").val(data.Usuario.Id);
                $("#usuario-senha").val(data.Usuario.Senha);
                $("#usuario-oldsenha").val(data.Usuario.Senha);
                $("#usuario-login").prop('disabled', true);
                $("#usuario-senha").prop('disabled', true);
                $('.password-click').css('display', 'none')
            } else {
                $("#usuario-login").val("");
                $("#usuario-id").val("");
                $("#usuario-senha").val("");
                $("#usuario-oldsenha").val("");
                $("#usuario-login").prop('disabled', false);
                $("#usuario-senha").prop('disabled', false);
                $('.password-click').css('display', 'block')
            }
        }
    });


})


function GetTipos() {
    $("#usuario-eventos").empty();

    $.ajax({
        url: "/Evento/GetTipos/",
        datatype: "json",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            data.Tipos.forEach(function (tipo, index, array) {
                $('#usuario-eventos').append($(`<option value="${tipo.Id}">${tipo.Titulo}</option>`));
            });
            $("#usuario-eventos").select2({ dropdownParent: $("#form-usuario") })
        }
    });
}

$(`input[type=radio][value=Geral]`).on('ifChecked', function (event) {
    $(".eventos").addClass('d-none');
});
$(`input[type=radio][value=Admin]`).on('ifChecked', function (event) {
    $(".eventos").removeClass('d-none');
    $("#usuario-eventos").select2({ dropdownParent: $("#form-usuario") })
});