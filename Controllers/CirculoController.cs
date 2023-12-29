using System.Linq;
using System.Linq.Dynamic;
using System.Web;
using System.Web.Mvc;
using Arquitetura.Controller;
using Core.Business.Account;
using Core.Business.Circulos;
using Core.Business.Configuracao;
using Core.Business.Equipes;
using Core.Business.Eventos;
using Core.Business.Quartos;
using Core.Business.Reunioes;
using Core.Models.Circulos;
using Core.Models.Reunioes;
using SysIgreja.ViewModels;
using Utils.Constants;
using Utils.Enums;
using Utils.Extensions;
using Utils.Services;

namespace SysIgreja.Controllers
{
    [Authorize]
    public class CirculoController : SysIgrejaControllerBase
    {
        private readonly ICirculosBusiness circulosBusiness;
        private readonly IEquipesBusiness equipesBusiness;
        private readonly IEventosBusiness eventosBusiness;
        private readonly IAccountBusiness accountBusiness;

        public CirculoController(
            ICirculosBusiness circulosBusiness,
            IEquipesBusiness equipesBusiness,
            IEventosBusiness eventosBusiness,
            IAccountBusiness accountBusiness,
            IConfiguracaoBusiness configuracaoBusiness
        )
            : base(eventosBusiness, accountBusiness, configuracaoBusiness)
        {
            this.circulosBusiness = circulosBusiness;
            this.equipesBusiness = equipesBusiness;
            this.eventosBusiness = eventosBusiness;
            this.accountBusiness = accountBusiness;
        }

        public ActionResult Index()
        {
            ViewBag.Title = "Círculos";
            Response.AddHeader("Title", HttpUtility.HtmlEncode(ViewBag.Title));

            return View();
        }

