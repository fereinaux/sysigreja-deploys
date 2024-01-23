function GetButton(functionClick, functionParameter, color, icon, title) {
    var button = '';

    switch (color) {
        case 'red': button = 'text-danger'; break;
        case 'yellow': button = 'text-warning'; break;
        case 'blue': button = 'text-info'; break;
        case 'green': button = 'text-success'; break;
        case 'verde': button = 'text-verde'; break;
        case 'cinza': button = 'text-mutted'; break;
        default: button = ''; break;
    }

    return `<span data-tippy-content="${title}" onclick='${functionClick}(${functionParameter})' style="font-size:18px" class="${button} pointer p-l-xs"><i class="${(!icon.includes('far') && !icon.includes('fab')) ? 'fa' : ''} ${icon}" aria-hidden="true" ></i></span>`;
}

function GetAnexosButton(functionClick, functionParameter, qtd) {

    return `<span data-tippy-content="Anexos" onclick='${functionClick}(${functionParameter})' style="font-size:18px;position:relative" class="text-success  has-badge pointer p-l-xs"  ${qtd > 0 ? 'data-count="' + qtd + '"' : ''}> <i class="fa fa-paperclip data-counter" aria-hidden="true" title="Anexos"></i></span>`


}

function GetIconWhatsApp(tel, text) {

    return `<a data-tippy-content="Whatsapp" target="_blank" href='${GetLinkWhatsApp(tel, text)}' style="font-size:18px; color:green; " class="pointer p-l-xs"><i class="fab fa-whatsapp" aria-hidden="true" title="${tel}"></i></a>`;
}


function GetLinkWhatsApp(tel, text) {
    if (!tel)
        return ""
    tel = tel.replaceAll(' ', '').replaceAll('+', '').replaceAll('(', '').replaceAll(')', '').replaceAll('.', '').replaceAll('-', '');
    text = typeof text !== "undefined" ? `&text=${EncodeUrl(text)}` : "";
    return `https://api.whatsapp.com/send?phone=${tel}${text}&source=&data=`;
}


function GetIconTel(tel) {
    return `<a data-tippy-content="Telefone" target="_blank" href="tel:${tel}" style="font-size:18px" class="pointer p-l-xs"><i class="fa fa-phone" aria-hidden="true" title="${tel}"></i></a>`;
}

function GetLabel(functionClick, functionParameter, color, title, tooltip) {

    var button = '';
    switch (color) {
        case 'red': button = 'danger'; break;
        case 'yellow': button = 'warning'; break;
        case 'blue': button = 'success'; break;
        case 'green': button = 'primary'; break;
        case 'info': button = 'info'; break;
        case 'default': button = 'default'; break;
        default: button = 'info'; break;
    }


    return `<span onclick='${functionClick}(${functionParameter})' style="font-size:13px" class="m-r-sm pointer text-center label label-${button}"  data-tippy-content="${tooltip || title}">${title}</span>`;
}

function GetCheckBox(id, checked, indeterminate) {
    return `<div class="checkbox i-checks-green ${indeterminate ? "indeterminate" : ""}"><label> <input type="checkbox" data-id='${id}' value="" ${indeterminate ? "" : (checked ? 'checked=""' : '')}> <i></i></label></div>`;
}

loadProfile = typeof loadProfile !== 'undefined' ? loadProfile : function () { }
var rootProfile = [];


function tippyProfile(element, Id, aba, callbackFuntion, type) {

    instance = tippy(element, {
        allowHTML: true,
        content: '',
        placement: 'top',
        zIndex: 99999,
        duration: [10, 10],
        appendTo: document.body,
        trigger: 'click',
        interactive: true,
        arrow: false,
        flipOnUpdate: true,
        onShown: (instance) => {
            loadProfile(ReactDOM.createRoot(document.getElementById(`profile-${instance.props.Id}`)), instance.props.Id, aba, callbackFuntion, type || "Participante")
        },
        onTrigger: (instance, event) => {
            instance.setContent(`<div id="profile-${Id}"></div>`)
            instance.props.Id = Id
        },
    });
}