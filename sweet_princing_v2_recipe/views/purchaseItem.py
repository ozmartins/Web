from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
from django.views.decorators.http import require_POST, require_GET
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from ..models import PurchaseItem, Ingredient, Purchase
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
    
    ingredient = Ingredient.objects.for_user(request.user).filter(id=purchaseItem.ingredient.id).first()
    ingredient.lastCost = purchaseItem.total / purchaseItem.quantity    
    ingredient.unitOfMeasure = purchaseItem.unitOfMeasure
    ingredient.save()

    purchase = Purchase.objects.for_user(request.user).filter(id=purchaseItem.purchase.id).first()
    purchase.total = sum(item.total for item in PurchaseItem.objects.for_user(request.user).filter(purchase__id=purchase.id))
    purchase.save()
    
    return JsonResponse({
            "ok": True,
            "id": purchaseItem.pk
        })


@login_required
@require_GET
def purchase_item_recover(request, pk: int): 
    query = request.GET.get("q", "")        
    purchaseItems = PurchaseItem.objects.for_user(request.user).filter(purchase__id=pk)
    if (query):
        purchaseItems = purchaseItems.filter(ingredient__name__icontains=query)   
    page = Paginator(purchaseItems, 10).get_page(request.GET.get("page"))
    return render(request, "purchaseItem/index.html", {
        "data": {
            "entities": page.object_list,
            "pagination": page,
            "title": "Itens comprados",
            "new_button_label": "Adicionar item",
            "purchase_id": pk
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
    
    ingredient = Ingredient.objects.for_user(request.user).filter(id=purchaseItem.ingredient.id).first()
    ingredient.lastCost = purchaseItem.total / purchaseItem.quantity    
    ingredient.unitOfMeasure = purchaseItem.unitOfMeasure
    ingredient.save()    

    purchase = Purchase.objects.for_user(request.user).filter(id=purchaseItem.purchase.id).first()
    purchase.total = sum(item.total for item in PurchaseItem.objects.for_user(request.user).filter(purchase__id=purchase.id))
    purchase.save()

    return JsonResponse({"ok": True, "id": purchaseItem.pk})


@login_required
@require_POST
def purchase_item_delete(_, pk: int):
    purchaseItem = get_object_or_404(PurchaseItem, pk=pk)
    purchaseItem.delete()
    return JsonResponse({ "OK": True })