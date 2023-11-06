using System;
using System.Web.Mvc;

namespace SysIgreja
{
    public class SpaResponseAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuted(ActionExecutedContext filterContext)
        {
            if (filterContext.IsChildAction || !filterContext.HttpContext.Request.IsAjaxRequest())
            {
                return;
            }
            var httpContext = filterContext.HttpContext;
            var pathAndQuery = httpContext.Request.Url != null ? httpContext.Request.Url.PathAndQuery : string.Empty;
            // remove timestamp added by ajax calls
            var index = pathAndQuery.IndexOf("_=", StringComparison.Ordinal);
            if (index > 0)
            {
                pathAndQuery = pathAndQuery.Substring(0, index - 1);
            }
            httpContext.Response.AddHeader("Location", pathAndQuery);
        }
    }
}
