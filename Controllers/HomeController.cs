using Arquitetura.Controller;
using Arquitetura.ViewModels;
using Core.Business.Account;
using Core.Business.Arquivos;
using Core.Business.Configuracao;
using Core.Business.Equipes;
using Core.Business.Eventos;
using Core.Business.Lancamento;
using Core.Business.Participantes;
using Core.Business.Reunioes;
using Core.Models;
using Data.Entities;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using SysIgreja.ViewModels;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Globalization;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
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
        private readonly IImageService imageService;
        private readonly IReunioesBusiness reunioesBusiness;
        private readonly IEventosBusiness eventosBusiness;
        private readonly IArquivosBusiness arquivosBusiness;
        private readonly IAccountBusiness accountBusiness;

        public HomeController(IEquipesBusiness equipesBusiness, IImageService imageService, IParticipantesBusiness participantesBusiness, IArquivosBusiness arquivosBusiness, ILancamentoBusiness lancamentoBusiness, IEventosBusiness eventosBusiness, IAccountBusiness accountBusiness, IReunioesBusiness reunioesBusiness, IConfiguracaoBusiness configuracaoBusiness) : base(eventosBusiness, accountBusiness, configuracaoBusiness)
        {
            this.lancamentoBusiness = lancamentoBusiness;
            this.imageService = imageService;
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
            Response.AddHeader("Title", HttpUtility.HtmlEncode(ViewBag.Title));

            return View();
        }

        [HttpGet]
        public ActionResult GetResultadosGeral()
        {
            var eventos = eventosBusiness.GetEventosComImagens().ToList().Select(x => new
            {
                Id = x.Id,
                Evento = $"{(x.Numeracao > 0 ? $"{x.Numeracao}º " : string.Empty)}{x.Configuracao.Titulo}",
                Logo = x.Configuracao?.Logo != null ? imageService.ResizeImage(x.Configuracao?.Logo?.Conteudo, 50) : "",
                Background = x.Configuracao?.Background != null ? imageService.ResizeImage(x.Configuracao?.Background?.Conteudo, 150) : "",
                Cor = x.Configuracao.CorBotao,
                CorHover = x.Configuracao.CorHoverBotao,
                Data = x.DataEvento.ToString("yyyy-MM-dd")
            });

            var result = new
            {
                Eventos = eventos
            };
            return Json(new
            {
                result
            }, JsonRequestBehavior.AllowGet);
        }


        [HttpGet]
        public ActionResult GetResumoFinanceiroEvento(int EventoId)
        {
            var result = new
            {
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
                .OrderByDescending(x => x.Tipo)
            };

            return Json(new
            {
                result
            }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetParticipantesEvento(int EventoId)
        {

            var evento = eventosBusiness.GetEventoById(EventoId);

            if (evento.Configuracao.TipoEvento == TipoEventoEnum.Casais)
            {
                var resultCasais = participantesBusiness
   .GetParticipantesByEvento(EventoId);

                var queryCasais = resultCasais.Select(x => new
                {
                    Conjuge = resultCasais.FirstOrDefault(y => y.Nome == x.Conjuge),
                    Nome = x
                }).Select(x => new
                {
                    Homem = x.Nome.Sexo == SexoEnum.Masculino ? x.Nome : (x.Conjuge != null ? x.Conjuge : null),
                    Mulher = x.Nome.Sexo == SexoEnum.Feminino ? x.Nome : (x.Conjuge != null ? x.Conjuge : null),
                }).Distinct();

                var casais = queryCasais.Where(x => x.Homem != null && x.Mulher != null);

                var result = new
                {
                    Confirmados = casais.Where(x => x.Homem.Status == StatusEnum.Confirmado).Count(),
                    Cancelados = casais.Where(x => x.Homem.Status == StatusEnum.Cancelado).Count(),
                    Espera = casais.Where(x => x.Homem.Status == StatusEnum.Espera).Count(),
                    Presentes = casais.Where(x => x.Homem.Checkin).Count(),
                    Total = casais.Where(x => x.Homem.Status != StatusEnum.Cancelado && x.Homem.Status != StatusEnum.Espera).Count(),
                    Meninos = 0,
                    Meninas = 0,
                    Tipo = "Casais"

                };

                return Json(new
                {
                    result
                }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                var result = new
                {
                    Confirmados = participantesBusiness.GetParticipantesByEvento(EventoId).Where(x => x.Status == StatusEnum.Confirmado).Count(),
                    Cancelados = participantesBusiness.GetParticipantesByEvento(EventoId).Where(x => x.Status == StatusEnum.Cancelado).Count(),
                    Espera = participantesBusiness.GetParticipantesByEvento(EventoId).Where(x => x.Status == StatusEnum.Espera).Count(),
                    Presentes = participantesBusiness.GetParticipantesByEvento(EventoId).Where(x => x.Checkin).Count(),
                    Total = participantesBusiness.GetParticipantesByEvento(EventoId).Where(x => x.Status != StatusEnum.Cancelado && x.Status != StatusEnum.Espera).Count(),
                    Meninos = participantesBusiness.GetParticipantesByEvento(EventoId).Where(x => x.Sexo == SexoEnum.Masculino && x.Status != StatusEnum.Cancelado && x.Status != StatusEnum.Espera).Count(),
                    Meninas = participantesBusiness.GetParticipantesByEvento(EventoId).Where(x => x.Sexo == SexoEnum.Feminino && x.Status != StatusEnum.Cancelado && x.Status != StatusEnum.Espera).Count(),
                    Tipo = "Individual"
                };

                return Json(new
                {
                    result
                }, JsonRequestBehavior.AllowGet);

            }

        }

        [HttpGet]
        public ActionResult GetEquipesEvento(int EventoId)
        {
            var result = new
            {

                EquipeMeninos = equipesBusiness.GetEquipantesEvento(EventoId).Where(x => x.Equipante.Sexo == SexoEnum.Masculino).Count(),
                EquipeMeninas = equipesBusiness.GetEquipantesEvento(EventoId).Where(x => x.Equipante.Sexo == SexoEnum.Feminino).Count(),
                Equipes = equipesBusiness.GetEquipesGrouped(EventoId)
            .Select(x => new ListaEquipesViewModel
            {
                QuantidadeMembros = x.Equipe.EquipanteEventos.Where(z => z.EventoId == EventoId).Count() + x.EquipesFilhas.Select(y => y.Equipe.EquipanteEventos.Where(z => z.EventoId == EventoId).Count()).DefaultIfEmpty(0).Sum(),
                QtdAnexos = x.Equipe.Arquivos.Where(z => z.EventoId == EventoId).Count() + x.EquipesFilhas.Select(y => y.Equipe.Arquivos.Where(z => z.EventoId == EventoId).Count()).DefaultIfEmpty(0).Sum(),
                Equipe = x.Equipe.Nome,
                Id = x.EquipeId
            }).ToList(),
            };

            return Json(new
            {
                result
            }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetUltimosInscritosEvento(int EventoId)
        {
            var result = new
            {
                UltimosInscritos = participantesBusiness.GetParticipantesByEvento(EventoId).Where(x => x.Status != StatusEnum.Cancelado)
                .OrderByDescending(x => x.DataCadastro).Take(5).ToList().Select(x => new ParticipanteViewModel
                {
                    Nome = UtilServices.CapitalizarNome(x.Nome),
                    Sexo = x.Sexo.GetDescription(),
                    Idade = UtilServices.GetAge(x.DataNascimento)
                }).ToList()
            };

            return Json(new
            {
                result
            }, JsonRequestBehavior.AllowGet);
        }



        [HttpGet]
        public ActionResult GetReunioesEvento(int EventoId)
        {
            var result = new
            {
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
        public async Task<ActionResult> CoordenadorGet(int eventoId)
        {

            var user = GetApplicationUser();
            var equipanteEvento = equipesBusiness.GetEquipanteEventoByUser(eventoId, user.Id);
            var equipeFilhas = GetEquipesFilhas(equipanteEvento.EquipeId.Value, eventoId);
            var membrosEquipe = await equipesBusiness.GetMembrosEquipe(eventoId, equipeFilhas).Include(x => x.Evento).Include(x => x.Evento.Reunioes).Include(x => x.Presencas).Include(x => x.Equipante.Lancamentos).ToListAsync();
            var result = new
            {
                Equipe = equipanteEvento.Equipe.Nome,
                EquipePai = equipeFilhas.Count > 1,
                EquipeEnum = equipanteEvento.EquipeId,
                QtdMembros = membrosEquipe.Count(),
                Reunioes = reunioesBusiness.GetReunioes(eventoId)
                .ToList()
                .OrderBy(x => TimeZoneInfo.ConvertTime(DateTime.Now, TimeZoneInfo.FindSystemTimeZoneById("E. South America Standard Time")).Subtract(x.DataReuniao).TotalDays < 0 ? TimeZoneInfo.ConvertTime(DateTime.Now, TimeZoneInfo.FindSystemTimeZoneById("E. South America Standard Time")).Subtract(x.DataReuniao).TotalDays * -1 : TimeZoneInfo.ConvertTime(DateTime.Now, TimeZoneInfo.FindSystemTimeZoneById("E. South America Standard Time")).Subtract(x.DataReuniao).TotalDays)
                .Select(x => new { DataReuniao = x.DataReuniao.ToString("dd/MM/yyyy"), Id = x.Id }),
                Membros = membrosEquipe.Select(x => new EquipanteViewModel
                {
                    Id = x.Equipante.Id,
                    EquipanteEventoId = x.Id,
                    Sexo = x.Equipante.Sexo.GetDescription(),
                    Fone = x.Equipante.Fone,
                    Idade = UtilServices.GetAge(x.Equipante.DataNascimento),
                    Nome = x.Equipante.Nome,
                    Equipe = x.Equipe.Nome,
                    Faltas = x.Evento.Reunioes.Where(y => y.DataReuniao < TimeZoneInfo.ConvertTime(DateTime.Now, TimeZoneInfo.FindSystemTimeZoneById("E. South America Standard Time"))).ToList().Count - x.Presencas.Count,
                    Oferta = x.Equipante.Lancamentos.Any(y => y.EventoId == eventoId),
                }).OrderBy(x => x.Equipe).ThenBy(x => x.Nome)
            };


            var jsonRes = Json(new { result }, JsonRequestBehavior.AllowGet);
            jsonRes.MaxJsonLength = Int32.MaxValue;
            return jsonRes;
        }


        public ActionResult Coordenador()
        {
            ViewBag.Title = "Coordenador";
            Response.AddHeader("Title", HttpUtility.HtmlEncode(ViewBag.Title));
            var user = GetApplicationUser();
            var equipanteEvento = equipesBusiness.GetCoordByUser(user.Id).OrderByDescending(x => x.Id);
            if (equipanteEvento.Count() > 0)
            {

                ViewBag.Eventos = equipanteEvento.Select(x => x.Evento).Select(x => new EventoViewModel
                {
                    Id = x.Id,
                    DataEvento = x.DataEvento,
                    Descricao = x.Descricao,
                    Conteudo = x.Conteudo,
                    Numeracao = x.Numeracao,
                    IsPendente = x.IsPendente,
                    IsCasal = x.Configuracao.TipoEvento == Utils.Enums.TipoEventoEnum.Casais,
                    TipoEvento = x.Configuracao?.Titulo,
                    Status = x.Status.GetDescription()
                }); ;
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

            return Json(new { presenca }, JsonRequestBehavior.AllowGet);
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

            if (permissoes.Any(x => new string[] { "Admin", "Geral", }.Contains(x.Role) || (x.Eventos != null && x.Eventos.Any(y => new string[] { "Admin", "Geral", "Administrativo", "Financeiro" }.Contains(y.Role)))))
            {
                return RedirectToAction("Admin", "Home");
            }
            else if (permissoes.Any(x => new string[] { "Membro" }.Contains(x.Role) || x.Eventos.Any(y => new string[] { "Membro" }.Contains(y.Role))))
            {
                return NaoAutorizado();
            }
            else if (permissoes.Any(x => new string[] { "Padrinho" }.Contains(x.Role) || x.Eventos.Any(y => new string[] { "Padrinho" }.Contains(y.Role))))
            {
                return RedirectToAction("Index", "Participante");
            }
            else if (permissoes.Any(x => new string[] { "Convites" }.Contains(x.Role) || x.Eventos.Any(y => new string[] { "Convites" }.Contains(y.Role))))
            {
                return RedirectToAction("Montagem", "Equipante");
            }
            else
            {
                return RedirectToAction("Coordenador", "Home");
            }

        }
    }
}