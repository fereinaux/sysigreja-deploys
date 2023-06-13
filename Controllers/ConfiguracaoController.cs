using Arquitetura.Controller;
using Core.Business.Account;
using Core.Business.Configuracao;
using Core.Business.Eventos;
using Core.Models;
using Core.Models.Configuracao;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using Utils.Constants;
using Utils.Enums;
using static Utils.Extensions.EnumExtensions;

namespace SysIgreja.Controllers
{

    [Authorize]
    public class ConfiguracaoController : SysIgrejaControllerBase
    {
        private readonly IConfiguracaoBusiness configuracaoBusiness;
        private readonly IEventosBusiness eventoBusiness;

        public ConfiguracaoController(IConfiguracaoBusiness configuracaoBusiness, IEventosBusiness eventoBusiness, IAccountBusiness accountBusiness) : base(eventoBusiness, accountBusiness, configuracaoBusiness)
        {
            this.configuracaoBusiness = configuracaoBusiness;
            this.eventoBusiness = eventoBusiness;
        }

        public ActionResult Index()
        {
            ViewBag.Title = "Parâmetros";

            return View();
        }

        public ActionResult Login()
        {
            GetEventos(new string[] { "Geral" });
            ViewBag.Title = "Login";

            return View();
        }

        public ActionResult Equipes()
        {
            GetEventos(new string[] { "Geral" });
            ViewBag.Title = "Equipes";

            return View();
        }

        [HttpGet]
        public ActionResult GetConfiguracoesSelect()
        {
            var user = GetApplicationUser();
            var permissoes = user.Claims.Where(x => x.ClaimType == "Permissões").Select(z => JsonConvert.DeserializeObject<List<Permissoes>>(z.ClaimValue))
                .Select(x => x.Select(y => new { ConfigId = y.ConfiguracaoId, Eventos = y.Eventos, Role = y.Role })).ToList();
            List<int> configId = new List<int>();
            permissoes.ForEach(permissao =>
            {
                configId.AddRange(permissao.Where(x => x.Role == "Admin").Select(x => x.ConfigId));
            });

            var result = configuracaoBusiness.GetConfiguracoes()
                .Where(x => configId.Contains(x.Id))
                .ToList()
                .Select(x => new {
                    Id = x.Id,
                    Titulo = x.Titulo,
                });

            var jsonRes = Json(new { data = result }, JsonRequestBehavior.AllowGet);
            jsonRes.MaxJsonLength = Int32.MaxValue;
            return jsonRes;
        }

        [HttpGet]
        public ActionResult GetConfiguracoes()
        {
            var user = GetApplicationUser();
            var permissoes = user.Claims.Where(x => x.ClaimType == "Permissões").Select(z => JsonConvert.DeserializeObject<List<Permissoes>>(z.ClaimValue))
                .Select(x => x.Select(y => new { ConfigId = y.ConfiguracaoId, Eventos = y.Eventos, Role = y.Role })).ToList();
            List<int> configId = new List<int>();
            permissoes.ForEach(permissao =>
            {
                configId.AddRange(permissao.Where(x => x.Role == "Admin").Select(x => x.ConfigId));
            });

            var result = configuracaoBusiness.GetConfiguracoes()
                .Where(x => configId.Contains(x.Id))
                .ToList()
                .Select(x => new PostConfiguracaoModel
                {
                    Id = x.Id,
                    Titulo = x.Titulo,
                    Identificador = x.Identificador,
                    BackgroundId = x.BackgroundId,
                    EquipeCirculoId = x.EquipeCirculoId,
                    CentroCustoInscricaoId = x.CentroCustoInscricaoId,
                    CentroCustoTaxaId = x.CentroCustoTaxaId,
                    PublicTokenMercadoPago = x.PublicTokenMercadoPago,
                    AccessTokenMercadoPago = x.AccessTokenMercadoPago,
                    CorBotao = x.CorBotao,
                    CorHoverBotao = x.CorHoverBotao,
                    TipoCirculoId = x.TipoCirculo,
                    TipoCirculo = x.TipoCirculo.GetDescription(),
                    TipoQuartoId = x.TipoQuarto,
                    TipoQuarto = x.TipoQuarto?.GetDescription(),
                    TipoEventoId = x.TipoEvento,
                    TipoEvento = x.TipoEvento?.GetDescription(),
                    CentroCustos = x.CentroCustos.Select(y => new CentroCustoModel
                    {
                        Descricao = y.Descricao,
                        Tipo = y.Tipo.GetDescription(),
                        Id = y.Id
                    }).ToList(),
                    LogoId = x.LogoId,
                    LogoRelatorioId = x.LogoRelatorioId,
                    Logo = x.Logo != null ? Convert.ToBase64String(x.Logo.Conteudo) : "",
                    Background = x.Background != null ? Convert.ToBase64String(x.Background.Conteudo) : "",
                    LogoRelatorio = x.LogoRelatorio != null ? Convert.ToBase64String(x.LogoRelatorio.Conteudo) : "",
                    MsgConclusao = x.MsgConclusao,
                    MsgConclusaoEquipe = x.MsgConclusaoEquipe,                    

                });

            var jsonRes = Json(new { data = result }, JsonRequestBehavior.AllowGet);
            jsonRes.MaxJsonLength = Int32.MaxValue;
            return jsonRes;
        }