        [HttpPost]
        public ActionResult GetCirculos(
            int EventoId,
            string columnName,
            string columndir,
            string search
        )
        {
            var query = circulosBusiness
                .GetCirculos()
                .Where(x => x.EventoId == EventoId)
                .ToList()
                .Select(
                    x =>
                        new
                        {
                            Id = x.Id,
                            Dirigentes = x.Dirigentes.Select(
                                y =>
                                    new DirigenteViewModel
                                    {
                                        Id = y.Id,
                                        Nome = UtilServices.CapitalizarNome(
                                            y.Equipante.Equipante.Nome
                                        )
                                    }
                            )
                                .ToList(),
                            Participantes = x.Participantes.Select(y => new
                            {
                                Nome = UtilServices.CapitalizarNome(y.Participante.Nome),
                                y.Participante.SequencialEvento,
                                y.Participante.Sexo,
                                ParticipanteId = y.ParticipanteId,
                                Latitude = y.Participante.Latitude,
                                Longitude = y.Participante.Longitude,
                                Endereco = $"{y.Participante.Logradouro} {y.Participante.Numero}",
                                Bairro = y.Participante.Bairro,
                                Cidade = y.Participante.Cidade,
                                Referencia = y.Participante.Referencia
                            }),
                            QtdParticipantes = circulosBusiness
                                .GetParticipantesByCirculos(x.Id)
                                .Count(),
                            Titulo = x.Titulo ?? x.Cor,
                            Cor = x.Cor
                        }
                );

            if (!string.IsNullOrEmpty(search))
            {
                query = query
                    .Where(x => x.Titulo.Contains(search) || x.Cor.Contains(search))
                    .ToList();
            }

            if (!string.IsNullOrEmpty(columnName))
            {
                query = query.OrderBy(columnName + " " + columndir);
            }

            return Json(new { data = query }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult GetDirigentes(int CirculoId)
        {
            var result = circulosBusiness
                .GetDirigentes()
                .Where(x => x.CirculoId == CirculoId)
                .ToList()
                .Select(
                    x =>
                        new
                        {
                            Id = x.Id,
                            Nome = UtilServices.CapitalizarNome(x.Equipante.Equipante.Nome)
                        }
                );

            return Json(new { data = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetCirculo(int Id)
        {
            var result = circulosBusiness
                .GetCirculos()
                .Where(x => x.Id == Id)
                .ToList()
                .Select(
                    x =>
                        new
                        {
                            Dirigentes = x.Dirigentes.Select(
                                y =>
                                    new DirigenteViewModel
                                    {
                                        Id = y.Id,
                                        Nome = UtilServices.CapitalizarNome(
                                            y.Equipante.Equipante.Nome
                                        )
                                    }
                            ),
                            x.Id,
                            x.Titulo,
                            x.EventoId,
                            x.Cor
                        }
                )
                .FirstOrDefault();

            return Json(new { Circulo = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult PostCirculo(PostCirculoModel model)
        {
            circulosBusiness.PostCirculo(model);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult DeleteCirculo(int Id)
        {
            circulosBusiness.DeleteCirculo(Id);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult DistribuirCirculos(int EventoId)
        {
            circulosBusiness.DistribuirCirculos(EventoId);

            return new HttpStatusCodeResult(200);
        }

        [HttpGet]
        public ActionResult GetEquipantes(int EventoId)
        {
            var evento = eventosBusiness.GetEventoById(EventoId);
            if (evento.Configuracao.EquipeCirculoId.HasValue)
            {
                var dirigentes = circulosBusiness
                    .GetDirigentes()
                    .Select(x => x.EquipanteId)
                    .ToList();
                var pgList = equipesBusiness
                    .GetMembrosEvento(EventoId)
                    .Where(x => !dirigentes.Contains(x.Id))
                    .Select(x => new { x.Id, Nome = x.Equipante.Nome })
                    .ToList();

                return Json(new { Equipantes = pgList }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return new HttpStatusCodeResult(200);
            }
        }

        [HttpGet]
        public ActionResult GetParticipantesSemCirculo(int EventoId)
        {
            return Json(
                new
                {
                    Participantes = circulosBusiness
                        .GetParticipantesSemCirculo(EventoId)
                        .OrderBy(x => x.Nome)
                        .Select(x => new { x.Id, x.Nome })
                        .ToList()
                },
                JsonRequestBehavior.AllowGet
            );
        }

        [HttpGet]
        public ActionResult GetCirculosComParticipantes(int EventoId)
        {
            var config = eventosBusiness.GetEventoById(EventoId).Configuracao;
            var query = circulosBusiness
                .GetCirculosComParticipantes(EventoId)
                .ToList()
                .Select(
                    x =>
                        new
                        {
                            Nome = UtilServices.CapitalizarNome(x.Participante.Nome),
                            x.Participante.SequencialEvento,
                            x.Participante.Sexo,
                            x.Circulo.Titulo,
                            ParticipanteId = x.ParticipanteId,
                            Latitude = x.Participante.Latitude,
                            Longitude = x.Participante.Longitude,
                            Endereco = $"{x.Participante.Logradouro} {x.Participante.Numero}",
                            Bairro = x.Participante.Bairro,
                            Cidade = x.Participante.Cidade,
                            Referencia = x.Participante.Referencia,
                            CirculoId = x.CirculoId,
                            Cor = x.Circulo.Cor,
                            Dirigentes = x.Circulo.Dirigentes.Select(
                                y =>
                                    new DirigenteViewModel
                                    {
                                        Id = y.Id,
                                        Nome = UtilServices.CapitalizarNome(
                                            UtilServices.CapitalizarNome(y.Equipante.Equipante.Nome)
                                        )
                                    }
                            ),
                        }
                );

            return Json(
                new
                {
                    Circulos = config.TipoEvento == TipoEventoEnum.Casais
                        ? query.OrderBy(x => x.SequencialEvento).ThenBy(x => x.Sexo).ToList()
                        : query.OrderBy(x => x.Nome).ToList()
                },
                JsonRequestBehavior.AllowGet
            );
            ;
        }

        [HttpPost]
        public ActionResult ChangeCirculo(int ParticipanteId, int? DestinoId)
        {
            circulosBusiness.ChangeCirculo(ParticipanteId, DestinoId);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult AddDirigente(int EquipanteId, int CirculoId)
        {
            var user = circulosBusiness.AddDirigente(EquipanteId, CirculoId);

            var evento = circulosBusiness.GetCirculoById(CirculoId).Evento;

            if (user != null && user.UserName != null)
            {
                return Json(
                    new
                    {
                        User = accountBusiness
                            .GetUsuarios()
                            .Where(x => x.Id == user.Id)
                            .ToList()
                            .Select(
                                x =>
                                    new
                                    {
                                        Id = x.Id,
                                        Senha = x.Senha,
                                        hasChangedPassword = x.HasChangedPassword,
                                        EquipanteId = x.EquipanteId,
                                        UserName = x.UserName,
                                        Fone = x.Equipante.Fone,
                                        Nome = x.Equipante.Nome,
                                        Evento = new
                                        {
                                            Titulo = evento.Configuracao.Titulo,
                                            Numeracao = evento.Numeracao
                                        },
                                        Perfil = "Dirigente"
                                    }
                            )
                            .FirstOrDefault()
                    },
                    JsonRequestBehavior.AllowGet
                );
            }
            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult EsvaziarCirculo(int Id)
        {
            circulosBusiness.EsvaziarCirculo(Id);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult EsvaziarTodosCirculo(int Id)
        {
            circulosBusiness.EsvaziarTodosCirculo(Id);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult DeleteDirigente(int Id)
        {
            circulosBusiness.DeleteDirigente(Id);
            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult SaveGrupo(string grupoId, int circuloId)
        {
            circulosBusiness.SaveGrupo(grupoId, circuloId);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult TogglePresenca(int ParticipanteId, int ReuniaoId)
        {
            circulosBusiness.TogglePresenca(ParticipanteId, ReuniaoId);

            return new HttpStatusCodeResult(200);
        }
    }
}
