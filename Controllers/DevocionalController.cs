using Arquitetura.Controller;
using Arquitetura.ViewModels;
using Core.Business.Account;
using Core.Business.Arquivos;
using Core.Business.Configuracao;
using Core.Business.Devocional;
using Core.Business.Equipantes;
using Core.Business.Equipes;
using Core.Business.Eventos;
using Core.Business.Igrejas;
using Core.Business.Reunioes;
using Core.Models;
using Core.Models.Equipe;
using Core.Models.Igreja;
using Newtonsoft.Json;
using SysIgreja.ViewModels;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web.Mvc;
using Utils.Enums;
using Utils.Extensions;
using Utils.Services;

namespace SysIgreja.Controllers
{

    [Authorize]
    public class DevocionalController : System.Web.Mvc.Controller
    {
        private readonly IDevocionalBusiness devocionalBusiness;
        public DevocionalController(IDevocionalBusiness devocionalBusiness)
        {
            this.devocionalBusiness = devocionalBusiness;
        }

        [HttpGet]
        public async Task<ActionResult> Index()
        {
            var devocional = devocionalBusiness.GetDevocional();
            if (devocional == null)
            {
                using (var client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Accept.Clear();
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    HttpResponseMessage response = await client.GetAsync($"https://www.googleapis.com/youtube/v3/search?key={ConfigurationManager.AppSettings["GoogleKey"]}&part=snippet&maxResults=5&oder=date&channelId={ConfigurationManager.AppSettings["ChannelId"]}");
                    if (response.IsSuccessStatusCode)
                    {
                        string jsondata = await response.Content.ReadAsStringAsync();
                        devocionalBusiness.PostDevocional(new Core.Models.Devocional.PostDevocionalModel { Conteudo = jsondata });
                        return Content(jsondata, "application/json");
                    }
                    return Json(1, JsonRequestBehavior.AllowGet);
                }
            }
            else
            {
                return Content(devocional.Conteudo, "application/json");
            }

        }
    }
}