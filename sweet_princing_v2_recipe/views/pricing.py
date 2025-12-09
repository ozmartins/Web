from django.shortcuts import render
from django.views.decorators.http import require_GET
from django.contrib.auth.decorators import login_required


@login_required
@require_GET
def pricing_recover(request):    
    return render(request, "pricing/index.html", {})