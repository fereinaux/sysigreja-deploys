using Arquitetura.Controller;
using AutoMapper;
using Core.Business.Account;
using Core.Business.Arquivos;
using Core.Business.Circulos;
using Core.Business.Configuracao;
using Core.Business.Equipes;
using Core.Business.Etiquetas;
using Core.Business.Eventos;
using Core.Business.Lancamento;
using Core.Business.MeioPagamento;
using Core.Business.Participantes;
using Core.Business.Quartos;
using Core.Models.Etiquetas;
using Core.Models.Participantes;
using Core.Models.Quartos;
using SysIgreja.ViewModels;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Linq.Dynamic;
using System.Web.Mvc;
using Utils.Constants;
using Utils.Enums;
using Utils.Extensions;
using Utils.Services;

namespace SysIgreja.Controllers
{
    [Authorize]
    public class ParticipanteController : SysIgrejaControllerBase
    {
        private readonly IParticipantesBusiness participantesBusiness;
        private readonly IEquipesBusiness equipesBusiness;
        private readonly ICirculosBusiness circulosBusiness;
        private readonly IArquivosBusiness arquivoBusiness;
        private readonly IEtiquetasBusiness etiquetasBusiness;
        private readonly IQuartosBusiness quartosBusiness;
        private readonly ILancamentoBusiness lancamentoBusiness;
        private readonly IMeioPagamentoBusiness meioPagamentoBusiness;
        private readonly IEventosBusiness eventosBusiness;
        private readonly IDatatableService datatableService;
        private readonly IMapper mapper;

        public ParticipanteController(ILancamentoBusiness lancamentoBusiness, IEtiquetasBusiness etiquetasBusiness, IQuartosBusiness quartosBusiness, IEquipesBusiness equipesBusiness, IArquivosBusiness arquivoBusiness, ICirculosBusiness circulosBusiness, IParticipantesBusiness participantesBusiness, IConfiguracaoBusiness configuracaoBusiness, IEventosBusiness eventosBusiness, IAccountBusiness accountBusiness, IDatatableService datatableService, IMeioPagamentoBusiness meioPagamentoBusiness) : base(eventosBusiness, accountBusiness, configuracaoBusiness)
        {
            this.participantesBusiness = participantesBusiness;
            this.arquivoBusiness = arquivoBusiness;
            this.eventosBusiness = eventosBusiness;
            this.quartosBusiness = quartosBusiness;
            this.equipesBusiness = equipesBusiness;
            this.circulosBusiness = circulosBusiness;
            this.etiquetasBusiness = etiquetasBusiness;
            this.lancamentoBusiness = lancamentoBusiness;
            this.meioPagamentoBusiness = meioPagamentoBusiness;
            this.datatableService = datatableService;
            mapper = new MapperRealidade().mapper;
        }


        public ActionResult Checkin()
        {
            ViewBag.Title = "Check-in";
            GetEventos();
            GetConfiguracao();

            return View();
        }

        public ActionResult Etiquetas()
        {
            ViewBag.Title = "Impressão de Etiquetas";
            GetEventos();

            return View();
        }

        public ActionResult Index()
        {
            ViewBag.Title = "Participantes";
            GetEventos();
            GetConfiguracao();

            return View();
        }

