

$(document).ready(function () {

    initInputs()

});

function mapCampos(campos) {
    arrayCampos = []

    campos.forEach(campo => {
        arrayCampos.push(campoRelation(campo))

    })
    return arrayCampos
}

var timeZoneCityToCountry = {
    "Andorra": "Andorra",
    "Dubai": "United Arab Emirates",
    "Kabul": "Afghanistan",
    "Tirane": "Albania",
    "Yerevan": "Armenia",
    "Casey": "Antarctica",
    "Davis": "Antarctica",
    "Mawson": "Antarctica",
    "Palmer": "Antarctica",
    "Rothera": "Antarctica",
    "Troll": "Antarctica",
    "Vostok": "Antarctica",
    "Buenos_Aires": "Argentina",
    "Cordoba": "Argentina",
    "Salta": "Argentina",
    "Jujuy": "Argentina",
    "Tucuman": "Argentina",
    "Catamarca": "Argentina",
    "La_Rioja": "Argentina",
    "San_Juan": "Argentina",
    "Mendoza": "Argentina",
    "San_Luis": "Argentina",
    "Rio_Gallegos": "Argentina",
    "Ushuaia": "Argentina",
    "Pago_Pago": "Samoa (American)",
    "Vienna": "Austria",
    "Lord_Howe": "Australia",
    "Macquarie": "Australia",
    "Hobart": "Australia",
    "Melbourne": "Australia",
    "Sydney": "Australia",
    "Broken_Hill": "Australia",
    "Brisbane": "Australia",
    "Lindeman": "Australia",
    "Adelaide": "Australia",
    "Darwin": "Australia",
    "Perth": "Australia",
    "Eucla": "Australia",
    "Baku": "Azerbaijan",
    "Barbados": "Barbados",
    "Dhaka": "Bangladesh",
    "Brussels": "Belgium",
    "Sofia": "Bulgaria",
    "Bermuda": "Bermuda",
    "Brunei": "Brunei",
    "La_Paz": "Bolivia",
    "Noronha": "Brazil",
    "Belem": "Brazil",
    "Fortaleza": "Brazil",
    "Recife": "Brazil",
    "Araguaina": "Brazil",
    "Maceio": "Brazil",
    "Bahia": "Brazil",
    "Sao_Paulo": "Brazil",
    "Campo_Grande": "Brazil",
    "Cuiaba": "Brazil",
    "Santarem": "Brazil",
    "Porto_Velho": "Brazil",
    "Boa_Vista": "Brazil",
    "Manaus": "Brazil",
    "Eirunepe": "Brazil",
    "Rio_Branco": "Brazil",
    "Thimphu": "Bhutan",
    "Minsk": "Belarus",
    "Belize": "Belize",
    "St_Johns": "Canada",
    "Halifax": "Canada",
    "Glace_Bay": "Canada",
    "Moncton": "Canada",
    "Goose_Bay": "Canada",
    "Toronto": "Canada",
    "Nipigon": "Canada",
    "Thunder_Bay": "Canada",
    "Iqaluit": "Canada",
    "Pangnirtung": "Canada",
    "Winnipeg": "Canada",
    "Rainy_River": "Canada",
    "Resolute": "Canada",
    "Rankin_Inlet": "Canada",
    "Regina": "Canada",
    "Swift_Current": "Canada",
    "Edmonton": "Canada",
    "Cambridge_Bay": "Canada",
    "Yellowknife": "Canada",
    "Inuvik": "Canada",
    "Dawson_Creek": "Canada",
    "Fort_Nelson": "Canada",
    "Whitehorse": "Canada",
    "Dawson": "Canada",
    "Vancouver": "Canada",
    "Cocos": "Cocos (Keeling) Islands",
    "Zurich": "Switzerland",
    "Abidjan": "Côte d'Ivoire",
    "Rarotonga": "Cook Islands",
    "Santiago": "Chile",
    "Punta_Arenas": "Chile",
    "Easter": "Chile",
    "Shanghai": "China",
    "Urumqi": "China",
    "Bogota": "Colombia",
    "Costa_Rica": "Costa Rica",
    "Havana": "Cuba",
    "Cape_Verde": "Cape Verde",
    "Christmas": "Christmas Island",
    "Nicosia": "Cyprus",
    "Famagusta": "Cyprus",
    "Prague": "Czech Republic",
    "Berlin": "Germany",
    "Copenhagen": "Denmark",
    "Santo_Domingo": "Dominican Republic",
    "Algiers": "Algeria",
    "Guayaquil": "Ecuador",
    "Galapagos": "Ecuador",
    "Tallinn": "Estonia",
    "Cairo": "Egypt",
    "El_Aaiun": "Western Sahara",
    "Madrid": "Spain",
    "Ceuta": "Spain",
    "Canary": "Spain",
    "Helsinki": "Finland",
    "Fiji": "Fiji",
    "Stanley": "Falkland Islands",
    "Chuuk": "Micronesia",
    "Pohnpei": "Micronesia",
    "Kosrae": "Micronesia",
    "Faroe": "Faroe Islands",
    "Paris": "France",
    "London": "Britain (UK)",
    "Tbilisi": "Georgia",
    "Cayenne": "French Guiana",
    "Gibraltar": "Gibraltar",
    "Nuuk": "Greenland",
    "Danmarkshavn": "Greenland",
    "Scoresbysund": "Greenland",
    "Thule": "Greenland",
    "Athens": "Greece",
    "South_Georgia": "South Georgia & the South Sandwich Islands",
    "Guatemala": "Guatemala",
    "Guam": "Guam",
    "Bissau": "Guinea-Bissau",
    "Guyana": "Guyana",
    "Hong_Kong": "Hong Kong",
    "Tegucigalpa": "Honduras",
    "Port-au-Prince": "Haiti",
    "Budapest": "Hungary",
    "Jakarta": "Indonesia",
    "Pontianak": "Indonesia",
    "Makassar": "Indonesia",
    "Jayapura": "Indonesia",
    "Dublin": "Ireland",
    "Jerusalem": "Israel",
    "Kolkata": "India",
    "Chagos": "British Indian Ocean Territory",
    "Baghdad": "Iraq",
    "Tehran": "Iran",
    "Reykjavik": "Iceland",
    "Rome": "Italy",
    "Jamaica": "Jamaica",
    "Amman": "Jordan",
    "Tokyo": "Japan",
    "Nairobi": "Kenya",
    "Bishkek": "Kyrgyzstan",
    "Tarawa": "Kiribati",
    "Kanton": "Kiribati",
    "Kiritimati": "Kiribati",
    "Pyongyang": "Korea (North)",
    "Seoul": "Korea (South)",
    "Almaty": "Kazakhstan",
    "Qyzylorda": "Kazakhstan",
    "Qostanay": "Kazakhstan",
    "Aqtobe": "Kazakhstan",
    "Aqtau": "Kazakhstan",
    "Atyrau": "Kazakhstan",
    "Oral": "Kazakhstan",
    "Beirut": "Lebanon",
    "Colombo": "Sri Lanka",
    "Monrovia": "Liberia",
    "Vilnius": "Lithuania",
    "Luxembourg": "Luxembourg",
    "Riga": "Latvia",
    "Tripoli": "Libya",
    "Casablanca": "Morocco",
    "Monaco": "Monaco",
    "Chisinau": "Moldova",
    "Majuro": "Marshall Islands",
    "Kwajalein": "Marshall Islands",
    "Yangon": "Myanmar (Burma)",
    "Ulaanbaatar": "Mongolia",
    "Hovd": "Mongolia",
    "Choibalsan": "Mongolia",
    "Macau": "Macau",
    "Martinique": "Martinique",
    "Malta": "Malta",
    "Mauritius": "Mauritius",
    "Maldives": "Maldives",
    "Mexico_City": "Mexico",
    "Cancun": "Mexico",
    "Merida": "Mexico",
    "Monterrey": "Mexico",
    "Matamoros": "Mexico",
    "Mazatlan": "Mexico",
    "Chihuahua": "Mexico",
    "Ojinaga": "Mexico",
    "Hermosillo": "Mexico",
    "Tijuana": "Mexico",
    "Bahia_Banderas": "Mexico",
    "Kuala_Lumpur": "Malaysia",
    "Kuching": "Malaysia",
    "Maputo": "Mozambique",
    "Windhoek": "Namibia",
    "Noumea": "New Caledonia",
    "Norfolk": "Norfolk Island",
    "Lagos": "Nigeria",
    "Managua": "Nicaragua",
    "Amsterdam": "Netherlands",
    "Oslo": "Norway",
    "Kathmandu": "Nepal",
    "Nauru": "Nauru",
    "Niue": "Niue",
    "Auckland": "New Zealand",
    "Chatham": "New Zealand",
    "Panama": "Panama",
    "Lima": "Peru",
    "Tahiti": "French Polynesia",
    "Marquesas": "French Polynesia",
    "Gambier": "French Polynesia",
    "Port_Moresby": "Papua New Guinea",
    "Bougainville": "Papua New Guinea",
    "Manila": "Philippines",
    "Karachi": "Pakistan",
    "Warsaw": "Poland",
    "Miquelon": "St Pierre & Miquelon",
    "Pitcairn": "Pitcairn",
    "Puerto_Rico": "Puerto Rico",
    "Gaza": "Palestine",
    "Hebron": "Palestine",
    "Lisbon": "Portugal",
    "Madeira": "Portugal",
    "Azores": "Portugal",
    "Palau": "Palau",
    "Asuncion": "Paraguay",
    "Qatar": "Qatar",
    "Reunion": "Réunion",
    "Bucharest": "Romania",
    "Belgrade": "Serbia",
    "Kaliningrad": "Russia",
    "Moscow": "Russia",
    "Simferopol": "Russia",
    "Kirov": "Russia",
    "Volgograd": "Russia",
    "Astrakhan": "Russia",
    "Saratov": "Russia",
    "Ulyanovsk": "Russia",
    "Samara": "Russia",
    "Yekaterinburg": "Russia",
    "Omsk": "Russia",
    "Novosibirsk": "Russia",
    "Barnaul": "Russia",
    "Tomsk": "Russia",
    "Novokuznetsk": "Russia",
    "Krasnoyarsk": "Russia",
    "Irkutsk": "Russia",
    "Chita": "Russia",
    "Yakutsk": "Russia",
    "Khandyga": "Russia",
    "Vladivostok": "Russia",
    "Ust-Nera": "Russia",
    "Magadan": "Russia",
    "Sakhalin": "Russia",
    "Srednekolymsk": "Russia",
    "Kamchatka": "Russia",
    "Anadyr": "Russia",
    "Riyadh": "Saudi Arabia",
    "Guadalcanal": "Solomon Islands",
    "Mahe": "Seychelles",
    "Khartoum": "Sudan",
    "Stockholm": "Sweden",
    "Singapore": "Singapore",
    "Paramaribo": "Suriname",
    "Juba": "South Sudan",
    "Sao_Tome": "Sao Tome & Principe",
    "El_Salvador": "El Salvador",
    "Damascus": "Syria",
    "Grand_Turk": "Turks & Caicos Is",
    "Ndjamena": "Chad",
    "Kerguelen": "French Southern & Antarctic Lands",
    "Bangkok": "Thailand",
    "Dushanbe": "Tajikistan",
    "Fakaofo": "Tokelau",
    "Dili": "East Timor",
    "Ashgabat": "Turkmenistan",
    "Tunis": "Tunisia",
    "Tongatapu": "Tonga",
    "Istanbul": "Turkey",
    "Funafuti": "Tuvalu",
    "Taipei": "Taiwan",
    "Kiev": "Ukraine",
    "Uzhgorod": "Ukraine",
    "Zaporozhye": "Ukraine",
    "Wake": "US minor outlying islands",
    "New_York": "United States",
    "Detroit": "United States",
    "Louisville": "United States",
    "Monticello": "United States",
    "Indianapolis": "United States",
    "Vincennes": "United States",
    "Winamac": "United States",
    "Marengo": "United States",
    "Petersburg": "United States",
    "Vevay": "United States",
    "Chicago": "United States",
    "Tell_City": "United States",
    "Knox": "United States",
    "Menominee": "United States",
    "Center": "United States",
    "New_Salem": "United States",
    "Beulah": "United States",
    "Denver": "United States",
    "Boise": "United States",
    "Phoenix": "United States",
    "Los_Angeles": "United States",
    "Anchorage": "United States",
    "Juneau": "United States",
    "Sitka": "United States",
    "Metlakatla": "United States",
    "Yakutat": "United States",
    "Nome": "United States",
    "Adak": "United States",
    "Honolulu": "United States",
    "Montevideo": "Uruguay",
    "Samarkand": "Uzbekistan",
    "Tashkent": "Uzbekistan",
    "Caracas": "Venezuela",
    "Ho_Chi_Minh": "Vietnam",
    "Efate": "Vanuatu",
    "Wallis": "Wallis & Futuna",
    "Apia": "Samoa (western)",
    "Johannesburg": "South Africa",
    "Antigua": "Antigua & Barbuda",
    "Anguilla": "Anguilla",
    "Luanda": "Angola",
    "McMurdo": "Antarctica",
    "DumontDUrville": "Antarctica",
    "Syowa": "Antarctica",
    "Aruba": "Aruba",
    "Mariehamn": "Åland Islands",
    "Sarajevo": "Bosnia & Herzegovina",
    "Ouagadougou": "Burkina Faso",
    "Bahrain": "Bahrain",
    "Bujumbura": "Burundi",
    "Porto-Novo": "Benin",
    "St_Barthelemy": "St Barthelemy",
    "Kralendijk": "Caribbean NL",
    "Nassau": "Bahamas",
    "Gaborone": "Botswana",
    "Blanc-Sablon": "Canada",
    "Atikokan": "Canada",
    "Creston": "Canada",
    "Kinshasa": "Congo (Dem. Rep.)",
    "Lubumbashi": "Congo (Dem. Rep.)",
    "Bangui": "Central African Rep.",
    "Brazzaville": "Congo (Rep.)",
    "Douala": "Cameroon",
    "Curacao": "Curaçao",
    "Busingen": "Germany",
    "Djibouti": "Djibouti",
    "Dominica": "Dominica",
    "Asmara": "Eritrea",
    "Addis_Ababa": "Ethiopia",
    "Libreville": "Gabon",
    "Grenada": "Grenada",
    "Guernsey": "Guernsey",
    "Accra": "Ghana",
    "Banjul": "Gambia",
    "Conakry": "Guinea",
    "Guadeloupe": "Guadeloupe",
    "Malabo": "Equatorial Guinea",
    "Zagreb": "Croatia",
    "Isle_of_Man": "Isle of Man",
    "Jersey": "Jersey",
    "Phnom_Penh": "Cambodia",
    "Comoro": "Comoros",
    "St_Kitts": "St Kitts & Nevis",
    "Kuwait": "Kuwait",
    "Cayman": "Cayman Islands",
    "Vientiane": "Laos",
    "St_Lucia": "St Lucia",
    "Vaduz": "Liechtenstein",
    "Maseru": "Lesotho",
    "Podgorica": "Montenegro",
    "Marigot": "St Martin (French)",
    "Antananarivo": "Madagascar",
    "Skopje": "North Macedonia",
    "Bamako": "Mali",
    "Saipan": "Northern Mariana Islands",
    "Nouakchott": "Mauritania",
    "Montserrat": "Montserrat",
    "Blantyre": "Malawi",
    "Niamey": "Niger",
    "Muscat": "Oman",
    "Kigali": "Rwanda",
    "St_Helena": "St Helena",
    "Ljubljana": "Slovenia",
    "Longyearbyen": "Svalbard & Jan Mayen",
    "Bratislava": "Slovakia",
    "Freetown": "Sierra Leone",
    "San_Marino": "San Marino",
    "Dakar": "Senegal",
    "Mogadishu": "Somalia",
    "Lower_Princes": "St Maarten (Dutch)",
    "Mbabane": "Eswatini (Swaziland)",
    "Lome": "Togo",
    "Port_of_Spain": "Trinidad & Tobago",
    "Dar_es_Salaam": "Tanzania",
    "Kampala": "Uganda",
    "Midway": "US minor outlying islands",
    "Vatican": "Vatican City",
    "St_Vincent": "St Vincent",
    "Tortola": "Virgin Islands (UK)",
    "St_Thomas": "Virgin Islands (US)",
    "Aden": "Yemen",
    "Mayotte": "Mayotte",
    "Lusaka": "Zambia",
    "Harare": "Zimbabwe"
}

