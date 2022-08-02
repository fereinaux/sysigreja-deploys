using Arquitetura.Controller;
using Arquitetura.ViewModels;
using AutoMapper;
using Core.Business.Account;
using Core.Business.Arquivos;
using Core.Business.Configuracao;
using Core.Business.Eventos;
using Core.Models;
using Core.Models.Eventos;
using Newtonsoft.Json;
using SysIgreja.ViewModels;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web.Mvc;
using Utils.Constants;
using Utils.Enums;
using Utils.Extensions;

namespace SysIgreja.Controllers
{

    [Authorize]
    public class EventoController : SysIgrejaControllerBase
    {
        private readonly IEventosBusiness eventosBusiness;
        private readonly IConfiguracaoBusiness configuracaoBusiness;
        private readonly IArquivosBusiness arquivosBusiness;
        private readonly IMapper mapper;

        public EventoController(IEventosBusiness eventosBusiness, IArquivosBusiness arquivosBusiness, IAccountBusiness accountBusiness,IConfiguracaoBusiness configuracaoBusiness) : base(eventosBusiness, accountBusiness, configuracaoBusiness)
        {
            this.eventosBusiness = eventosBusiness;
            this.arquivosBusiness = arquivosBusiness;
            this.configuracaoBusiness = configuracaoBusiness;
            mapper = new MapperRealidade().mapper;
        }

        public ActionResult Index()
        {
            GetConfiguracoes();
            ViewBag.Title = "Eventos";

            return View();
        }

        [HttpGet]
        public ActionResult GetTipos()
        {
            var result = configuracaoBusiness.GetConfiguracoes().Select(x => new
            {
                x.Id,
                x.Titulo
            }).ToList();


            return Json(new { Tipos = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult GetEventos()
        {
            var user = GetApplicationUser();
            var permissoes = user.Claims.Where(x => x.ClaimType == "Permissões").Select(z => JsonConvert.DeserializeObject<List<Permissoes>>(z.ClaimValue))
                .Select(x => x.Select(y => new { ConfigId = y.ConfiguracaoId, Eventos = y.Eventos, Role = y.Role })).ToList();
            List<int> configId = new List<int>();
            permissoes.ForEach(permissao =>
            {
                configId.AddRange(permissao.Where(x => x.Role == "Admin").Select(x => x.ConfigId));
            });


            var result = eventosBusiness.GetEventos()
                .Where(x => configId.Contains(x.ConfiguracaoId.Value))
                .ToList()
                .Select(x => new EventoViewModel
                {
                    Id = x.Id,
                    DataEvento = x.DataEvento,
                    Numeracao = x.Numeracao,
                    Capacidade = x.Capacidade,
                    TipoEvento = x.Configuracao.Titulo,
                    Status = x.Status.GetDescription(),
                    Valor = x.Valor.ToString("C", CultureInfo.CreateSpecificCulture("pt-BR")),
                    ValorTaxa = x.ValorTaxa.ToString("C", CultureInfo.CreateSpecificCulture("pt-BR")),
                    QtdAnexos = arquivosBusiness.GetArquivosByEvento(x.Id).Count()
                });

            return Json(new { data = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetEvento(int Id)
        {
            var result = eventosBusiness.GetEventoById(Id);



            return Json(new { Evento = mapper.Map<PostEventoModel>(result) }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult ToggleEventoStatus(int Id)
        {
            if (eventosBusiness.ToggleEventoStatus(Id))
            {
                return new HttpStatusCodeResult(200);
            }

            return new HttpStatusCodeResult(400, Mensagens.EventoAberto);

        }

        [HttpPost]
        public ActionResult PostEvento(PostEventoModel model)
        {
            eventosBusiness.PostEvento(model);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult DeleteEvento(int Id)
        {
            eventosBusiness.DeleteEvento(Id);

            return new HttpStatusCodeResult(200);
        }
    }
}