        [HttpGet]
        public ActionResult GetConfiguracao(int? Id)
        {
            var result = configuracaoBusiness.GetConfiguracao(Id);

            var jsonRes = Json(new { Configuracao = result }, JsonRequestBehavior.AllowGet);
            jsonRes.MaxJsonLength = Int32.MaxValue;
            return jsonRes;
        }

        [HttpGet]
        public ActionResult GetConfiguracaoResumido(int? Id)
        {
            var result = configuracaoBusiness.GetConfiguracaoResumido(Id);

            var jsonRes = Json(new { Configuracao = result }, JsonRequestBehavior.AllowGet);
            jsonRes.MaxJsonLength = Int32.MaxValue;
            return jsonRes;
        }


        [HttpGet]
        public ActionResult GetConfiguracaoByEventoId(int Id)
        {
            var result = configuracaoBusiness.GetConfiguracaoByEventoId(Id);

            var jsonRes = Json(new { Configuracao = result }, JsonRequestBehavior.AllowGet);
            jsonRes.MaxJsonLength = Int32.MaxValue;
            return jsonRes;
        }



        [HttpGet]
        public ActionResult GetCamposByEventoId(int id)
        {
            var evento = eventoBusiness.GetEventoById(id);
            var result = configuracaoBusiness.GetCampos(evento.ConfiguracaoId.Value);

            return Json(new { Campos = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetCamposEquipeByEventoId(int id)
        {
            if (id == 999)
            {
                List<CamposModel> campos = new List<CamposModel>
                {
                    new CamposModel{
                        CampoId = CamposEnum.Nome,
                        Campo = CamposEnum.Nome.GetDescription(),
                    },
                    new CamposModel{
                        CampoId = CamposEnum.Email,
                        Campo = CamposEnum.Email.GetDescription(),
                    },
                    new CamposModel{
                        CampoId = CamposEnum.Fone,
                        Campo = CamposEnum.Fone.GetDescription(),
                    },
                    new CamposModel{
                        CampoId = CamposEnum.Genero,
                        Campo = CamposEnum.Genero.GetDescription(),
                    },
                    new CamposModel{
                        CampoId = CamposEnum.DataNascimento,
                        Campo = CamposEnum.DataNascimento.GetDescription(),
                    }
                };

                return Json(new { Campos = campos }, JsonRequestBehavior.AllowGet);
            } else
            {


            var evento = eventoBusiness.GetEventoById(id);
            var result = configuracaoBusiness.GetCamposEquipe(evento.ConfiguracaoId.Value);

            return Json(new { Campos = result }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public ActionResult GetCampos(int id)
        {
            var result = configuracaoBusiness.GetCampos(id);

            return Json(new { Campos = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetCamposEquipe(int id)
        {
            var result = configuracaoBusiness.GetCamposEquipe(id);

            return Json(new { Campos = result }, JsonRequestBehavior.AllowGet);
        }


        [HttpGet]
        public ActionResult GetEquipes(int id)
        {
            var result = configuracaoBusiness.GetEquipes(id);

            return Json(new { Equipes = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetIgrejas(int id)
        {
            var result = configuracaoBusiness.GetIgrejas(id);

            return Json(new { Igrejas = result }, JsonRequestBehavior.AllowGet);
        }


        [HttpGet]
        public ActionResult GetCamposEnum()
        {
            var result = GetDescriptions<CamposEnum>();

            return Json(new { Campos = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult PostCampos(List<CamposModel> campos, int id)
        {
            configuracaoBusiness.PostCampos(campos, id);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult PostCamposEquipe(List<CamposModel> campos, int id)
        {
            configuracaoBusiness.PostCamposEquipe(campos, id);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult PostEquipes(List<EquipesModel> equipes, int id)
        {
            configuracaoBusiness.PostEquipes(equipes, id);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult PostIgrejas(List<IgrejasModel> igrejas, int id)
        {
            configuracaoBusiness.PostIgrejas(igrejas, id);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult PostConfiguracao(PostConfiguracaoModel model)
        {
            configuracaoBusiness.PostConfiguracao(model);

            return new HttpStatusCodeResult(200);
        }

        [HttpGet]
        public ActionResult GetLogin()
        {
            var result = configuracaoBusiness.GetLogin();

            var jsonRes = Json(new { Login = result }, JsonRequestBehavior.AllowGet);
            jsonRes.MaxJsonLength = Int32.MaxValue;
            return jsonRes;
        }

        [HttpPost]
        public ActionResult PostLogin(PostLoginModel model)
        {
            configuracaoBusiness.PostLogin(model);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult PostLogoLogin(int sourceId)
        {
            configuracaoBusiness.PostLogoLogin(sourceId);

            return new HttpStatusCodeResult(200);
        }


        [HttpPost]
        public ActionResult PostBackgroundLogin( int sourceId)
        {
            configuracaoBusiness.PostBackgroundLogin(sourceId);

            return new HttpStatusCodeResult(200);
        }
        [HttpPost]
        public ActionResult PostBackgroundCelularLogin(int sourceId)
        {
            configuracaoBusiness.PostBackgroundCelularLogin(sourceId);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult PostLogo(int id, int sourceId)
        {
            configuracaoBusiness.PostLogo(sourceId, id);

            return new HttpStatusCodeResult(200);
        }


        [HttpPost]
        public ActionResult PostBackground(int id, int sourceId)
        {
            configuracaoBusiness.PostBackground(sourceId, id);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult PostLogoRelatorio(int id, int sourceId)
        {
            configuracaoBusiness.PostLogoRelatorio(sourceId, id);

            return new HttpStatusCodeResult(200);
        }


    }
}