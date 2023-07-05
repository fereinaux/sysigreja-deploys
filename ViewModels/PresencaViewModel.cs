using System.Collections.Generic;

namespace SysIgreja.ViewModels
{
    public class PresencaViewModel
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public string Congregacao { get; set; }
        public string Equipe { get; set; }
        public bool Presenca { get; set; }
        public List<PresencaModel> Reunioes { get; set; }
    }

    public class PresencaModel
    {
        public bool Presenca { get; set; }
        public bool Justificada { get; set; }
    }
}
