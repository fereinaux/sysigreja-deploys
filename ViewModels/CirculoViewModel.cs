using System.Collections.Generic;

namespace SysIgreja.ViewModels
{
    public class CirculoViewModel
    {
        public int Id { get; set; }
        public List<DirigenteViewModel> Dirigentes { get; set; }
        public int QtdParticipantes { get; set; }
        public string Cor { get; set; }
        public string Titulo { get; set; }
    }

    public class DirigenteViewModel
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public string Apelido { get; set; }
        public string Fone { get; set; }
    }
}
