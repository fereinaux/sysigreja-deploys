using System.Data.Entity;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using Data.Context;
using OfficeOpenXml.FormulaParsing.Excel.Functions.Math;
using Serilog;
using Web;

namespace SysIgreja
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            SqlServerTypes.Utilities.LoadNativeAssemblies(Server.MapPath("~/bin"));
            Database.SetInitializer(
                new MigrateDatabaseToLatestVersion<
                    ApplicationDbContext,
                    Data.Migrations.Configuration
                >()
            );
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
            UnityConfig.RegisterComponents();
            var log = new LoggerConfiguration().WriteTo.File(System.Web.Hosting.HostingEnvironment.MapPath("~/bin/Logs/log.txt"))
       .CreateLogger();
            Serilog.Log.Logger = log;
            Serilog.Log.Logger.Information("Hello - Application_Start"); //Works
        }

        protected void Application_EndRequest()
        {
            var context = new HttpContextWrapper(this.Context);
            if (
                context.Response.StatusCode == 302
                && context.Response.SuppressFormsAuthenticationRedirect
            )
            {
                context.Response.Clear();
                context.Response.StatusCode = 401;
            }
        }
    }
}