var userRegion;
var userCity;
var userCountry;
var userTimeZone;

if (Intl) {
    userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    var tzArr = userTimeZone.split("/");
    userRegion = tzArr[0];
    userCity = tzArr[tzArr.length - 1];
    userCountry = timeZoneCityToCountry[userCity];
}


function campoRelation(campo) {
    switch (campo) {
        case "Nome completo":
            return "Nome";
        case "Apelido":
            return "Apelido";
        case "Data Nascimento":
            return "DataNascimento"
        case "Gênero":
            return "Sexo";
        case "Email":
            return "Email";
        case "Fone":
            return "Fone";
        case "Cônjuge":
            return "Conjuge";
        case "Camisa":
            return "Camisa";
        case "Endereço":
            return ["CEP", "Logradouro", "Bairro", "Cidade", "Estado", "Numero", "Complemento", "Referencia"];
        case "Dados da Mãe":
            return ["NomeMae", "FoneMae"];
        case "Dados do Pai":
            return ["NomePai", "FonePai"];
        case "Dados do Contato":
            return ["NomeContato", "FoneContato"];
        case "Dados do Convite":
            return ["NomeConvite", "FoneConvite"];
        case "Parente":
            return "Parente";
        case "Congregação":
            return "Congregacao";
        case "Convênio":
            return ["Convenio", "Hospitais"];
        case "Casamento":
            return "DataCasamento";
        case "Medicação":
            return "Medicacao";
        case "Alergia":
            return "Alergia";
        case "Restrição Alimentar":
            return "RestricaoAlimentar";
        case "Equipe":
            return "Equipe";
        default:
            break;
    }

}

