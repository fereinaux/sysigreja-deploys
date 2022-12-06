﻿using Arquitetura.Controller;
using Core.Business.Account;
using Core.Business.Arquivos;
using Core.Business.Configuracao;
using Core.Business.Equipes;
using Core.Business.Eventos;
using Core.Models.Arquivos;
using SysIgreja.ViewModels;
using System.Linq;
using System.Web.Mvc;
using Utils.Constants;
using Utils.Enums;

namespace SysIgreja.Controllers
{

    [Authorize]
    public class ArquivoController : SysIgrejaControllerBase
    {
        private readonly IEventosBusiness eventosBusiness;
        private readonly IEquipesBusiness equipesBusiness;
        private readonly IArquivosBusiness arquivosBusiness;

        public ArquivoController(IEventosBusiness eventosBusiness, IEquipesBusiness equipesBusiness, IArquivosBusiness arquivosBusiness, IAccountBusiness accountBusiness, IConfiguracaoBusiness configuracoesBusiness) : base(eventosBusiness, accountBusiness, configuracoesBusiness)
        {
            this.eventosBusiness = eventosBusiness;
            this.equipesBusiness = equipesBusiness;
            this.arquivosBusiness = arquivosBusiness;
        }

        public ActionResult Index()
        {
            ViewBag.Title = "Arquivos";
            GetConfiguracoes();
            return View();
        }

        public ActionResult Boletim()
        {
            ViewBag.Title = "Boletins";
            GetConfiguracoes();
            return View();
        }


        [HttpPost]
        public ActionResult GetArquivos()
        {
            var query = arquivosBusiness.GetArquivos();

            return MapAqruivos(query);
        }

        [HttpPost]
        public ActionResult GetBoletins()
        {
            var query = arquivosBusiness.GetArquivos().Where(x => x.Categoria == "Boletim").OrderBy(x => x.DataCadastro);

            return MapAqruivos(query);
        }

        [HttpPost]
        public ActionResult GetArquivosLancamento(int Id)
        {
            var query = arquivosBusiness.GetArquivosByLancamento(Id);

            return MapAqruivos(query);
        }

        [HttpPost]
        public ActionResult GetArquivosEquipanteEvento(int eventoid, int? equipanteid, int? equipanteEventoId)
        {
            if (equipanteEventoId.HasValue)
            {
                var equipanteEvento = equipesBusiness.GetEquipanteEvento(equipanteEventoId.Value);
                equipanteid = equipanteEvento.EquipanteId;
            }
            var query = arquivosBusiness.GetArquivosByEquipanteEvento(equipanteid.Value, eventoid);

            return MapAqruivos(query);
        }

        [HttpPost]
        public ActionResult GetArquivosParticipante(int participanteId)
        {
            var query = arquivosBusiness.GetArquivosByParticipante(participanteId);

            return MapAqruivos(query);
        }

        [HttpPost]
        public ActionResult GetArquivosEvento(int Id)
        {
            var query = arquivosBusiness.GetArquivosByEvento(Id);

            return MapAqruivos(query);
        }

        [HttpPost]
        public ActionResult GetArquivosEquipe(int Equipe, bool IsComunEquipe, int ConfiguracaoId)
        {
            var query = arquivosBusiness.GetArquivosByEquipe(Equipe, IsComunEquipe, ConfiguracaoId);

            return MapAqruivos(query);
        }

        [HttpPost]
        public ActionResult GetArquivosComunEquipe(int EventoId)
        {
            var evento = eventosBusiness.GetEventoById(EventoId);
            var query = arquivosBusiness.GetArquivosComunEquipe(evento.ConfiguracaoId.Value);

            return MapAqruivos(query);
        }

        private ActionResult MapAqruivos(IQueryable<Data.Entities.Arquivo> query)
        {
            var result = query.ToList()
                .Select(x => new
                {
                    Id = x.Id,
                    Nome = x.Nome,
                    Extensao = x.Extensao,
                    Data = x.DataCadastro?.ToString("dd/MM/yyyy")
                });

            return Json(new { data = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetArquivo(int Id)
        {
            var arquivo = arquivosBusiness.GetArquivoById(Id);

            return File(arquivo.Conteudo, arquivo.Tipo, arquivo.Nome);
        }

        [HttpPost]
        public int PostArquivo(PostArquivoModel model)
        {
            return arquivosBusiness.PostArquivo(model);
        }

        [HttpPost]
        public ActionResult DeleteArquivo(int Id)
        {
            arquivosBusiness.DeleteArquivo(Id);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult DeleteFotoParticipante(int Id)
        {
            arquivosBusiness.DeleteFotoParticipante(Id);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult DeleteFotoEquipante(int Id)
        {
            arquivosBusiness.DeleteFotoEquipante(Id);

            return new HttpStatusCodeResult(200);
        }
    }
}