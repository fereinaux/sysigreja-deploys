using Arquitetura.Controller;
using AutoMapper;
using Core.Business.Account;
using Core.Business.Configuracao;
using Core.Business.Equipes;
using Core.Business.Eventos;
using Core.Business.Quartos;
using Core.Models.Quartos;
using SysIgreja.ViewModels;
using System.Linq.Dynamic;
using System.Linq;
using System.Web.Mvc;
using Utils.Constants;
using Utils.Enums;
using Utils.Extensions;
using Utils.Services;

namespace SysIgreja.Controllers
{

    [Authorize]
    public class QuartoController : SysIgrejaControllerBase
    {
        private readonly IQuartosBusiness quartosBusiness;
        private readonly IEquipesBusiness equipesBusiness;
        private readonly IMapper mapper;

        public QuartoController(IQuartosBusiness quartosBusiness, IEquipesBusiness equipesBusiness, IEventosBusiness eventosBusiness, IAccountBusiness accountBusiness, IConfiguracaoBusiness configuracaoBusiness) : base(eventosBusiness, accountBusiness, configuracaoBusiness)
        {
            this.quartosBusiness = quartosBusiness;
            this.equipesBusiness = equipesBusiness;
            mapper = new MapperRealidade().mapper;
        }

        public ActionResult Participantes()
        {
            ViewBag.Title = "Quartos dos Participantes";
            GetEventos();

            return View();
        }

        public ActionResult Equipe()
        {
            ViewBag.Title = "Quartos da Equipe";
            GetEventos();

            return View();
        }

