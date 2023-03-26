using Core.Models.Participantes;
using System.Collections.Generic;

namespace SysIgreja.ViewModels
{
    public class LancamentosViewModel
    {
        public int Id { get; set; }
        public string Descricao { get; set; }
        public string Origem { get; set; }
        public string Observacao { get; set; }
        public string CentroCusto { get; set; }
        public string DataLancamento { get; set; }
        public string Evento { get; set; }
        public string FormaPagamento { get; set; }
        public string Valor { get; set; }
        public int QtdAnexos { get; set; }
        public ICollection<ParticipanteListModel> Participantes { get; set; }
    }
}
