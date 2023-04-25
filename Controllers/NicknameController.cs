using Arquitetura.Controller;
using Core.Business.Account;
using Core.Business.Arquivos;
using Core.Business.Configuracao;
using Core.Business.Equipes;
using Core.Business.Eventos;
using Core.Business.Lancamento;
using Core.Business.Participantes;
using Core.Business.Reunioes;
using Core.Models;
using Newtonsoft.Json;
using SysIgreja.ViewModels;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Web;
using System.Web.Mvc;
using Utils.Constants;
using Utils.Enums;
using Utils.Extensions;
using Utils.Services;

namespace SysIgreja.Controllers
{
    [RoutePrefix("")]
    public class NicknameContnroller : System.Web.Mvc.Controller
    {
        private readonly IEventosBusiness eventosBusiness;
     
        public NicknameContnroller(IEventosBusiness eventosBusiness)
        {
            this.eventosBusiness = eventosBusiness;
        }

        [Route("{nickname}")]
        public ActionResult Index(string nickname)
        {
            var evento = eventosBusiness.GetEventos().Where(x => x.Configuracao.Titulo.ToLower() == nickname.ToLower()).LastOrDefault();

            if (evento != null)
            {
                return RedirectToAction("Detalhes", "Inscricoes", new { Id = evento.Id });
            } else
            {
                return RedirectToAction("Index", "Inscricoes");
            }
        }


    }
}