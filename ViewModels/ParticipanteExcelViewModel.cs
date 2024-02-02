using System.Collections.Generic;
using System.ComponentModel;

namespace SysIgreja.ViewModels
{
    public class ParticipanteExcelViewModel
    {
        [DisplayName("Sequencial")]
        public int SequencialEvento { get; set; }
        public string Nome { get; set; }
        public string Apelido { get; set; }

        [DisplayName("Data de Nascimento")]
        public string DataNascimento { get; set; }
        public int Idade { get; set; }
        public string Sexo { get; set; }
        public string Email { get; set; }
        public string Fone { get; set; }

        [DisplayName("Cônjuge")]
        public string Conjuge { get; set; }
        public string Instagram { get; set; }

        [DisplayName("Tamanho da Camisa")]
        public string Camisa { get; set; }
        public string CEP { get; set; }
        public string Logradouro { get; set; }
        public string Bairro { get; set; }
        public string Cidade { get; set; }
        public string Estado { get; set; }

        [DisplayName("Número")]
        public string Numero { get; set; }
        public string Complemento { get; set; }

        [DisplayName("Referência")]
        public string Referencia { get; set; }

        [DisplayName("Nome do Pai")]
        public string NomePai { get; set; }

        [DisplayName("Fone do Pai")]
        public string FonePai { get; set; }

        [DisplayName("Nome da Mãe")]
        public string NomeMae { get; set; }

        [DisplayName("Fone da Mãe")]
        public string FoneMae { get; set; }

        [DisplayName("Nome do Contato")]
        public string NomeContato { get; set; }

        [DisplayName("Fone do Contato")]
        public string FoneContato { get; set; }

        [DisplayName("Nome de quem Convidou")]
        public string NomeConvite { get; set; }

        [DisplayName("Fone de quem Convidou")]
        public string FoneConvite { get; set; }

        [DisplayName("Restrição Alimentar")]
        public string RestricaoAlimentar { get; set; }

        [DisplayName("Medicação")]
        public string Medicacao { get; set; }
        public string Alergia { get; set; }

        [DisplayName("Convênio")]
        public string Convenio { get; set; }

        [DisplayName("Data de Casamento")]
        public string DataCasamento { get; set; }

        [DisplayName("Hospitais")]
        public string Hospitais { get; set; }

        [DisplayName("Situação")]
        public string Situacao { get; set; }

        [DisplayName("Congregação")]
        public string Congregacao { get; set; }

        [DisplayName("Círculo")]
        public string Circulo { get; set; }
        public string Motorista { get; set; }

        [DisplayName("Data/Hora Inscrição")]
        public string DataCadastro { get; set; }
        public string Parente { get; set; }
        public string Padrinho { get; set; }
        public string Quarto { get; set; }
        public Dictionary<string, string> CamposCustomizados { get; set; }
    }
}
