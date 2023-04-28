using Arquitetura.Controller;
using AutoMapper;
using Core.Business.Account;
using Core.Business.Caronas;
using Core.Business.Configuracao;
using Core.Business.Equipantes;
using Core.Business.Equipes;
using Core.Business.Eventos;
using Core.Business.Padrinhos;
using Core.Models.Carona;
using Core.Models.Padrinhos;
using SysIgreja.ViewModels;
using System.Linq;
using System.Linq.Dynamic;
using System.Web.Mvc;
using Utils.Constants;
using Utils.Services;

namespace SysIgreja.Controllers
{

    [Authorize]
    public class PadrinhoController : SysIgrejaControllerBase
    {
        private readonly IPadrinhosBusiness padrinhosBusiness;
        private readonly IAccountBusiness accountBusiness;
        private readonly IEquipesBusiness equipesBusiness;
        private readonly IEquipantesBusiness equipantesBusiness;
        private readonly IMapper mapper;

        public PadrinhoController(IPadrinhosBusiness padrinhosBusiness, IEquipantesBusiness equipantesBusiness, IEquipesBusiness equipesBusiness, IEventosBusiness eventosBusiness, IAccountBusiness accountBusiness, IConfiguracaoBusiness configuracaoBusiness) : base(eventosBusiness, accountBusiness, configuracaoBusiness)
        {
            this.padrinhosBusiness = padrinhosBusiness;
            this.equipesBusiness = equipesBusiness;
            this.accountBusiness = accountBusiness;
            this.equipantesBusiness = equipantesBusiness;
            mapper = new MapperRealidade().mapper;
        }

        public ActionResult Index()
        {
            ViewBag.Title = "Padrinhos";
            GetEventos();

            return View();
        }

        [HttpGet]
        public ActionResult GetEquipantes(int EventoId)
        {
            var padrinhosList = padrinhosBusiness.GetPadrinhos().Where(x => x.EquipanteEvento.EventoId == EventoId).Select(x => x.EquipanteEventoId).ToList();
            var equipantesList = equipesBusiness.GetEquipantesEvento(EventoId).Where(x => !padrinhosList.Contains(x.Id)).Select(x => new { x.Id, Nome = x.Equipante.Nome }).OrderBy(x => x.Nome).ToList();

            return Json(new { Equipantes = equipantesList }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult GetPadrinhos(int EventoId, string columnName, string columndir, string search)
        {
            var query = padrinhosBusiness
             .GetPadrinhos()
             .Where(x => x.EquipanteEvento.EventoId == EventoId);

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(x => x.EquipanteEvento.Equipante.Nome.Contains(search));
            }

            if (!string.IsNullOrEmpty(columnName))
            {

                if (columnName == "Quantidade")
                {
                    if (columndir == "asc")
                        query = query.OrderBy(x => x.Participantes.Count());
                    else
                        query = query.OrderByDescending(x => x.Participantes.Count());

                }
                else if (columnName == "Padrinho")
                {
                    if (columndir == "asc")
                        query = query.OrderBy(x => x.EquipanteEvento.Equipante.Nome);
                    else
                        query = query.OrderByDescending(x => x.EquipanteEvento.Equipante.Nome);

                }
            }


            var queryResult = query
                 .ToList();


            var result = queryResult
           .Select(x => new PadrinhoViewModel
               {
                   Id = x.Id,
                   Quantidade = x.Participantes.Count(),
                   Padrinho = x.EquipanteEvento.Equipante.Nome,
                   PadrinhoId = x.EquipanteEvento.EquipanteId.Value
           });

            return Json(new { data = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetPadrinho(int Id)
        {
            var result = padrinhosBusiness.GetPadrinhoById(Id);

            return Json(new { Padrinho = mapper.Map<PostPadrinhoModel>(result) }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult PostPadrinho(PostPadrinhoModel model)
        {
            var user = padrinhosBusiness.PostPadrinho(model);
            var padrinho = padrinhosBusiness.GetPadrinhos().FirstOrDefault(x => x.EquipanteEventoId == model.EquipanteEventoId);
            var evento = equipesBusiness.GetEquipanteEvento(padrinho.EquipanteEventoId.Value).Evento;

            return Json(new
                {
                    User = accountBusiness.GetUsuarios().Where(x => x.Id == user.Id).ToList().Select(x => new
                    {
                        Id = x.Id,
                        Senha = x.Senha,
                        hasChangedPassword = x.HasChangedPassword,
                        EquipanteId = x.EquipanteId,
                        UserName = x.UserName,
                        Fone = x.Equipante.Fone,
                        Nome = x.Equipante.Nome,
                        Evento = new { Titulo = evento.Configuracao.Titulo, Numeracao = evento.Numeracao },
                        Perfil = "Coordenador"

                    }
                ).FirstOrDefault()
                }, JsonRequestBehavior.AllowGet);
            
        }

        [HttpPost]
        public ActionResult DeletePadrinho(int Id)
        {
            padrinhosBusiness.DeletePadrinho(Id);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult DistribuirPadrinhos(int EventoId)
        {
            padrinhosBusiness.DistribuirPadrinhos(EventoId);

            return new HttpStatusCodeResult(200);
        }

        [HttpGet]
        public ActionResult GetParticipantesSemPadrinho(int EventoId)
        {
            return Json(new
            {
                Participantes = padrinhosBusiness.GetParticipantesSemPadrinho(EventoId).Select(x => new
                {
                    Id = x.Id,
                    Nome = x.Nome
                }).OrderBy(x => x.Nome).ToList()
            }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetPadrinhosComParticipantes(int EventoId)
        {
            return Json(new
            {
                Padrinhos = padrinhosBusiness.GetPadrinhosComParticipantes(EventoId).ToList().Select(x => new
                {
                    Nome = UtilServices.CapitalizarNome(x.Nome),

                    ParticipanteId = x.Id,
                    PadrinhoId = x.PadrinhoId,
                    Padrinho = UtilServices.CapitalizarNome(x.Padrinho.EquipanteEvento.Equipante.Nome)
                }).OrderBy(x => x.PadrinhoId).ThenBy(x => x.Nome).ToList()
            }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult ChangePadrinho(int ParticipanteId, int? DestinoId)
        {
            padrinhosBusiness.ChangePadrinho(ParticipanteId, DestinoId);

            return new HttpStatusCodeResult(200);

        }

        [HttpGet]
        public ActionResult GetParticipantesByPadrinhos(int PadrinhoId)
        {
            var result = padrinhosBusiness.GetParticipantesByPadrinhos(PadrinhoId).ToList().Select(x => new
            {
                Nome = UtilServices.CapitalizarNome(x.Nome),
                Apelido = UtilServices.CapitalizarNome(x.Apelido),
                Padrinho = UtilServices.CapitalizarNome(x.Padrinho.EquipanteEvento.Equipante.Nome),
                Fone = x.Fone
            }).OrderBy(x => x.Padrinho).ThenBy(x => x.Nome);

            return Json(new { data = result }, JsonRequestBehavior.AllowGet);
        }
    }
}