using Core.Business.Account;
using Core.Business.Arquivos;
using Core.Business.Caronas;
using Core.Business.CentroCusto;
using Core.Business.Circulos;
using Core.Business.Configuracao;
using Core.Business.Cracha;
using Core.Business.Equipantes;
using Core.Business.Equipes;
using Core.Business.Etiquetas;
using Core.Business.Eventos;
using Core.Business.Lancamento;
using Core.Business.MeioPagamento;
using Core.Business.Mensagem;
using Core.Business.Newsletter;
using Core.Business.Padrinhos;
using Core.Business.Participantes;
using Core.Business.Quartos;
using Core.Business.Reunioes;
using Data.Context;
using Data.Entities;
using Data.Repository;
using System.Web.Mvc;
using Unity;
using Unity.Mvc5;
using Utils.Services;

namespace Web
{
    public static class UnityConfig
    {
        public static void RegisterComponents()
        {
            var container = new UnityContainer();

            DependencyResolver.SetResolver(new UnityDependencyResolver(container));

            container.RegisterType<IGenericRepositoryConsulta<ParticipanteConsulta>, GenericRepositoryConsulta<ParticipanteConsulta>>();
            container.RegisterType<IGenericRepositoryConsulta<EventoConsulta>, GenericRepositoryConsulta<EventoConsulta>>();
            container.RegisterType<IGenericRepositoryConsulta<EventoLoteConsulta>, GenericRepositoryConsulta<EventoLoteConsulta>>();
            container.RegisterType<IGenericRepository<Evento>, GenericRepository<Evento>>();
            container.RegisterType<IGenericRepository<ApplicationUser>, GenericRepository<ApplicationUser>>();
            container.RegisterType<IGenericRepository<Participante>, GenericRepository<Participante>>();
            container.RegisterType<IGenericRepository<Login>, GenericRepository<Login>>();
            container.RegisterType<IGenericRepository<Newsletter>, GenericRepository<Newsletter>>();
            container.RegisterType<IGenericRepository<EventoLote>, GenericRepository<EventoLote>>();
            container.RegisterType<IGenericRepository<Cracha>, GenericRepository<Cracha>>();
            container.RegisterType<IGenericRepository<Padrinho>, GenericRepository<Padrinho>>();
            container.RegisterType<IGenericRepository<MeioPagamento>, GenericRepository<MeioPagamento>>();
            container.RegisterType<IGenericRepository<ReuniaoEvento>, GenericRepository<ReuniaoEvento>>();
            container.RegisterType<IGenericRepository<Equipante>, GenericRepository<Equipante>>();
            container.RegisterType<IGenericRepository<EquipanteEvento>, GenericRepository<EquipanteEvento>>();
            container.RegisterType<IGenericRepository<PresencaReuniao>, GenericRepository<PresencaReuniao>>();
            container.RegisterType<IGenericRepository<Equipe>, GenericRepository<Equipe>>();
            container.RegisterType<IGenericRepository<ConfiguracaoEquipes>, GenericRepository<ConfiguracaoEquipes>>();
            container.RegisterType<IGenericRepository<CentroCusto>, GenericRepository<CentroCusto>>();
            container.RegisterType<IGenericRepository<Lancamento>, GenericRepository<Lancamento>>();
            container.RegisterType<IGenericRepository<Arquivo>, GenericRepository<Arquivo>>();
            container.RegisterType<IGenericRepository<Circulo>, GenericRepository<Circulo>>();
            container.RegisterType<IGenericRepository<Quarto>, GenericRepository<Quarto>>();
            container.RegisterType<IGenericRepository<Etiqueta>, GenericRepository<Etiqueta>>();
            container.RegisterType<IGenericRepository<CirculoParticipante>, GenericRepository<CirculoParticipante>>();
            container.RegisterType<IGenericRepository<CirculoDirigentes>, GenericRepository<CirculoDirigentes>>();
            container.RegisterType<IGenericRepository<ParticipantesEtiquetas>, GenericRepository<ParticipantesEtiquetas>>();
            container.RegisterType<IGenericRepository<QuartoParticipante>, GenericRepository<QuartoParticipante>>();
            container.RegisterType<IGenericRepository<Mensagem>, GenericRepository<Mensagem>>();
            container.RegisterType<IGenericRepository<Configuracao>, GenericRepository<Configuracao>>();
            container.RegisterType<IGenericRepository<ConfiguracaoCampos>, GenericRepository<ConfiguracaoCampos>>();
            container.RegisterType<IGenericRepository<ConfiguracaoCamposEquipe>, GenericRepository<ConfiguracaoCamposEquipe>>();
            container.RegisterType<IGenericRepository<Carona>, GenericRepository<Carona>>();
            container.RegisterType<IGenericRepository<CaronaParticipante>, GenericRepository<CaronaParticipante>>();

            container.RegisterType<IEmailSender, EmailSender>();
            container.RegisterType<IDatatableService, DatatableService>();

            container.RegisterType<IPadrinhosBusiness, PadrinhosBusiness>();
            container.RegisterType<IArquivosBusiness, ArquivosBusiness>();
            container.RegisterType<ILancamentoBusiness, LancamentoBusiness>();
            container.RegisterType<ICentroCustoBusiness, CentroCustoBusiness>();
            container.RegisterType<IEquipantesBusiness, EquipantesBusiness>();
            container.RegisterType<IEquipesBusiness, EquipesBusiness>();
            container.RegisterType<IEventosBusiness, EventosBusiness>();
            container.RegisterType<INewsletterBusiness, NewsletterBusiness>();
            container.RegisterType<IParticipantesBusiness, ParticipantesBusiness>();
            container.RegisterType<IEtiquetasBusiness, EtiquetasBusiness>();
            container.RegisterType<IMeioPagamentoBusiness, MeioPagamentoBusiness>();
            container.RegisterType<IAccountBusiness, AccountBusiness>();
            container.RegisterType<IReunioesBusiness, ReunioesBusiness>();
            container.RegisterType<ICirculosBusiness, CirculosBusiness>();
            container.RegisterType<ICrachaBusiness, CrachaBusiness>();
            container.RegisterType<ICaronasBusiness, CaronasBusiness>();
            container.RegisterType<IQuartosBusiness, QuartosBusiness>();
            container.RegisterType<IMensagemBusiness, MenssagemBusinesss>();
            container.RegisterType<IConfiguracaoBusiness, ConfiguracaoBusiness>();
        }
    }
}