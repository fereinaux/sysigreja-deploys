using Arquitetura.Controller;
using Core.Business.Account;
using Core.Business.Configuracao;
using Core.Business.Equipes;
using Core.Business.Eventos;
using Core.Business.Reunioes;
using Core.Models.Reunioes;
using SysIgreja.ViewModels;
using System.Linq;
using System.Web.Mvc;
using Utils.Constants;
using Utils.Extensions;

namespace SysIgreja.Controllers
{

    [Authorize]
    public class ReuniaoController : SysIgrejaControllerBase
    {
        private readonly IReunioesBusiness reuniaosBusiness;
        private readonly IEquipesBusiness equipesBusiness;

        public ReuniaoController(IReunioesBusiness ReuniaosBusiness, IEquipesBusiness equipesBusiness, IEventosBusiness eventosBusiness, IConfiguracaoBusiness configuracaoBusiness, IAccountBusiness accountBusiness) : base(eventosBusiness, accountBusiness, configuracaoBusiness)
        {
            this.reuniaosBusiness = ReuniaosBusiness;
            this.equipesBusiness = equipesBusiness;
        }

        public ActionResult Index()
        {
            ViewBag.Title = "Reuniões";
            GetEventos();

            return View();
        }

        [HttpPost]
        public ActionResult GetReunioes(int EventoId)
        {
            var result = reuniaosBusiness
                .GetReunioes(EventoId)
                .ToList()
                .Select(x => new ReuniaoViewModel
                {
                    Id = x.Id,
                    DataReuniao = x.DataReuniao,
                    Presenca = x.Presenca.Count(),
                    Pauta = x.Pauta,
                    Titulo = x.Titulo,
                    Equipes = x.Presenca.GroupBy(y => y.EquipanteEvento.Equipe).Select(z => new EquipesModel
                    {
                        Equipe = z.Key.Nome,
                        Presenca = $"{z.Count()}/{equipesBusiness.GetMembrosEquipe(EventoId, GetEquipesFilhas(z.Key.Id, EventoId)).Count()}",
                        PresencaOrder = z.Count()/equipesBusiness.GetMembrosEquipe(EventoId, GetEquipesFilhas(z.Key.Id, EventoId)).Count()
                    }).ToList()
                }); ;

            return Json(new { data = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetReuniao(int Id)
        {
            var result = reuniaosBusiness.GetReuniaoById(Id);
            result.Presenca = null;
            result.Evento = null;
            result.UsuarioCadastroId = null;
            result.UsuarioCadastro = null;
            result.UsuarioDelecao = null;
            result.UsuarioEdicao = null;

            return Json(new { Reuniao = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult PostReuniao(PostReuniaoModel model)
        {
            reuniaosBusiness.PostReuniao(model);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult DeleteReuniao(int Id)
        {
            reuniaosBusiness.DeleteReuniao(Id);

            return new HttpStatusCodeResult(200);
        }
    }
}