        [HttpGet]
        public ActionResult GetEquipantes(int EventoId)
        {
            var responsaveisList = quartosBusiness.GetQuartos().Where(x => x.EventoId == EventoId && x.EquipanteId.HasValue).Select(x => x.EquipanteId).ToList();
            var equipantesList = equipesBusiness.GetEquipantesEvento(EventoId).Where(x => !responsaveisList.Contains(x.EquipanteId)).Select(x => new { x.EquipanteId, Nome = x.Equipante.Nome }).OrderBy(x => x.Nome).ToList();

            return Json(new { Equipantes = equipantesList }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult GetQuartos(int EventoId, TipoPessoaEnum? tipo, string columnName, string columndir, string search)
        {
            var query = quartosBusiness
                .GetQuartos()
                .Where(x => x.EventoId == EventoId && x.TipoPessoa == (tipo ?? TipoPessoaEnum.Participante));

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(x => x.Titulo.ToLower().Contains(search.ToLower()) || (x.Equipante != null && x.Equipante.Nome.ToLower().Contains(search.ToLower())));
            }

            if (!string.IsNullOrEmpty(columnName))
            {
                if (columnName == "Sexo")
                {
                    columndir = columndir == "asc" ? "desc" : "asc";
                }
                if (columnName == "Capacidade")
                {
                    if (columndir == "asc")
                        query = query.OrderBy(x => quartosBusiness.GetParticipantesByQuartos(x.Id, tipo).Count());
                    else
                        query = query.OrderByDescending(x => quartosBusiness.GetParticipantesByQuartos(x.Id, tipo).Count());
                }
                if (columnName == "Equipante")
                {
                    if (columndir == "asc")
                        query = query.OrderBy(x => x.Equipante.Nome);
                    else
                        query = query.OrderByDescending(x => x.Equipante.Nome);
                }
                else
                {
                    query = query.OrderBy(columnName + " " + columndir);

                }
            }


            var queryResult = query
                 .ToList();

            var result = queryResult
            .Select(x => new QuartoViewModel
            {
                Id = x.Id,
                Capacidade = $"{quartosBusiness.GetParticipantesByQuartos(x.Id, tipo).Count().ToString()}/{x.Capacidade.ToString()}",
                Quantidade = quartosBusiness.GetParticipantesByQuartos(x.Id, tipo).Count(),
                EquipanteId = x.EquipanteId,
                Equipante = UtilServices.CapitalizarNome(x.Equipante?.Nome),
                Titulo = x.Titulo,
                Sexo = x.Sexo.GetDescription()
            }); ;

            return Json(new { data = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetQuarto(int Id)
        {
            var result = quartosBusiness.GetQuartoById(Id);

            return Json(new { Quarto = mapper.Map<PostQuartoModel>(result) }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult PostQuarto(PostQuartoModel model)
        {
            quartosBusiness.PostQuarto(model);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult DeleteQuarto(int Id)
        {
            quartosBusiness.DeleteQuarto(Id);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult DistribuirQuartos(int EventoId, TipoPessoaEnum? tipo)
        {
            quartosBusiness.DistribuirQuartos(EventoId, tipo ?? TipoPessoaEnum.Participante);

            return new HttpStatusCodeResult(200);
        }

        [HttpGet]
        public ActionResult GetParticipantesSemQuarto(int EventoId, TipoPessoaEnum? tipo)
        {


            return Json(new
            {
                Participantes = tipo == TipoPessoaEnum.Equipante ? quartosBusiness.GetEquipantesSemQuarto(EventoId).Select(x => new
                {
                    Id = x.Id,
                    Nome = x.Nome
                }).ToList() : quartosBusiness.GetParticipantesSemQuarto(EventoId).Select(x => new
                {
                    Id = x.Id,
                    Nome = x.Nome
                }).ToList()
            }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetQuartosComParticipantes(int EventoId, TipoPessoaEnum? tipo)
        {
            if (tipo == TipoPessoaEnum.Equipante)
            {
                return Json(new
                {
                    Quartos = quartosBusiness.GetQuartosComParticipantes(EventoId, TipoPessoaEnum.Equipante).ToList().Select(x => new
                    {
                        Nome = UtilServices.CapitalizarNome(x.Equipante.Nome),
                        Titulo = x.Quarto.Titulo,
                        Quantidade = quartosBusiness.GetParticipantesByQuartos(x.QuartoId, TipoPessoaEnum.Equipante).Count(),
                        ParticipanteId = x.EquipanteId,
                        QuartoId = x.QuartoId,
                        Sexo = x.Quarto.Sexo.GetDescription(),
                        Capacidade = $"{quartosBusiness.GetParticipantesByQuartos(x.QuartoId, TipoPessoaEnum.Equipante).Count().ToString()}/{x.Quarto.Capacidade.ToString()}",
                    }).ToList()
                }, JsonRequestBehavior.AllowGet);
            }
            else
            {

                return Json(new
                {
                    Quartos = quartosBusiness.GetQuartosComParticipantes(EventoId, TipoPessoaEnum.Participante).ToList().Select(x => new
                    {
                        Nome = UtilServices.CapitalizarNome(x.Participante.Nome),
                        Titulo = x.Quarto.Titulo,
                        Quantidade = quartosBusiness.GetParticipantesByQuartos(x.QuartoId, TipoPessoaEnum.Participante).Count(),
                        ParticipanteId = x.ParticipanteId,
                        QuartoId = x.QuartoId,
                        Sexo = x.Quarto.Sexo.GetDescription(),
                        Capacidade = $"{quartosBusiness.GetParticipantesByQuartos(x.QuartoId, TipoPessoaEnum.Participante).Count().ToString()}/{x.Quarto.Capacidade.ToString()}",
                    }).ToList()
                }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult ChangeQuarto(int ParticipanteId, int? DestinoId, TipoPessoaEnum? tipo)
        {
            var mensagem = quartosBusiness.ChangeQuarto(ParticipanteId, DestinoId, tipo);
            if (mensagem == "OK")
            {
                return new HttpStatusCodeResult(200);
            }

            return new HttpStatusCodeResult(400, mensagem);
        }

        [HttpGet]
        public ActionResult GetEquipantesByQuarto(int QuartoId)
        {
            var result = quartosBusiness.GetParticipantesByQuartos(QuartoId, TipoPessoaEnum.Equipante).OrderBy(x => x.Equipante.Nome).ToList().Select(x => new
            {
                Nome = UtilServices.CapitalizarNome(x.Equipante.Nome),
                Apelido = UtilServices.CapitalizarNome(x.Equipante.Apelido),
                Titulo = x.Quarto.Titulo,
                Quantidade = quartosBusiness.GetParticipantesByQuartos(x.QuartoId, TipoPessoaEnum.Equipante).Count(),
            });

            return Json(new { data = result }, JsonRequestBehavior.AllowGet);
        }
    }
}