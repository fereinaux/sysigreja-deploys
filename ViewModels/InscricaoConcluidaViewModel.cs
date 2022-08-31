using Core.Models.Configuracao;

namespace SysIgreja.ViewModels
{
    public class InscricaoConcluidaViewModel
    {
        public int Id { get; set; }
        public string Apelido { get; set; }
        public string Logo { get; set; }
        public string Evento { get; set; }
        public string DataEvento { get; set; }
        public string Valor { get; set; }
        public string ValorTaxa { get; set; }
        public string PadrinhoFone { get; internal set; }
        public string PadrinhoNome { get; internal set; }
    }

    public class CategoriaViewModel
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public string Imagem { get; set; }
    }

    public class InscricoesViewModel
    {
        public int Id { get; set; }
        public string Data { get; set; }
        public System.DateTime DataEvento { get; set; }
        public string UrlDestino { get; set; }
        public string Status { get; set; }
        public int Valor { get; set; }
        public int ValorTaxa { get; set; }
        public int Numeracao { get; set; }
        public string Descricao { get; set; }
        public PostConfiguracaoModel Configuracao { get; set; }
    }
}