        private PostInscricaoModel mapParticipante(Data.Entities.Participante x)
        {
            return new PostInscricaoModel
            {
                Alergia = x.Alergia,
                Apelido = x.Apelido,
                CancelarCheckin = false,
                Checkin = x.Checkin,
                Padrinho = x.Padrinho?.EquipanteEvento.Equipante.Nome,
                Congregacao = x.Congregacao,
                DataNascimento = x.DataNascimento,
                Email = x.Email,
                EventoId = x.EventoId,
                Fone = x.Fone,
                FoneConvite = x.FoneConvite,
                FoneContato = x.FoneContato,
                NomeContato = x.NomeContato,
                FoneMae = x.FoneMae,
                FonePai = x.FonePai,
                HasAlergia = x.HasAlergia,
                HasMedicacao = x.HasMedicacao,
                HasTeste = x.HasTeste,
                HasRestricaoAlimentar = x.HasRestricaoAlimentar,
                Id = x.Id,
                CEP = x.CEP,
                Bairro = x.Bairro,
                Cidade = x.Cidade,
                Estado = x.Estado,
                Latitude = x.Latitude,
                Longitude = x.Longitude,
                Numero = x.Numero,
                Complemento = x.Complemento,
                Conjuge = x.Conjuge,
                Logradouro = x.Logradouro,
                Referencia = x.Referencia,
                Medicacao = x.Medicacao,
                Nome = x.Nome,
                NomeConvite = x.NomeConvite,
                NomeMae = x.NomeMae,
                NomePai = x.NomePai,
                HasParente = x.HasParente ?? false,
                Parente = x.Parente,
                HasVacina = x.HasVacina,
                RestricaoAlimentar = x.RestricaoAlimentar,
                Sexo = x.Sexo,
                Status = x.Status.GetDescription(),
                Observacao = x.Observacao,
                MsgVacina = x.MsgVacina,
                MsgPagamento = x.MsgPagamento,
                Boleto = x.Boleto,
                MsgGeral = x.MsgGeral,
                MsgNoitita = x.MsgNoitita,
                MsgFoto = x.MsgFoto,
                PendenciaBoleto = x.PendenciaBoleto,
                PendenciaContato = x.PendenciaContato,
                Etiquetas = etiquetasBusiness.GetEtiquetasByParticipante(x.Id)?.Select(y => new PostEtiquetaModel { Id = y.Id, Cor = y.Cor, Nome = y.Nome }),
                Foto = x.Arquivos.Any(y => y.IsFoto) ? Convert.ToBase64String(x.Arquivos.FirstOrDefault(y => y.IsFoto).Conteudo) : ""
            };
        }

        [HttpGet]
        public ActionResult GetParticipante(int Id)
        {
            var result = mapParticipante(participantesBusiness.GetParticipanteById(Id));

            result.Nome = UtilServices.CapitalizarNome(result.Nome);
            result.Apelido = UtilServices.CapitalizarNome(result.Apelido);

            var quartoAtual = quartosBusiness.GetNextQuarto(result.EventoId, result.Sexo, TipoPessoaEnum.Participante);

            var dadosAdicionais = new
            {
                Circulo = circulosBusiness.GetCirculosComParticipantes(result.EventoId).Where(x => x.ParticipanteId == Id)?.FirstOrDefault()?.Circulo?.Cor?.GetDescription() ?? "",
                Status = result.Status.GetDescription(),
                Quarto = quartosBusiness.GetQuartosComParticipantes(result.EventoId, TipoPessoaEnum.Participante).Where(x => x.ParticipanteId == Id).FirstOrDefault()?.Quarto?.Titulo ?? "",
                QuartoAtual = new
                {
                    Quarto = mapper.Map<PostQuartoModel>(quartoAtual),
                    Participantes = quartoAtual != null ? quartosBusiness.GetParticipantesByQuartos(quartoAtual.Id, TipoPessoaEnum.Participante).Count() : 0
                }
            };

            return Json(new { Participante = result, DadosAdicionais = dadosAdicionais }, JsonRequestBehavior.AllowGet);
        }


        [HttpPost]
        public ActionResult PostInfo(PostInfoModel model)
        {
            participantesBusiness.PostInfo(model);
            return new HttpStatusCodeResult(200);

        }

        [HttpGet]
        public ActionResult GetParticipantesByCirculo(int CirculoId)
        {
            var result = circulosBusiness.GetParticipantesByCirculos(CirculoId).OrderBy(x => x.Participante.Nome).ToList().Select(x => new
            {
                Circulo = x.Circulo.Cor?.GetDescription(),
                Nome = UtilServices.CapitalizarNome(x.Participante.Nome),
                Apelido = UtilServices.CapitalizarNome(x.Participante.Apelido),
                Cor = x.Circulo.Cor?.GetDescription(),
                Titulo = x.Circulo.Titulo,
                Dirigentes = x.Circulo.Dirigentes.Select(y => new DirigenteViewModel { Id = y.Id, Nome = UtilServices.CapitalizarNome(y.Equipante.Equipante.Nome) }),
                Fone = x.Participante.Fone
            });

            var json = Json(new { data = result }, JsonRequestBehavior.AllowGet);
            json.MaxJsonLength = Int32.MaxValue;
            return json;
        }

