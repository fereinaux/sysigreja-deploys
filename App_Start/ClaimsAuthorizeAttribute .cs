using System.Linq;
using System.Security.Claims;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

public class ClaimsAuthorizeAttribute : AuthorizeAttribute
{
    public ClaimsAuthorizeAttribute() { }

    public override void OnAuthorization(AuthorizationContext filterContext)
    {        
        var user = HttpContext.Current.User as ClaimsPrincipal;

        if (user.Claims.Where(c => c.Type == ClaimTypes.Country)
            .Any(x => x.Value == "Brasil")
            && user.IsInRole("Administrador"))
        {
            base.OnAuthorization(filterContext);
        }
        else
        {
            filterContext.Result = new RedirectToRouteResult(
                              new RouteValueDictionary
                               {
                                         { "action", "Login" },
                                         { "controller", "Home" }
                               });
        }
    }

}