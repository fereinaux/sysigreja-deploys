using System.Configuration;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web.Mvc;
using Core.Business.Devocional;

namespace SysIgreja.Controllers
{
    [Authorize]
    public class DevocionalController : System.Web.Mvc.Controller
    {
        private readonly IDevocionalBusiness devocionalBusiness;

        public DevocionalController(IDevocionalBusiness devocionalBusiness)
        {
            this.devocionalBusiness = devocionalBusiness;
        }

        [HttpGet]
        public async Task<ActionResult> Index()
        {
            var devocional = devocionalBusiness.GetDevocional();
            if (devocional == null)
            {
                using (var client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Accept.Clear();
                    client.DefaultRequestHeaders.Accept.Add(
                        new MediaTypeWithQualityHeaderValue("application/json")
                    );

                    var key = ConfigurationManager.AppSettings["GoogleKey"];
                    var channelId = ConfigurationManager.AppSettings["ChannelId"];
                    var order = "date";
                    var maxResults = 3;
                    var part = "snippet";

                    HttpResponseMessage response = await client.GetAsync(
                        $"https://www.googleapis.com/youtube/v3/search?key={key}&channelId={channelId}&order={order}&maxResults={maxResults}&part={part}"
                    );
                    if (response.IsSuccessStatusCode)
                    {
                        string jsondata = await response.Content.ReadAsStringAsync();
                        devocionalBusiness.PostDevocional(
                            new Core.Models.Devocional.PostDevocionalModel { Conteudo = jsondata }
                        );
                        return Content(jsondata, "application/json");
                    }
                    return Json(1, JsonRequestBehavior.AllowGet);
                }
            }
            else
            {
                return Content(devocional.Conteudo, "application/json");
            }
        }
    }
}
