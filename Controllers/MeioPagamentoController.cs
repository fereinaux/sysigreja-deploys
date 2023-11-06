using Arquitetura.Controller;
using Core.Business.Account;
using Core.Business.Configuracao;
using Core.Business.Eventos;
using Core.Business.MeioPagamento;
using Core.Models.MeioPagamento;
using System.Linq;
using System.Web.Mvc;
using Utils.Constants;

namespace SysIgreja.Controllers
{

    [Authorize]
    public class MeioPagamentoController : SysIgrejaControllerBase
    {
        private readonly IMeioPagamentoBusiness meioPagamentosBusiness;

        public MeioPagamentoController(IMeioPagamentoBusiness meioPagamentosBusiness, IConfiguracaoBusiness configuracaoBusiness, IEventosBusiness eventosBusiness, IAccountBusiness accountBusiness) : base(eventosBusiness, accountBusiness, configuracaoBusiness)
        {
            this.meioPagamentosBusiness = meioPagamentosBusiness;
        }

        public ActionResult Index()
        {
            ViewBag.Title = "Formas de Pagamento";
            Response.AddHeader("Title", ViewBag.Title);
            GetConfiguracoes(new string[] {  "Financeiro" });
            return View();
        }

        [HttpPost]
        public ActionResult GetMeioPagamentos(int configuracaoId)
        {
            var result = meioPagamentosBusiness.GetMeioPagamentos(configuracaoId).Select(x => new
            {
                x.Id, x.Descricao
            });

            return Json(new { data = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetMeioPagamento(int Id)
        {
            var result = meioPagamentosBusiness.GetMeioPagamentoById(Id);

            return Json(new { MeioPagamento = result }, JsonRequestBehavior.AllowGet);
        }


        [HttpPost]
        public ActionResult PostMeioPagamento(PostMeioPagamentoModel model)
        {
            meioPagamentosBusiness.PostMeioPagamento(model);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult DeleteMeioPagamento(int Id)
        {
            meioPagamentosBusiness.DeleteMeioPagamento(Id);

            return new HttpStatusCodeResult(200);
        }
    }
}