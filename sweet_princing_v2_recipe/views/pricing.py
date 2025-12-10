from django.shortcuts import render
from django.views.decorators.http import require_GET, require_POST
from django.contrib.auth.decorators import login_required
from ..models import Product, Recipe, RecipeItem
from . import open_ai


@login_required
@require_GET
def pricing_recover(request):
    products = Product.objects.for_user(request.user).order_by("name")
    return render(request, "pricing/index.html", {
        "data": {
            "products": products
        }
    })

@login_required
@require_POST
def pricing_calculate(request):
    product_id = int(request.POST["product"])
    products = Product.objects.for_user(request.user).order_by("name")    
    recipe = Recipe.objects.filter(product__id=product_id).first()
    items = RecipeItem.objects.filter(recipe__id=recipe.id)
    for item in items:        
        lastCost = open_ai.convert_cost(item.ingredient.lastCost, item.ingredient.get_unitOfMeasure_display(), item.get_unitOfMeasure_display())
        item.unitCost = lastCost
        item.totalCost = float(item.quantity) * float(item.unitCost)
    recipe.totalCost = sum(item.totalCost for item in items)

    minutesInAnHour = 60
    laborCost = 45.0
    totalLaborCost = laborCost * recipe.preparationTimeInMinutes / minutesInAnHour
    totalCost = float(recipe.totalCost) + float(totalLaborCost)
    profitMargin = 0.30
    costPlusProfitMargin = totalCost * (1 + profitMargin)
    suggestedPrice = float(costPlusProfitMargin) / float(recipe.yields)

    return render(request, "pricing/index.html", {
        "data": {
            "products": products,
            "product": product_id,
            "recipe": recipe,
            "items": items,
            "laborCost": laborCost,
            "totalLaborCost": totalLaborCost,
            "totalCost": totalCost,
            "profitMargin": profitMargin,
            "profitMarginForPresentation": profitMargin * 100,
            "profitMarginForPresentationForPresentation": str(profitMargin * 100).replace('.', '').replace(',', '.'),
            "costPlusProfitMargin": costPlusProfitMargin,
            "suggestedPrice": suggestedPrice
        }
    })