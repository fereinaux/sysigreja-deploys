using Arquitetura.Controller;
using AutoMapper;
using Core.Business.Account;
using Core.Business.Arquivos;
using Core.Business.Caronas;
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
using CsQuery.ExtensionMethods.Internal;
using SysIgreja.ViewModels;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Globalization;
using System.Linq;
using System.Linq.Dynamic;
using System.Threading;
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
        private readonly ICaronasBusiness caronasBusiness;
        private readonly IDatatableService datatableService;
        private readonly IMapper mapper;

        public ParticipanteController(ILancamentoBusiness lancamentoBusiness, ICaronasBusiness caronasBusiness, IEtiquetasBusiness etiquetasBusiness, IQuartosBusiness quartosBusiness, IEquipesBusiness equipesBusiness, IArquivosBusiness arquivoBusiness, ICirculosBusiness circulosBusiness, IParticipantesBusiness participantesBusiness, IConfiguracaoBusiness configuracaoBusiness, IEventosBusiness eventosBusiness, IAccountBusiness accountBusiness, IDatatableService datatableService, IMeioPagamentoBusiness meioPagamentoBusiness) : base(eventosBusiness, accountBusiness, configuracaoBusiness)
        {
            this.participantesBusiness = participantesBusiness;
            this.caronasBusiness = caronasBusiness;
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
            GetEventos(new string[] { "Financeiro", "Admin", "Geral", "Administrativo", "Padrinho" });
            GetConfiguracao();

            return View();
        }

        public ActionResult Index()
        {
            ViewBag.Title = "Participantes";
            GetEventos(new string[] { "Financeiro", "Admin", "Geral", "Administrativo", "Padrinho" });
            GetConfiguracao();

            return View();
        }

        public ActionResult Casais()
        {
            ViewBag.Title = "Casais";
            GetEventos(new string[] { "Financeiro", "Admin", "Geral", "Administrativo", "Padrinho" });
            GetConfiguracao();

            return View();
        }

        [HttpPost]
        public ActionResult GetTelefones(int[] ids)
        {
            var query = participantesBusiness.GetParticipantes().Where(x => ids.Contains(x.Id));

            var result = query.Select(x => new { x.Fone, x.Nome, x.NomeContato, x.FoneContato, x.FoneMae, x.NomeMae, x.FoneConvite, x.NomeConvite, x.NomePai, x.FonePai }).ToList();

            return Json(new { Equipantes = result }, JsonRequestBehavior.AllowGet);
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
                IsCasado = x.IsCasado,
                DataCasamento = x.DataCasamento,
                DataNascimento = x.DataNascimento,
                Email = x.Email,
                EventoId = x.EventoId,
                Camisa = x.Camisa,
                Fone = x.Fone,
                FoneConvite = x.FoneConvite,
                FoneContato = x.FoneContato,
                NomeContato = x.NomeContato,
                FoneMae = x.FoneMae,
                FonePai = x.FonePai,
                HasAlergia = x.HasAlergia,
                HasMedicacao = x.HasMedicacao,
                HasTeste = x.HasTeste,
                Instagram = x.Instagram,
                HasRestricaoAlimentar = x.HasRestricaoAlimentar,
                HasConvenio = x.HasConvenio,
                Convenio = x.Convenio,
                Hospitais = x.Hospitais,
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
                RestricaoAlimentar = x.RestricaoAlimentar,
                Sexo = x.Sexo,
                Status = x.Status.GetDescription(),
                Observacao = x.Observacao,
                EtiquetasList = etiquetasBusiness.GetEtiquetasByParticipante(x.Id)?.Select(y => new PostEtiquetaModel { Id = y.Id, Cor = y.Cor, Nome = y.Nome }),
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
                Circulo = circulosBusiness.GetCirculosComParticipantes(result.EventoId).Where(x => x.ParticipanteId == Id)?.FirstOrDefault()?.Circulo?.Titulo ?? "",
                Status = result.Status.GetDescription(),
                Quarto = quartosBusiness.GetQuartosComParticipantes(result.EventoId, TipoPessoaEnum.Participante).Where(x => x.ParticipanteId == Id).FirstOrDefault()?.Quarto?.Titulo ?? "",
                Motorista = caronasBusiness.GetCaronasComParticipantes(result.EventoId).Where(x => x.ParticipanteId == Id).FirstOrDefault()?.Carona?.Motorista?.Nome ?? "",
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
            var config = circulosBusiness.GetCirculoById(CirculoId).Evento.Configuracao;

            if (config.TipoEvento == TipoEventoEnum.Casais)
            {
                var query = circulosBusiness.GetParticipantesByCirculos(CirculoId);
                var queryCasais = query.AsEnumerable().GroupJoin(query, x => x.Participante.Nome.Trim(), y => y.Participante.Conjuge.Trim(), (q1, q2) => new { q1, q2 }).Select(x => new
                {
                    Conjuge = x.q1.Participante.Nome == new List<string> { x.q1.Participante.Nome, x.q2.Any() ? x.q2.FirstOrDefault().Participante.Nome : "" }.Min() ? x.q1 : x.q2.FirstOrDefault(),
                    Nome = x.q1.Participante.Nome == new List<string> { x.q1.Participante.Nome, x.q2.Any() ? x.q2.FirstOrDefault().Participante.Nome : "" }.Max() ? x.q1 : x.q2.FirstOrDefault(),
                }).Select(x => new
                {
                    Homem = x.Nome.Participante.Sexo == SexoEnum.Masculino ? x.Nome : (x.Conjuge != null ? x.Conjuge : null),
                    Mulher = x.Nome.Participante.Sexo == SexoEnum.Feminino ? x.Nome : (x.Conjuge != null ? x.Conjuge : null),
                }).Distinct();

                var queryNova = queryCasais.Select(x => new
                {
                    Dupla = (x.Homem != null & x.Mulher != null) ? x.Homem.Participante.Apelido + " e " + x.Mulher.Participante.Apelido : null,
                    x.Homem,
                    x.Mulher,
                });

                List<Data.Entities.Participante> resultCasais = new List<Data.Entities.Participante>();

                queryNova.ToList().ForEach(casal =>
                {
                    if (casal.Homem != null)
                    {
                        casal.Homem.Participante.Dupla = casal.Dupla;
                        resultCasais.Add(casal.Homem.Participante);
                    }
                    if (casal.Mulher != null)
                    {
                        casal.Mulher.Participante.Dupla = casal.Dupla;
                        resultCasais.Add(casal.Mulher.Participante);
                    }
                });

                var result = queryNova.ToList().Select(x => new
                {
                    Nome = !string.IsNullOrEmpty(x.Dupla) ? UtilServices.CapitalizarNome(x.Dupla) : (!string.IsNullOrEmpty(x.Homem?.Participante?.Nome) ? UtilServices.CapitalizarNome(x.Homem.Participante.Nome) : UtilServices.CapitalizarNome(x.Mulher.Participante.Nome)),
                    Titulo = x.Homem?.Circulo?.Titulo ?? x.Mulher?.Circulo?.Titulo,
                    SequencialEvento = x.Homem?.Participante?.SequencialEvento ?? x.Mulher?.Participante?.SequencialEvento,
                    Dirigentes = x.Homem?.Circulo?.Dirigentes?.Select(y => 
                    new DirigenteViewModel { Id = y.Id, Nome = UtilServices.CapitalizarNome(y.Equipante.Equipante.Nome), Apelido = UtilServices.CapitalizarNome(y.Equipante.Equipante.Apelido), Fone = y.Equipante.Equipante.Fone }) ?? x.Mulher?.Circulo?.Dirigentes?.Select(y => 
                    new DirigenteViewModel { Id = y.Id, Nome = UtilServices.CapitalizarNome(y.Equipante.Equipante.Nome), Apelido = UtilServices.CapitalizarNome(y.Equipante.Equipante.Apelido), Fone = y.Equipante.Equipante.Fone }),
                    Fone = $"{x.Homem?.Participante?.Fone} e {x.Mulher?.Participante?.Fone}"
                }); ;

                var json = Json(new { data = result }, JsonRequestBehavior.AllowGet);
                json.MaxJsonLength = Int32.MaxValue;
                return json;
            }
            else
            {
                var query = circulosBusiness.GetParticipantesByCirculos(CirculoId).OrderBy(x => x.Participante.Nome);

                var result = query.ToList().Select(x => new
                {
                    Circulo = x.Circulo.Cor?.GetDescription(),
                    Nome = UtilServices.CapitalizarNome(x.Participante.Nome),
                    Apelido = UtilServices.CapitalizarNome(x.Participante.Apelido),
                    Cor = x.Circulo.Cor?.GetDescription(),
                    Titulo = x.Circulo.Titulo,
                    SequencialEvento = x.Participante.SequencialEvento,
                    Dirigentes = x.Circulo.Dirigentes.Select(y => new DirigenteViewModel { Id = y.Id, Nome = UtilServices.CapitalizarNome(y.Equipante.Equipante.Nome), Apelido = UtilServices.CapitalizarNome(y.Equipante.Equipante.Apelido), Fone = y.Equipante.Equipante.Fone }),
                    Fone = x.Participante.Fone
                });

                var json = Json(new { data = result }, JsonRequestBehavior.AllowGet);
                json.MaxJsonLength = Int32.MaxValue;
                return json;
            }


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

        public class AniversarianteModel
        {
            public string Nome { get; set; }
            public string Apelido { get; set; }
            public string Dia { get; set; }
            public string Idade { get; set; }
        }

        [HttpGet]
        public ActionResult GetAniversariantesByEvento(int EventoId, string type)
        {
            var result = new List<AniversarianteModel>();

            if (type == "participantes" || type == "todos")
            {
                result.AddRange(participantesBusiness.GetAniversariantesByEvento(EventoId).ToList().Select(x => new AniversarianteModel
                {
                    Nome = UtilServices.CapitalizarNome(x.Nome),
                    Apelido = UtilServices.CapitalizarNome(x.Apelido),
                    Dia = x.DataNascimento.HasValue ? x.DataNascimento.Value.ToString("dd") : "",
                    Idade = UtilServices.GetAge(x.DataNascimento).ToString()
                }).ToList());
            }


            if (type == "equipantes" || type == "todos")
            {
                result.AddRange(equipesBusiness.GetEquipantesAniversariantesByEvento(EventoId).ToList().Select(x => new AniversarianteModel
                {
                    Nome = UtilServices.CapitalizarNome(x.Nome),
                    Apelido = UtilServices.CapitalizarNome(x.Apelido),
                    Dia = x.DataNascimento.HasValue ? x.DataNascimento.Value.ToString("dd") : "",
                    Idade = UtilServices.GetAge(x.DataNascimento).ToString()
                }));
            }

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
        public ActionResult GetCracha(FilterModel model)
        {

            var result = participantesBusiness
                        .GetParticipantesByEvento(model.EventoId.Value)
                        .Where(x => x.EventoId == model.EventoId && (StatusEnum.Confirmado == x.Status || x.Status == StatusEnum.Inscrito));

            if (model.Foto)
            {
                result = result.Where(x => x.Arquivos.Any(y => y.IsFoto));
            }

            if (model.Ids != null)
            {
                result = result.Where(x => model.Ids.Contains(x.Id));
            }
            else
            {
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

                if (model.PadrinhoId != null)
                {
                    if (model.PadrinhoId.Contains(0))
                    {
                        result = result.Where(x => (!x.PadrinhoId.HasValue));
                    }
                    else
                    {
                        result = result.Where(x => (model.PadrinhoId.Contains(x.PadrinhoId.Value)));
                    }
                }

                if (model.CirculoId != null)
                {
                    result = result.Where(x => (x.Circulos.Any(y => model.CirculoId.Contains(y.CirculoId))));
                }

                if (model.QuartoId != null)
                {
                    result = result.Where(x => (x.Quartos.Any(y => model.QuartoId.Contains(y.QuartoId))));
                }

                if (model.search != null && model.search.value != null)
                {
                    result = result.Where(x => (x.Nome.Contains(model.search.value)));
                }
            }

            result = result.OrderBy(x => x.Nome);

            var json = Json(new
            {
                data = mapper.Map<IEnumerable<CrachaModel>>(result),
            }, JsonRequestBehavior.AllowGet);
            json.MaxJsonLength = Int32.MaxValue;
            return json;
        }


          [HttpPost]
        public ActionResult GetCrachaCasal(FilterModel model)
        {

            var result = participantesBusiness
                        .GetParticipantesByEvento(model.EventoId.Value)
                        .Where(x => x.EventoId == model.EventoId && (StatusEnum.Confirmado == x.Status || x.Status == StatusEnum.Inscrito));

            var queryCasais = result.AsEnumerable().GroupJoin(result, x => x.Nome.ToLower().Trim(), y => y.Conjuge?.ToLower().Trim(), (q1, q2) => new { q1, q2 }).Select(x => new
            {
                Conjuge = x.q1.Nome == new List<string> { x.q1.Nome, x.q2.Any() ? x.q2.FirstOrDefault().Nome : "" }.Min() ? x.q1 : x.q2.FirstOrDefault(),
                Nome = x.q1.Nome == new List<string> { x.q1.Nome, x.q2.Any() ? x.q2.FirstOrDefault().Nome : "" }.Max() ? x.q1 : x.q2.FirstOrDefault(),
            }).Select(x => new
            {
                Homem = x.Nome.Sexo == SexoEnum.Masculino ? x.Nome : (x.Conjuge != null ? x.Conjuge : null),
                Mulher = x.Nome.Sexo == SexoEnum.Feminino ? x.Nome : (x.Conjuge != null ? x.Conjuge : null),
            }).Distinct();

            if (model.Etiquetas != null && model.Etiquetas.Count > 0)
            {
                model.Etiquetas.ForEach(etiqueta =>
                queryCasais = queryCasais.Where(x =>
                (x.Homem?.ParticipantesEtiquetas?.Any(y => y.EtiquetaId.ToString() == etiqueta) ?? false) ||
                 (x.Mulher?.ParticipantesEtiquetas?.Any(y => y.EtiquetaId.ToString() == etiqueta) ?? false)
                ));

            }

            if (model.NaoEtiquetas != null && model.NaoEtiquetas.Count > 0)
            {
                model.NaoEtiquetas.ForEach(etiqueta =>
             queryCasais = queryCasais.Where(x => !x.Homem?.ParticipantesEtiquetas?.Any(y => y.EtiquetaId.ToString() == etiqueta) ?? false && (!x.Mulher?.ParticipantesEtiquetas?.Any(y => y.EtiquetaId.ToString() == etiqueta) ?? false)));
            }

            if (model.Status != null)
            {

                if (model.Status.Contains(StatusEnum.Checkin))
                {
                    queryCasais = queryCasais.Where(x => (x.Homem.Checkin || x.Mulher.Checkin) || (model.Status.Contains(x.Homem.Status) || model.Status.Contains(x.Mulher.Status)));
                }
                else
                {
                    queryCasais = queryCasais.Where(x => (x.Homem != null && (model.Status.Contains(x.Homem.Status) || (x.Mulher != null && model.Status.Contains(x.Mulher.Status)) && ((!x.Homem?.Checkin ?? false) && (!x.Mulher?.Checkin ?? false)))));

                }
            }

            if (model.PadrinhoId != null)
            {
                if (model.PadrinhoId.Count == 0)
                {
                    queryCasais = queryCasais.Where(x => (!x.Homem.PadrinhoId.HasValue) || (!x.Mulher.PadrinhoId.HasValue));
                }
                else
                {
                    queryCasais = queryCasais
                        .Where(x =>
                            (x.Homem?.Padrinho != null &&
                             model.PadrinhoId.Contains(x.Homem.PadrinhoId.Value))
                                ||
                            (x.Mulher?.Padrinho != null &&
                             model.PadrinhoId.Contains(x.Mulher.PadrinhoId.Value))
                        );
                }
            }

            if (model.CirculoId != null)
            {
                queryCasais = queryCasais.Where(x => (x.Homem?.Circulos?.Any(y => model.CirculoId.Contains(y.CirculoId))) ?? false || (x.Mulher?.Circulos?.Any(y => model.CirculoId.Contains(y.CirculoId)) ?? false));
            }


            if (model.QuartoId != null)
            {
                queryCasais = queryCasais.Where(x => (x.Homem?.Quartos?.Any(y => model.QuartoId.Contains(y.QuartoId))) ?? false || (x.Mulher?.Quartos?.Any(y => model.QuartoId.Contains(y.QuartoId)) ?? false));
            }


            if (model.search != null && model.search.value != null)
            {
                model.search.value = model.search.value.RemoveAccents();
                queryCasais = queryCasais.Where(x => x.Homem != null ? ((x.Homem.Nome.RemoveAccents().Contains(model.search.value)) || (x.Homem.Conjuge.RemoveAccents().Contains(model.search.value))) : (x.Mulher.Nome.RemoveAccents().Contains(model.search.value)) || (x.Mulher.Conjuge.RemoveAccents().Contains(model.search.value)));
            }


            var queryNova = queryCasais.Select(x => new
            {
                Dupla = (x.Homem != null & x.Mulher != null) ? x.Homem.Apelido + " e " + x.Mulher.Apelido : null,
                x.Homem,
                x.Mulher,
            });

            List<Data.Entities.Participante> resultCasais = new List<Data.Entities.Participante>();

            queryNova.ToList().ForEach(casal =>
            {
                if (casal.Homem != null)
                {
                    casal.Homem.Dupla = casal.Homem?.Apelido + " de " + casal.Mulher?.Apelido;
                    resultCasais.Add(casal.Homem);
                }
                if (casal.Mulher != null)
                {
                    casal.Mulher.Dupla = casal.Mulher?.Apelido + " de " + casal.Homem?.Apelido;
                    resultCasais.Add(casal.Mulher);
                }
            });

            var json = Json(new
            {
                data = mapper.Map<IEnumerable<CrachaCasalModel>>(resultCasais),
            }, JsonRequestBehavior.AllowGet);
            json.MaxJsonLength = Int32.MaxValue;
            return json;
        }

        [HttpPost]
        public ActionResult GetParticipantesDatatable(FilterModel model)
        {
            var extract = Request.QueryString["extract"];
            Thread.CurrentThread.CurrentCulture = new CultureInfo("pt-BR", true);


            var result = participantesBusiness
            .GetParticipantesByEvento(model.EventoId.Value);

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

            if (model.Status != null)
            {

                if (model.Status.Contains(StatusEnum.Checkin))
                {
                    result = result.Where(x => x.Checkin || (model.Status.Contains(x.Status)));
                }
                else
                {
                    result = result.Where(x => (model.Status.Contains(x.Status) && !x.Checkin));

                }


                filteredResultsCount = result.Count();
            }

            if (model.PadrinhoId != null)
            {
                if (model.PadrinhoId.Contains(0))
                {
                    result = result.Where(x => (!x.PadrinhoId.HasValue));
                }
                else
                {
                    result = result.Where(x => (model.PadrinhoId.Contains(x.PadrinhoId.Value)));
                }
                filteredResultsCount = result.Count();
            }

            if (model.CirculoId != null)
            {
                result = result.Where(x => (x.Circulos.Any(y => model.CirculoId.Contains(y.CirculoId))));
                filteredResultsCount = result.Count();
            }

            if (model.QuartoId != null)
            {
                result = result.Where(x => (x.Quartos.Any(y => model.QuartoId.Contains(y.QuartoId))));
                filteredResultsCount = result.Count();
            }

            if (model.CaronaId != null)
            {
                result = result.Where(x => (x.Caronas.Any(y => model.CaronaId.Contains(y.CaronaId))));
                filteredResultsCount = result.Count();
            }

            if (model.search != null && model.search.value != null)
            {
                result = result.Where(x => (x.Nome.Contains(model.search.value)));
                filteredResultsCount = result.Count();
            }


            if (extract == "excel")
            {
                Guid g = Guid.NewGuid();
                var data = mapper.Map<IEnumerable<ParticipanteExcelViewModel>>(result);

                Session[g.ToString()] = datatableService.GenerateExcel(data.ToList(), model.Campos);

                return Content(g.ToString());
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

            filteredResultsCount = result.Count();


            result = result.Skip(model.Start.Value)
                .Take(model.Length.Value);

            return Json(new
            {
                data = mapper.Map<IEnumerable<ParticipanteListModel>>(result),
                recordsTotal = totalResultsCount,
                recordsFiltered = filteredResultsCount,
            }, JsonRequestBehavior.AllowGet);


        }


       [HttpPost]
        public ActionResult GetCasaisDatatable(FilterModel model)
        {
            var extract = Request.QueryString["extract"];
            Thread.CurrentThread.CurrentCulture = new CultureInfo("pt-BR", true);


            var result = participantesBusiness
            .GetParticipantesByEvento(model.EventoId.Value).AsEnumerable();

            var queryCasais = result.AsEnumerable().GroupJoin(result, x => x.Nome.ToLower().Trim(), y => y.Conjuge?.ToLower().Trim(), (q1, q2) => new { q1, q2 }).Select(x => new
            {
                Conjuge = x.q1.Nome == new List<string> { x.q1.Nome, x.q2.Any() ? x.q2.FirstOrDefault().Nome : "" }.Min() ? x.q1 : x.q2.FirstOrDefault(),
                Nome = x.q1.Nome == new List<string> { x.q1.Nome, x.q2.Any() ? x.q2.FirstOrDefault().Nome : "" }.Max() ? x.q1 : x.q2.FirstOrDefault(),
            }).Select(x => new
            {
                Homem = x.Nome.Sexo == SexoEnum.Masculino ? x.Nome : (x.Conjuge != null ? x.Conjuge : null),
                Mulher = x.Nome.Sexo == SexoEnum.Feminino ? x.Nome : (x.Conjuge != null ? x.Conjuge : null),
            }).Distinct();

            var totalResultsCount = queryCasais.Count();
            var filteredResultsCount = totalResultsCount;

            if (model.Etiquetas != null && model.Etiquetas.Count > 0)
            {
                model.Etiquetas.ForEach(etiqueta =>
                queryCasais = queryCasais.Where(x =>
                (x.Homem?.ParticipantesEtiquetas?.Any(y => y.EtiquetaId.ToString() == etiqueta) ?? false) ||
                 (x.Mulher?.ParticipantesEtiquetas?.Any(y => y.EtiquetaId.ToString() == etiqueta) ?? false)
                ));

            }

            if (model.NaoEtiquetas != null && model.NaoEtiquetas.Count > 0)
            {
                model.NaoEtiquetas.ForEach(etiqueta =>
             queryCasais = queryCasais.Where(x => !x.Homem?.ParticipantesEtiquetas?.Any(y => y.EtiquetaId.ToString() == etiqueta) ?? false && (!x.Mulher?.ParticipantesEtiquetas?.Any(y => y.EtiquetaId.ToString() == etiqueta) ?? false)));
            }

            if (model.Status != null)
            {

                if (model.Status.Contains(StatusEnum.Checkin))
                {
                    queryCasais = queryCasais.Where(x => (x.Homem.Checkin || x.Mulher.Checkin) || (model.Status.Contains(x.Homem.Status) || model.Status.Contains(x.Mulher.Status)));
                }
                else
                {
                    queryCasais = queryCasais.Where(x => (x.Homem != null && (model.Status.Contains(x.Homem.Status) || (x.Mulher != null && model.Status.Contains(x.Mulher.Status)) && ((!x.Homem?.Checkin ?? false) && (!x.Mulher?.Checkin ?? false)))));

                }


                filteredResultsCount = queryCasais.Count();
            }

            if (model.PadrinhoId != null)
            {
                if (model.PadrinhoId.Count == 0)
                {
                    queryCasais = queryCasais.Where(x => (!x.Homem.PadrinhoId.HasValue) || (!x.Mulher.PadrinhoId.HasValue));
                }
                else
                {
                    queryCasais = queryCasais
                        .Where(x =>
                            (x.Homem?.Padrinho != null &&
                             model.PadrinhoId.Contains(x.Homem.PadrinhoId.Value))
                                ||
                            (x.Mulher?.Padrinho != null &&
                             model.PadrinhoId.Contains(x.Mulher.PadrinhoId.Value))
                        );
                }
                filteredResultsCount = queryCasais.Count();
            }

            if (model.CirculoId != null)
            {
                queryCasais = queryCasais.Where(x => (x.Homem?.Circulos?.Any(y => model.CirculoId.Contains(y.CirculoId))) ?? false || (x.Mulher?.Circulos?.Any(y => model.CirculoId.Contains(y.CirculoId)) ?? false));
                filteredResultsCount = queryCasais.Count();
            }


            if (model.QuartoId != null)
            {
                queryCasais = queryCasais.Where(x => (x.Homem?.Quartos?.Any(y => model.QuartoId.Contains(y.QuartoId))) ?? false || (x.Mulher?.Quartos?.Any(y => model.QuartoId.Contains(y.QuartoId)) ?? false));
                filteredResultsCount = queryCasais.Count();
            }


            if (model.search != null && model.search.value != null)
            {
                model.search.value = model.search.value.RemoveAccents();
                queryCasais = queryCasais.Where(x => x.Homem != null ? ((x.Homem.Nome.RemoveAccents().Contains(model.search.value)) || (x.Homem.Conjuge.RemoveAccents().Contains(model.search.value))) : (x.Mulher.Nome.RemoveAccents().Contains(model.search.value)) || (x.Mulher.Conjuge.RemoveAccents().Contains(model.search.value)));
                filteredResultsCount = queryCasais.Count();
            }


            if (extract == "excel")
            {
                Guid g = Guid.NewGuid();
                var data = mapper.Map<IEnumerable<ParticipanteExcelViewModel>>(result);

                Session[g.ToString()] = datatableService.GenerateExcel(data.ToList(), model.Campos);

                return Content(g.ToString());
            }

            filteredResultsCount = queryCasais.Count();

            var queryNova = queryCasais.Select(x => new
            {
                Dupla = (x.Homem != null & x.Mulher != null) ? x.Homem.Apelido + " e " + x.Mulher.Apelido : null,
                x.Homem,
                x.Mulher,
            });

            queryNova = queryNova.OrderBy(x => x.Dupla).Skip(model.Start.Value)
                .Take(model.Length.Value);

            List<Data.Entities.Participante> resultCasais = new List<Data.Entities.Participante>();

            queryNova.ToList().ForEach(casal =>
            {
                if (casal.Homem != null)
                {
                    casal.Homem.Dupla = casal.Dupla;
                    resultCasais.Add(casal.Homem);
                }
                if (casal.Mulher != null)
                {
                    casal.Mulher.Dupla = casal.Dupla;
                    resultCasais.Add(casal.Mulher);
                }
            });

            return Json(new
            {
                data = mapper.Map<IEnumerable<ParticipanteListModel>>(resultCasais),
                recordsTotal = totalResultsCount,
                recordsFiltered = filteredResultsCount,
            }, JsonRequestBehavior.AllowGet);


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
    }
}