(function ($) {
    var originalVal = $.fn.val;
    $.fn.val = function () {
        var prev;
        if (arguments.length > 0) {
            prev = originalVal.apply(this, []);
        }
        var result = originalVal.apply(this, arguments);
        if ($(this).hasClass('full-date-changed') && arguments.length > 0 && prev != originalVal.apply(this, []))
            $(this).change();  // OR with custom event $(this).trigger('value-changed')

        return result;
    };
})(jQuery);

var fones = []

function getReference(id) {
   return fones.find(fone => fone.id == id)?.reference || null
}

function getNumber(id) {
    return getReference(id)?.getNumber() || ''
}

function setNumber(id, number) {    
    return getReference(id)?.setNumber(number || '')
}


function initInputs() {

    $('.chosen-select').chosen({ width: "100%" });

    $('.full-date').each(function (i, element) {
        $(this).data('index', i)


        $(this).replaceWith(`<div style="position:relative">

<label tab-index="-1" style="position: absolute; top: 10px; right: 10px; cursor: pointer;" for="full-date-changer">

 <span tab-index="-1" id="calendar" class="" aria-hidden="true"> <i style="font-size: 16px; " class="fas fa-calendar"></i></span>
                                                                                      
                                                                                        <input type="text" class="full-date-changer" style="    border: none;
    width: 0;opacity:0;" tab-index="-1" id="full-date-changer" name="full-date-changer" />
                                                                                    </label>

                                
                                ${$(this).prop('outerHTML')}
                            </div>`)
    })


    $('.full-date').each(function (i, element) {
        $(this).removeClass('full-date')
        $(this).addClass('full-date-changed')
    })

    $('[class*="full-date-changer"]').each(function (i, element) {
        $(this).parent().attr("for", `full-date-changer${i}`);
        $(this).attr("id", `full-date-changer${i}`);
        $(this).attr("name", `full-date-changer${i}`);
    })

    $('.full-date-changer').bootstrapMaterialDatePicker({
        time: false, format: "DD/MM/YYYY", shortTime: false, clearButton: false, nowButton: false, lang: 'pt-br'
    })

    $('[id*="full-date-changer"]').on('change', function () {
        $(this).parent().parent().find('.full-date-changed').val($(this).val())
    })

    $('.full-date-changed').on('keyup', function () {
        $(this).parent().find('[id*="full-date-changer"]').val($(this).val())
    })

    $('.full-date-changed').on('change', function () {
        $(this).parent().find('[id*="full-date-changer"]').val($(this).val())
    })

    $('.full-date-time').bootstrapMaterialDatePicker({ time: true, format: "DD/MM/YYYY HH:mm", shortTime: false, clearButton: false, nowButton: false, lang: 'pt-br', })

    $('.full-date').each((i) => {
        IMask($('.full-date')[i], {
            mask: '00/00/0000'
        });
    });

    $('.i-checks-green').iCheck({
        checkboxClass: 'icheckbox_square-green',
        radioClass: 'iradio_square-green'
    });

    $('.i-checks-brown').iCheck({
        checkboxClass: 'icheckbox_square-brown',
        radioClass: 'iradio_square-brown'
    });


    fones = []
    $('.fone').each((i, element) => {


        fones.push({
            id: element.id, reference:
                window.intlTelInput(element, {
                    utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js",
                    preferredCountries: [
                        'br', 'us', 'ca'
                    ],
                    autoInsertDialCode: true,
                    placeholderNumberType: "MOBILE",


                })
        })



    });

    $('.fone').on('focus', function () {
        var $this = $(this),
            // Get active country's phone number format from input placeholder attribute
            activePlaceholder = $this.attr('placeholder'),
            // Convert placeholder as exploitable mask by replacing all 1-9 numbers with 0s
            newMask = activePlaceholder.replace(/[1-9]/g, "0");
        // console.log(activePlaceholder + ' => ' + newMask);

        // Init new mask for focused input
        IMask($this[0], {
            mask: newMask
        });
    });

    $('.cpf').each((i) => {
        IMask($('.cpf')[i], {
            mask: '000.000.000-00'
        });
    });

    $('.cep').each((i) => {
        if (userCountry == "Brazil") {
            IMask($('.cep')[i], {
                mask: '00000-000'
            });
        } else {
            IMask($('.cep')[i], {
                mask: 'a0a-0a0'
            });
        }
    });
}

function getInputSearch(title) {
    return !isMobile ? `<div style="display:flex;flex-direction:column">
<span style="padding: 10px 0;">${title}</span>
<input onmousedown="handleInputSearchMouseDown(event)" onclick="handleInputSearchClick(event)" class="form-control inputSearchDatatable" placeholder="Pesquisar">
</div>` : title
}
function handleInputSearchMouseDown(event) {
    event.stopPropagation()
}

function handleInputSearchClick(event) {
    event.stopPropagation()
}