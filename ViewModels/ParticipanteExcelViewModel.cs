﻿using System.ComponentModel;

namespace SysIgreja.ViewModels
{
    public class ParticipanteExcelViewModel
    {
        public string Nome { get; set; }
        public string Apelido { get; set; }
        [DisplayName("Data de Nascimento")]
        public string DataNascimento { get; set; }
        public int Idade { get; set; }
        public string Sexo { get; set; }
        public string Email { get; set; }
        public string Fone { get; set; }
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

        [DisplayName("Situação")]
        public string Situacao { get; set; }
        [DisplayName("Vacina")]
        public string HasVacina { get; set; }

    }
}
