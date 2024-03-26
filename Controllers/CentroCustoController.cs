using System.Linq;
using System.Web;
using System.Web.Mvc;
using Arquitetura.Controller;
using AutoMapper;
using Core.Business.Account;
using Core.Business.CentroCusto;
using Core.Business.Configuracao;
using Core.Business.Etiquetas;
using Core.Business.Eventos;
using Core.Models.CentroCusto;
using Core.Models.Configuracao;
using Core.Models.Etiquetas;
using SysIgreja.ViewModels;
using Utils.Enums;
using static Utils.Extensions.EnumExtensions;

namespace SysIgreja.Controllers
{
    [Authorize]
    public class CentroCustoController : SysIgrejaControllerBase
    {
        private readonly ICentroCustoBusiness centroCustoBusiness;
        private readonly IEventosBusiness eventosBusiness;
        private readonly IMapper mapper;

        public CentroCustoController(
            ICentroCustoBusiness centroCustoBusiness,
            IEventosBusiness eventosBusiness,
            IConfiguracaoBusiness configuracaoBusiness,
            IAccountBusiness accountBusiness
        )
            : base(eventosBusiness, accountBusiness, configuracaoBusiness)
        {
            this.centroCustoBusiness = centroCustoBusiness;
            this.eventosBusiness = eventosBusiness;
            mapper = new MapperRealidade().mapper;
        }

        public ActionResult Index()
        {
            ViewBag.Title = "Centros de Custo";
            Response.AddHeader("Title", HttpUtility.HtmlEncode(ViewBag.Title));
            ViewBag.Tipos = GetDescriptions<TiposCentroCustoEnum>().ToList();

            return View();
        }

        [HttpPost]
        public ActionResult GetCentroCustos(int configuracaoId)
        {
            var result = centroCustoBusiness
                .GetCentroCustos(configuracaoId)
                .ToList()
                .Select(x => new CentroCustoViewModel
                {
                    Descricao = x.Descricao,
                    Id = x.Id,
                    Tipo = x.Tipo.GetDescription()
                });

            return Json(new { data = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult GetCentroCustosByEventoId(int eventoid)
        {
            var result = centroCustoBusiness
                .GetCentroCustos(eventosBusiness.GetEventoById(eventoid).ConfiguracaoId.Value)
                .ToList()
                .Select(x => new CentroCustoViewModel
                {
                    Descricao = x.Descricao,
                    Id = x.Id,
                    Tipo = x.Tipo.GetDescription()
                });

            return Json(new { data = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetCentroCusto(int Id)
        {
            return Json(new { CentroCusto = mapper.Map<PostCentroCustoModel>(centroCustoBusiness.GetCentroCustoById(Id))  }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult PostCentroCusto(PostCentroCustoModel model)
        {
            return Json(
                new { CentroCusto = mapper.Map<CentroCustoModel>(centroCustoBusiness.PostCentroCusto(model)) },
                JsonRequestBehavior.AllowGet
            );
        }

        [HttpPost]
        public ActionResult DeleteCentroCusto(int Id)
        {
            centroCustoBusiness.DeleteCentroCusto(Id);

            return new HttpStatusCodeResult(200, "OK");
        }
    }
}