        [HttpGet]
        public ActionResult GetParticipantesByQuarto(int QuartoId)
        {
            var result = quartosBusiness.GetParticipantesByQuartos(QuartoId, TipoPessoaEnum.Participante).OrderBy(x => x.Participante.Nome).ToList().Select(x => new
            {
                Nome = UtilServices.CapitalizarNome(x.Participante.Nome),
                Medicacao = (x.Participante.Medicacao ?? "-") + "/" + (x.Participante.Alergia ?? "-"),
                Titulo = x.Quarto.Titulo,
                Equipante = x.Quarto.Equipante != null ? UtilServices.CapitalizarNome(x.Quarto.Equipante.Nome) : "",
                Circulo = x.Participante.Circulos?.LastOrDefault()?.Circulo?.Cor?.GetDescription() ?? "",
                Quantidade = quartosBusiness.GetParticipantesByQuartos(x.QuartoId, TipoPessoaEnum.Participante).Count(),

            });

            return Json(new { data = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetAniversariantesByEvento(int EventoId)
        {
            var result = participantesBusiness.GetAniversariantesByEvento(EventoId).ToList().Select(x => new
            {
                Nome = UtilServices.CapitalizarNome(x.Nome),
                Apelido = UtilServices.CapitalizarNome(x.Apelido),
                Dia = x.DataNascimento.HasValue ? x.DataNascimento.Value.ToString("dd") : "",
                Idade = UtilServices.GetAge(x.DataNascimento).ToString()
            }).ToList();

            result.AddRange(equipesBusiness.GetEquipantesAniversariantesByEvento(EventoId).ToList().Select(x => new
            {
                Nome = UtilServices.CapitalizarNome(x.Nome),
                Apelido = UtilServices.CapitalizarNome(x.Apelido),
                Dia = x.DataNascimento.HasValue ? x.DataNascimento.Value.ToString("dd") : "",
                Idade = UtilServices.GetAge(x.DataNascimento).ToString()
            }));

            return Json(new { data = result.OrderBy(x => x.Dia) }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetParentesByEvento(int EventoId)
        {
            var result = participantesBusiness.GetParentesByEvento(EventoId).ToList().Select(x => new
            {
                Nome = UtilServices.CapitalizarNome(x.Nome),
                Circulo = circulosBusiness.GetCirculosComParticipantes(EventoId).FirstOrDefault(y => y.ParticipanteId == x.Id)?.Circulo.Cor?.GetDescription(),
                Parente = UtilServices.CapitalizarNome(x.Parente)
            }).ToList();

            return Json(new { data = result.OrderBy(x => x.Nome) }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetTotaisCheckin(int EventoId)
        {
            var result = new
            {
                Confirmados = participantesBusiness.GetParticipantesByEvento(EventoId).Count(x => x.Status == StatusEnum.Confirmado),
                Presentes = participantesBusiness.GetParticipantesByEvento(EventoId).Count(x => x.Checkin),
                ConfirmadosEquipantes = equipesBusiness.GetEquipantesByEvento(EventoId).Count(),
                PresentesEquipantes = equipesBusiness.GetEquipantesEvento(EventoId).Count(x => x.Checkin),
            };

            return Json(new { result }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetRestricoesByEvento(int EventoId)
        {
            var result = participantesBusiness.GetRestricoesByEvento(EventoId).ToList().Select(x => new
            {
                Nome = UtilServices.CapitalizarNome(x.Nome),
                Apelido = UtilServices.CapitalizarNome(x.Apelido),
                Restricao = x.RestricaoAlimentar
            }).ToList();

            result.AddRange(equipesBusiness.GetEquipantesRestricoesByEvento(EventoId).ToList().Select(x => new
            {
                Nome = UtilServices.CapitalizarNome(x.Nome),
                Apelido = UtilServices.CapitalizarNome(x.Apelido),
                Restricao = x.RestricaoAlimentar
            }));

            return Json(new { data = result.OrderBy(x => x.Nome) }, JsonRequestBehavior.AllowGet);
        }


        [HttpPost]
        public ActionResult GetParticipantesSelect(int EventoId)
        {

            var result = participantesBusiness
            .GetParticipantesByEvento(EventoId)
            .Where(x => x.Status == StatusEnum.Confirmado || x.Status == StatusEnum.Inscrito)
            .Select(x => new
            {
                x.Nome,
                x.Id
            })
               .OrderBy(x => x.Nome);

            return Json(new { data = result }, JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public ActionResult GetParticipantesDatatable(FilterModel model)
        {
            var extract = Request.QueryString["extract"];
            if (extract == "excel")
            {
                Guid g = Guid.NewGuid();

                var result = participantesBusiness
                .GetParticipantesByEvento(model.EventoId);
                var data = mapper.Map<IEnumerable<ParticipanteExcelViewModel>>(result);

                Session[g.ToString()] = datatableService.GenerateExcel(data.ToList(), model.Campos);

                return Content(g.ToString());
            }
            else
            {

                var result = participantesBusiness
                .GetParticipantesByEvento(model.EventoId);

                var totalResultsCount = result.Count();
                var filteredResultsCount = totalResultsCount;

                if (model.Etiquetas != null && model.Etiquetas.Count > 0)
                {
                    model.Etiquetas.ForEach(etiqueta =>
                    result = result.Where(x => x.ParticipantesEtiquetas.Any(y => y.EtiquetaId.ToString() == etiqueta)));

                }

                if (model.NaoEtiquetas != null && model.NaoEtiquetas.Count > 0)
                {
                    model.NaoEtiquetas.ForEach(etiqueta =>
                 result = result.Where(x => !x.ParticipantesEtiquetas.Any(y => y.EtiquetaId.ToString() == etiqueta)));
                }

                if (model.Status.HasValue)
                {
                    if ((int)model.Status.Value == 12)
                    {
                        result = result.Where(x => (x.Checkin));
                    }
                    else if (model.Status == StatusEnum.Confirmado)
                    {
                        result = result.Where(x => (x.Status == StatusEnum.Confirmado && !x.Checkin));
                    }
                    else
                    {
                        result = result.Where(x => (x.Status == model.Status));

                    }
                    filteredResultsCount = result.Count();
                }

                if (model.PadrinhoId > 0 && model.PadrinhoId != 999)
                {
                    result = result.Where(x => (x.PadrinhoId == model.PadrinhoId));
                    filteredResultsCount = result.Count();
                }
                else if (model.PadrinhoId == 0)
                {
                    result = result.Where(x => (!x.PadrinhoId.HasValue));
                    filteredResultsCount = result.Count();
                }



                if (model.search.value != null)
                {
                    result = result.Where(x => (x.Nome.Contains(model.search.value)));
                    filteredResultsCount = result.Count();
                }

                try
                {
                    model.columns[model.order[0].column].name = model.columns[model.order[0].column].name == "Padrinho" ? model.columns[model.order[0].column].name = "Padrinho.Nome" : model.columns[model.order[0].column].name;
                    model.columns[model.order[0].column].name = model.columns[model.order[0].column].name == "Idade" ? model.columns[model.order[0].column].name = "DataNascimento" : model.columns[model.order[0].column].name;
                    result = result.OrderBy(model.columns[model.order[0].column].name + " " + model.order[0].dir);
                }
                catch (Exception)
                {
                    result = result.OrderBy(x => x.Id);
                }

                result = result.Skip(model.Start)
                .Take(model.Length);

                return Json(new
                {
                    data = mapper.Map<IEnumerable<ParticipanteListModel>>(result),
                    recordsTotal = totalResultsCount,
                    recordsFiltered = filteredResultsCount,
                }, JsonRequestBehavior.AllowGet);

            }
        }

        [HttpPost]
        public ActionResult GetParticipantesConfirmados(int EventoId)
        {
            var list = participantesBusiness
                .GetParticipantesByEvento(EventoId)
                .Where(x => x.Status == StatusEnum.Confirmado || x.Status == StatusEnum.Inscrito)
                .ToList();


            var result = list
               .OrderBy(x => x.Nome)
               .Select(x => new
               {
                   Id = x.Id,
                   Nome = UtilServices.CapitalizarNome(x.Nome),
                   Apelido = UtilServices.CapitalizarNome(x.Apelido),
                   Foto = x.Arquivos.Any(y => y.IsFoto) ? Convert.ToBase64String(x.Arquivos.FirstOrDefault(y => y.IsFoto).Conteudo) : "",
                   Circulo = x.Circulos.LastOrDefault()?.Circulo.Cor?.GetDescription() ?? x.Circulos.LastOrDefault()?.Circulo.Titulo
               });


            var json = Json(new { data = result }, JsonRequestBehavior.AllowGet);
            json.MaxJsonLength = Int32.MaxValue;
            return json;

        }

        [HttpPost]
        public ActionResult GetBoletos(int EventoId)
        {
            var list = participantesBusiness
                .GetParticipantesByEvento(EventoId)
                .Where(x => x.Boleto)
                .ToList();

            var result = list
           .Select(x => new ParticipanteViewModel
           {
               Id = x.Id,
               Nome = UtilServices.CapitalizarNome(x.Nome),
               Sexo = x.Sexo.GetDescription(),
               Fone = x.Fone,
               Status = x.Status.GetDescription(),
               Idade = UtilServices.GetAge(x.DataNascimento),
               PendenciaBoleto = x.PendenciaBoleto,
               DataCadastro = x.DataCadastro.Value.ToString("dd/MM/yyyy hh:mm")
           }); ;

            return Json(new { data = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult ToggleBoleto(int ParticipanteId)
        {
            participantesBusiness.TogglePendenciaBoleto(ParticipanteId);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult ToggleContato(int ParticipanteId)
        {
            participantesBusiness.TogglePendenciaContato(ParticipanteId);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult GetListaTelefonica(int EventoId)
        {
            var result = participantesBusiness
                .GetParticipantesByEvento(EventoId)
                .Where(x => x.Status != StatusEnum.Cancelado)
                .ToList()
                .Select(x => new
                {
                    Id = x.Id,
                    Nome = UtilServices.CapitalizarNome(x.Nome),
                    Status = x.Status.GetDescription(),
                    Evento = $"{x.Evento.Numeracao.ToString()}º {x.Evento.Configuracao.Titulo} {x.Evento.Descricao}",
                    Sexo = x.Sexo.GetDescription(),
                    Fone = x.Fone,
                    x.NomeMae,
                    x.FoneMae,
                    x.NomePai,
                    x.FonePai,
                    x.NomeConvite,
                    x.FoneConvite,
                    PendenciaContato = x.PendenciaContato,
                    Padrinho = x.Padrinho?.EquipanteEvento.Equipante.Nome
                }); ;

            return Json(new { data = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult CancelarInscricao(int Id)
        {
            participantesBusiness.CancelarInscricao(Id);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult AtivarInscricao(int Id)
        {
            participantesBusiness.AtivarInscricao(Id);

            return new HttpStatusCodeResult(200);
        }


        [HttpPost]
        public ActionResult DeletarInscricao(int Id)
        {
            participantesBusiness.DeletarInscricao(Id);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult ToggleSexo(int Id)
        {
            participantesBusiness.ToggleSexo(Id);

            return new HttpStatusCodeResult(200);
        }


        [HttpPost]
        public ActionResult ToggleVacina(int Id)
        {
            participantesBusiness.ToggleVacina(Id);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult ToggleTeste(int Id)
        {
            participantesBusiness.ToggleTeste(Id);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult ToggleCheckin(int Id)
        {
            participantesBusiness.ToggleCheckin(Id);

            return new HttpStatusCodeResult(200);
        }

        [HttpGet]
        public ActionResult GetPadrinhos(int eventoId)
        {
            return Json(new { Padrinhos = participantesBusiness.GetParticipantesByEvento(eventoId).Select(x => new { Id = x.PadrinhoId, Nome = x.PadrinhoId.HasValue ? x.Padrinho.EquipanteEvento.Equipante.Nome : "Sem Padrinho" }).Distinct().ToList() }, JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public ActionResult MakeEquipante(int Id)
        {
            participantesBusiness.MakeEquipante(Id);

            return new HttpStatusCodeResult(200);
        }


    }
}