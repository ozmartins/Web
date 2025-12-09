from decimal import Decimal
from django.test import TestCase
from django.utils import timezone

from sweet_princing_v2_recipe.models import (
    Product,
    Ingredient,
    Recipe,
    RecipeItem,
    Supplier,
    Purchase,
    PurchaseItem,
)


class ProductModelTests(TestCase):
    def test_can_create_product_with_price(self):
        product = Product.objects.create(
            name="Bolo de Chocolate",
            price=Decimal("45.90"),
        )

        self.assertIsNotNone(product.id)
        self.assertEqual(product.name, "Bolo de Chocolate")
        self.assertEqual(product.price, Decimal("45.90"))


class IngredientModelTests(TestCase):
    def test_can_create_ingredient_with_last_cost(self):
        ingredient = Ingredient.objects.create(
            name="Farinha de Trigo",
            lastCost=Decimal("4.50"),
        )

        self.assertIsNotNone(ingredient.id)
        self.assertEqual(ingredient.name, "Farinha de Trigo")
        self.assertEqual(ingredient.lastCost, Decimal("4.50"))


class RecipeModelTests(TestCase):
    def test_can_create_recipe_for_product(self):
        product = Product.objects.create(
            name="Bolo Cenoura",
            price=Decimal("32.50"),
        )

        recipe = Recipe.objects.create(
            product=product,
            yields=Decimal("8.00"),
            preparationTimeInMinutes=60,
        )

        self.assertIsNotNone(recipe.id)
        self.assertEqual(recipe.product, product)
        self.assertEqual(recipe.yields, Decimal("8.00"))
        self.assertEqual(recipe.preparationTimeInMinutes, 60)

    def test_product_can_have_only_one_recipe(self):
        product = Product.objects.create(
            name="Bolo Red Velvet",
            price=Decimal("58.00"),
        )

        Recipe.objects.create(
            product=product,
            yields=Decimal("10.00"),
            preparationTimeInMinutes=90,
        )

        # Tentar criar outra receita pro mesmo produto deve falhar
        with self.assertRaises(Exception):
            Recipe.objects.create(
                product=product,
                yields=Decimal("5.00"),
                preparationTimeInMinutes=30,
            )


class RecipeItemModelTests(TestCase):
    def test_can_create_recipe_item_with_unit_choices(self):
        product = Product.objects.create(
            name="Bolo de Chocolate",
            price=Decimal("45.90"),
        )
        recipe = Recipe.objects.create(
            product=product,
            yields=Decimal("1.00"),
            preparationTimeInMinutes=60,
        )
        ingredient = Ingredient.objects.create(
            name="Açúcar",
            lastCost=Decimal("3.80"),
        )

        item = RecipeItem.objects.create(
            recipe=recipe,
            ingredient=ingredient,
            quantity=Decimal("200.00"),
            unitOfMeasure=2,  # Grama
        )

        self.assertIsNotNone(item.id)
        self.assertEqual(item.recipe, recipe)
        self.assertEqual(item.ingredient, ingredient)
        self.assertEqual(item.quantity, Decimal("200.00"))
        self.assertEqual(item.unitOfMeasure, 2)  # Grama (pelo seu choices)


class SupplierModelTests(TestCase):
    def test_can_create_supplier(self):
        supplier = Supplier.objects.create(
            name="Casa dos Confeiteiros",
        )

        self.assertIsNotNone(supplier.id)
        self.assertEqual(supplier.name, "Casa dos Confeiteiros")


class PurchaseModelTests(TestCase):
    def test_can_create_purchase_and_auto_set_date(self):
        supplier = Supplier.objects.create(
            name="Doce & Cia Distribuidora",
        )

        purchase = Purchase.objects.create(
            supplier=supplier,
            total=Decimal("150.75"),
        )

        self.assertIsNotNone(purchase.id)
        self.assertEqual(purchase.supplier, supplier)
        self.assertEqual(purchase.total, Decimal("150.75"))
        # auto_now_add -> data de hoje (no timezone configurado)
        self.assertEqual(purchase.create_at, timezone.localdate())


class PurchaseItemModelTests(TestCase):
    def test_can_create_purchase_item_and_total(self):
        supplier = Supplier.objects.create(
            name="Empório do Açúcar",
        )
        ingredient = Ingredient.objects.create(
            name="Açúcar Refinado",
            lastCost=Decimal("3.80"),
        )
        purchase = Purchase.objects.create(
            supplier=supplier,
            total=Decimal("0.00"),  # depois poderia ser atualizado
        )

        item = PurchaseItem.objects.create(
            purchase=purchase,
            ingredient=ingredient,
            quantity=Decimal("10.00"),
            unitOfMeasure=10,  # Unidade
            total=Decimal("38.00"),
        )

        self.assertIsNotNone(item.id)
        self.assertEqual(item.purchase, purchase)
        self.assertEqual(item.ingredient, ingredient)
        self.assertEqual(item.quantity, Decimal("10.00"))
        self.assertEqual(item.unitOfMeasure, 10)
        self.assertEqual(item.total, Decimal("38.00"))
