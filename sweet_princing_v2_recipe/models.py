from django.db import models


class Product(models.Model):    
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)    

    class Meta:
        verbose_name = "Produto"
        verbose_name_plural = "Produtos"


class Recipe(models.Model):    
    product = models.OneToOneField(
        Product,
        on_delete=models.CASCADE,
        blank=True        
    )

    yields = models.DecimalField(
        max_digits=5,
        decimal_places=2
    )
    preparationTimeInMinutes = models.IntegerField()

    class Meta:
        verbose_name = "Receita"
        verbose_name_plural = "Receitas"


class Supplier(models.Model):
    name = models.CharField(max_length=100)
    class Meta:
        verbose_name = "Fornecedor"
        verbose_name_plural = "Fornecedores"


class Purchase(models.Model):
    supplier = models.ForeignKey(
        'Supplier',
        on_delete=models.RESTRICT
    )
    create_at = models.DateField(auto_now_add=True, blank=True)
    total = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    class Meta:
        verbose_name = "Compra"
        verbose_name_plural = "Compras"


class Ingredient(models.Model):
    name = models.CharField(max_length=100)
    lastCost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    class Meta:
        verbose_name = "Ingrediente"
        verbose_name_plural = "Ingredientes"
