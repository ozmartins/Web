from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
from django.views.decorators.http import require_POST, require_GET
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from ..models import PurchaseItem
from ..forms import PurchaseItemForm


@login_required
@require_POST
def purchase_item_create(request):
    form = PurchaseItemForm(request.POST)    
    if not form.is_valid():
        return JsonResponse({
            "ok": False,
            "errors": form.errors
        })
    purchaseItem = form.save()
    purchaseItem.user = request.user
    purchaseItem.save()
    return JsonResponse({
            "ok": True,
            "id": purchaseItem.pk
        })


@login_required
@require_GET
def purchase_item_recover(request, pk: int):    
    purchaseItems = PurchaseItem.objects.for_user(request.user).filter(purchase__id=pk)
    page = Paginator(purchaseItems, 10).get_page(request.GET.get("page"))
    return render(request, "purchaseItem/index.html", {
        "data": {
            "entities": page.object_list,
            "pagination": page,
            "title": "Itens comprados",
            "new_button_label": "Adicionar item"
        }
    })


@login_required
@require_POST
def purchase_item_update(request, pk: int):
    purchaseItem = get_object_or_404(PurchaseItem, pk=pk)
    form = PurchaseItemForm(request.POST, instance=purchaseItem)
    if not form.is_valid():
        return JsonResponse({"ok": False, "errors": form.errors}, status=400)
    purchaseItem = form.save()
    return JsonResponse({"ok": True, "id": purchaseItem.pk})


@login_required
@require_POST
def purchase_item_delete(_, pk: int):
    purchaseItem = get_object_or_404(PurchaseItem, pk=pk)
    purchaseItem.delete()
    return JsonResponse({ "OK": True })