using System;
using System.Web.Mvc;
using System.Web.Script.Serialization;

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
            var pathAndQuery =
                httpContext.Request.Url != null
                    ? httpContext.Request.Url.PathAndQuery
                    : string.Empty;
            // remove timestamp added by ajax calls
            var index = pathAndQuery.IndexOf("_=", StringComparison.Ordinal);
            if (index > 0)
            {
                pathAndQuery = pathAndQuery.Substring(0, index - 1);
            }
            httpContext.Response.AddHeader("Location", pathAndQuery);
        }


    }

    public class HttpStatusCodeResult : ActionResult
    {
        private readonly int code;
        private readonly string message;
        public HttpStatusCodeResult(int code, string message)
        {
            this.code = code;
            this.message = message;
        }

        public override void ExecuteResult(System.Web.Mvc.ControllerContext context)
        {
            context.HttpContext.Response.StatusCode = code;
            if (code == 400)
            {
                context.HttpContext.Response.Write(new JavaScriptSerializer().Serialize(new JsonResult
                {
                    JsonRequestBehavior = JsonRequestBehavior.AllowGet,
                    Data = new
                    {
                        Message = message
                    }
                }.Data));
            }
        }
    }

    public class HandleExceptionAttribute : HandleErrorAttribute
    {
        public override void OnException(ExceptionContext filterContext)
        {
            if (filterContext.HttpContext.Request.IsAjaxRequest() && filterContext.Exception != null)
            {
                filterContext.HttpContext.Response.StatusCode = 400;

                var exe = filterContext.Exception;

                while (exe.InnerException != null)
                {
                    exe = exe.InnerException;
                }

                filterContext.Result = new JsonResult
                {
                    JsonRequestBehavior = JsonRequestBehavior.AllowGet,
                    Data = new
                    {
                        exe.Message,
                        filterContext.Exception.StackTrace
                    }
                };
                filterContext.ExceptionHandled = true;
            }
            else
            {
                base.OnException(filterContext);
            }
        }
    }
}
