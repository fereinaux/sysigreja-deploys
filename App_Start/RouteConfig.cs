﻿using System.Web.Mvc;
using System.Web.Routing;

namespace SysIgreja
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");
            routes.MapMvcAttributeRoutes();

            routes.MapRoute(
                name: "Detalhes",
                url: "{nome}/inscricoes",
                defaults: new { controller = "Inscricoes", action = "DetalhesByNome" },
                constraints: new { nome = @"^[a-zA-Z0-9\-\/_]{2,}$" }
            );

            routes.MapRoute(
                name: "Presenca",
                url: "{nome}/presenca",
                defaults: new { controller = "Inscricoes", action = "PresencaByNome" },
                constraints: new { nome = @"^[a-zA-Z0-9\-\/_]{2,}$" }
            );

            routes.MapRoute(
                name: "Inscrições Equipe",
                url: "{nome}/equipe",
                defaults: new { controller = "Inscricoes", action = "GoToEquipe" },
                constraints: new { nome = @"^[a-zA-Z0-9\-\/_]{2,}$" }
            );

            routes.MapRoute(
                name: "Logo",
                url: "{nome}/logo",
                defaults: new { controller = "Inscricoes", action = "LogoByNome" },
                constraints: new { nome = @"^[a-zA-Z0-9\-\/_]{2,}$" }
            );

            routes.MapRoute(
            name: "LogoLogin",
            url: "/logoLogin",
            defaults: new { controller = "Inscricoes", action = "LogoLogin" }
        );

            routes.MapRoute(
                name: "Background",
                url: "{nome}/background",
                defaults: new { controller = "Inscricoes", action = "BackgroundByNome" },
                constraints: new { nome = @"^[a-zA-Z0-9\-\/_]{2,}$" }
            );

            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new
                {
                    controller = "Inscricoes",
                    action = "Index",
                    id = UrlParameter.Optional
                }
            );
        }
    }
}
