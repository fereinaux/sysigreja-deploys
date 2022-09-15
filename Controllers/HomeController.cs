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

    [Authorize]
    public class HomeController : SysIgrejaControllerBase
    {
        private readonly IEquipesBusiness equipesBusiness;
        private readonly IParticipantesBusiness participantesBusiness;
        private readonly ILancamentoBusiness lancamentoBusiness;
        private readonly IReunioesBusiness reunioesBusiness;
        private readonly IEventosBusiness eventosBusiness;
        private readonly IArquivosBusiness arquivosBusiness;
        private readonly IAccountBusiness accountBusiness;

        public HomeController(IEquipesBusiness equipesBusiness, IParticipantesBusiness participantesBusiness, IArquivosBusiness arquivosBusiness, ILancamentoBusiness lancamentoBusiness, IEventosBusiness eventosBusiness, IAccountBusiness accountBusiness, IReunioesBusiness reunioesBusiness, IConfiguracaoBusiness configuracaoBusiness) : base(eventosBusiness, accountBusiness, configuracaoBusiness)
        {
            this.lancamentoBusiness = lancamentoBusiness;
            this.participantesBusiness = participantesBusiness;
            this.equipesBusiness = equipesBusiness;
            this.eventosBusiness = eventosBusiness;
            this.accountBusiness = accountBusiness;
            this.reunioesBusiness = reunioesBusiness;
            this.arquivosBusiness = arquivosBusiness;
        }

        [Authorize]
        public ActionResult Admin()
        {
            ViewBag.Title = "Sistema de Gestão";

            GetEventos(new string[] { "Financeiro", "Admin", "Geral", "Administrativo" });
            return View();
        }

        [HttpGet]
        public ActionResult GetResultadosAdmin(int EventoId)
        {
            var evento = eventosBusiness.GetEventoById(EventoId);

            var result = new
            {

                Evento = evento.Status.GetDescription(),
                EventoOferta = evento.EventoLotes.Any() && evento.EventoLotes.OrderByDescending(x => x.Valor).FirstOrDefault().Valor > evento.Valor ?
                evento.EventoLotes.OrderByDescending(x => x.Valor).FirstOrDefault().Valor :
                evento.Valor,
                Confirmados = participantesBusiness.GetParticipantesByEvento(EventoId).Where(x => x.Status == StatusEnum.Confirmado).Count(),
                Cancelados = participantesBusiness.GetParticipantesByEvento(EventoId).Where(x => x.Status == StatusEnum.Cancelado).Count(),
                Espera = participantesBusiness.GetParticipantesByEvento(EventoId).Where(x => x.Status == StatusEnum.Espera).Count(),
                Presentes = participantesBusiness.GetParticipantesByEvento(EventoId).Where(x => x.Checkin).Count(),
                Total = participantesBusiness.GetParticipantesByEvento(EventoId).Where(x => x.Status != StatusEnum.Cancelado && x.Status != StatusEnum.Espera).Count(),
                Meninos = participantesBusiness.GetParticipantesByEvento(EventoId).Where(x => x.Sexo == SexoEnum.Masculino && x.Status != StatusEnum.Cancelado && x.Status != StatusEnum.Espera).Count(),
                Meninas = participantesBusiness.GetParticipantesByEvento(EventoId).Where(x => x.Sexo == SexoEnum.Feminino && x.Status != StatusEnum.Cancelado && x.Status != StatusEnum.Espera).Count(),
                MeiosPagamento = lancamentoBusiness.GetLancamentos().Where(x => x.EventoId == EventoId && x.Valor > 0).Select(x => x.MeioPagamento.Descricao).Distinct(),
                Financeiro = lancamentoBusiness.GetLancamentos().Where(x => x.EventoId == EventoId && x.Valor > 0).Select(x => new
                {
                    MeioPagamento = x.MeioPagamento.Descricao,
                    Valor = x.Valor,
                    Tipo = x.Tipo
                }).GroupBy(x => new
                {
                    x.Tipo,
                    x.MeioPagamento
                })
                .Select(x => new
                {
                    Tipo = x.Key.Tipo,
                    MeioPagamento = x.Key.MeioPagamento,
                    Valor = x.Sum(y => y.Valor)
                })
                .ToList()
                .Select(x => new
                {
                    Tipo = x.Tipo.GetDescription(),
                    MeioPagamento = x.MeioPagamento,
                    Valor = x.Valor
                })
                .OrderByDescending(x => x.Tipo),
                UltimosInscritos = participantesBusiness.GetParticipantesByEvento(EventoId).Where(x => x.Status != StatusEnum.Cancelado)
                .OrderByDescending(x => x.DataCadastro).Take(5).ToList().Select(x => new ParticipanteViewModel
                {
                    Nome = UtilServices.CapitalizarNome(x.Nome),
                    Sexo = x.Sexo.GetDescription(),
                    Idade = UtilServices.GetAge(x.DataNascimento)
                }).ToList(),
                EquipeMeninos = equipesBusiness.GetEquipantesEvento(EventoId).Where(x => x.Equipante.Sexo == SexoEnum.Masculino).Count(),
                EquipeMeninas = equipesBusiness.GetEquipantesEvento(EventoId).Where(x => x.Equipante.Sexo == SexoEnum.Feminino).Count(),
                Equipes = equipesBusiness.GetEquipes(EventoId).ToList().Select(x => new ListaEquipesViewModel
                {
                    Id = x.Id,
                    Equipe = x.Nome,
                    QuantidadeMembros = equipesBusiness.GetMembrosEquipe(EventoId, x.Id).Count()
                }).ToList(),
                Reunioes = reunioesBusiness.GetReunioes(EventoId).ToList().Select(x => new ReuniaoViewModel
                { 
                    Id = x.Id,
                    DataReuniao = x.DataReuniao,
                    Titulo = x.Titulo,
                    Presenca = x.Presenca.Count()
                }).OrderBy(x => x.DataReuniao).ToList()
            };

            return Json(new
            {
                result
            }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetDetalhamentoEvento(int EventoId)
        {
            var result = new
            {
                Equipantes = equipesBusiness
                .GetEquipantesEvento(EventoId)
                .OrderBy(x => x.Equipe.Nome)
                .ThenBy(x => x.Tipo)
                .ThenBy(x => x.Equipante.Nome)
                .ToList()
                .Select(x => new
                {
                    Equipe = x.Equipe.Nome,
                    Nome = x.Equipante.Nome,
                    Tipo = x.Tipo.GetDescription(),
                    Fone = x.Equipante.Fone
                })
            };


            return Json(new { result }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult CoordenadorGet(int eventoId)
        {
        
            var user = GetApplicationUser();
            var equipanteEvento = equipesBusiness.GetEquipanteEventoByUser(eventoId, user.Id);
            var membrosEquipe = equipesBusiness.GetMembrosEquipe(eventoId, equipanteEvento.EquipeId.Value);
            var result = new
            {
                Equipe = equipanteEvento.Equipe.Nome,
                EquipeEnum = equipanteEvento.EquipeId,
                QtdMembros = membrosEquipe.Count(),
                Configuracao = new
                {
                    Titulo = equipanteEvento.Evento.Configuracao.Titulo,
                    Id =
                equipanteEvento.Evento.ConfiguracaoId.Value,
                    Cor = equipanteEvento.Evento.Configuracao.CorBotao,
                    Logo = equipanteEvento.Evento.Configuracao.Logo != null ? Convert.ToBase64String(equipanteEvento.Evento.Configuracao.Logo.Conteudo) : ""
                },
                Reunioes = reunioesBusiness.GetReunioes(eventoId)
                .ToList()
                .OrderBy(x => DateTime.Now.AddHours(4).Subtract(x.DataReuniao).TotalDays < 0 ? DateTime.Now.AddHours(4).Subtract(x.DataReuniao).TotalDays * -1 : DateTime.Now.AddHours(4).Subtract(x.DataReuniao).TotalDays)
                .Select(x => new { DataReuniao = x.DataReuniao.ToString("dd/MM/yyyy"), Id = x.Id }),
                Membros = membrosEquipe.ToList().Select(x => new EquipanteViewModel
                {
                    Id = x.Equipante.Id,
                    Sexo = x.Equipante.Sexo.GetDescription(),
                    Fone = x.Equipante.Fone,
                    Idade = UtilServices.GetAge(x.Equipante.DataNascimento),
                    Nome = x.Equipante.Nome,
                    Vacina = x.Equipante.HasVacina,
                    Faltas = reunioesBusiness.GetFaltasByEquipanteId(x.EquipanteId.Value, eventoId),
                    Oferta = lancamentoBusiness.GetPagamentosEquipante(x.EquipanteId.Value, x.EventoId.Value).Any(),
                })
            };


            var jsonRes = Json(new { result }, JsonRequestBehavior.AllowGet);
            jsonRes.MaxJsonLength = Int32.MaxValue;
            return jsonRes;            
        }
        public ActionResult Coordenador()
        {
            ViewBag.Title = "Coordenador";
            var user = GetApplicationUser();
            var equipanteEvento = equipesBusiness.GetCoordByUser(user.Id).OrderByDescending(x => x.Evento.DataEvento);
            if (equipanteEvento.Count() > 0)
            {

                ViewBag.Eventos = equipanteEvento.Select(x => x.Evento);
                ViewBag.Equipante = equipanteEvento.Select(x => x.Equipante).FirstOrDefault();
                return View();
            }
            else
            {
                return NaoAutorizado();
            }
        }

        [HttpGet]
        public ActionResult GetPresenca(int ReuniaoId)
        {
            var presenca = equipesBusiness.GetPresenca(ReuniaoId).Select(x => x.EquipanteEventoId).ToList();

            var user = GetApplicationUser();
            var eventoId = reunioesBusiness.GetReuniaoById(ReuniaoId).EventoId;

            var result = equipesBusiness
                .GetMembrosEquipe(eventoId, equipesBusiness.GetEquipanteEventoByUser(eventoId, user.Id).EquipeId.Value).ToList().Select(x => new PresencaViewModel
                {
                    Id = x.Id,
                    Nome = x.Equipante.Nome,
                    Presenca = presenca.Contains(x.Id)
                });

            return Json(new { result }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult TogglePresenca(int EquipanteEventoId, int ReuniaoId)
        {
            equipesBusiness.TogglePresenca(EquipanteEventoId, ReuniaoId);

            return new HttpStatusCodeResult(200);
        }

        public ActionResult Index()
        {
            var user = GetApplicationUser();
            var permissoes = JsonConvert.DeserializeObject<List<Permissoes>>(user.Claims.Where(y => y.ClaimType == "Permissões").FirstOrDefault().ClaimValue);
            if (permissoes.Any(x => new string[] { "Admin", "Geral", }.Contains(x.Role) || x.Eventos.Any(y => new string[] { "Admin", "Geral", "Administrativo", "Financeiro" }.Contains(y.Role))))
            {
                return RedirectToAction("Admin", "Home");
            }
            else
            {
                return RedirectToAction("Coordenador", "Home");
            }

        }
    }
}