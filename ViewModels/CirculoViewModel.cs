using System.Collections.Generic;
using Utils.Enums;

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

    public class CirculoCompleteViewModel
    {
        public int Id { get; set; }
        public List<DirigenteViewModel> Dirigentes { get; set; }
        public List<CirculoParticipanteViewModel> Participantes { get; set; }
        public int QtdParticipantes { get; set; }
        public string Titulo { get; set; }
        public string Cor { get; set; }

    }

    public class CirculoParticipanteViewModel
    {
        public int ParticipanteId { get; set; }
        public string Nome { get; set; }
        public int SequencialEvento { get; set; }
        public SexoEnum Sexo { get; set; }
      
        public string Latitude { get; set; }
        public string Longitude { get; set; }
        public string Endereco { get; set; }
        public string Bairro { get; set; }
        public string Cidade { get; set; }
        public string Referencia { get; set; }

    }
}
