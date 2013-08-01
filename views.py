# Create your views here.
from django.template import loader, Context
from django.http import HttpResponse
from mathpart.main import get_json as get_json_from_mathpart

def get_json(request):
    a = request.GET
    try:
        r = get_json_from_mathpart(a['u0'], a['du0'], a['mu1'], a['mu2'], a['f'], a['a'], a['l'], a['T'], a['sigma'])
        return HttpResponse(a['callback'] + '(' + r + ')', content_type="application/json")
    except Exception:
        return HttpResponse('''Hi! You shouldn't use this page. This page is used only by program.<br>
        Try <a href="http://orbital.pythonanywhere.com/oscill">this</a>.''')


def oscillmain(request):
    return HttpResponse(loader.get_template('oscillmain.html').render(Context({})))
