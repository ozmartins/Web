var ingredientIdForEditing = 0;

const editPurchaseItemModalElement = select("#editPurchaseItemModal");

const getEditPurchaseItemModal = () => {
    return bootstrap.Modal.getOrCreateInstance(editPurchaseItemModalElement);
}

const initEditPurchaseItemModule = () => {
    const editPurchaseItemForm = select("#editPurchaseItemForm");

    const purchaseItemIdInput = select("#purchase-item-id");

    const ingredientInput = select("#edit-purchase-item-ingredient");
    const ingredientError = select("#edit-purchase-item-ingredient-error");

    const quantityInput = select("#edit-purchase-item-quantity");
    const quantityError = select("#edit-purchase-item-quantity-error");

    const unitInput = select("#edit-purchase-item-unit");
    const unitError = select("#edit-purchase-item-unit-error");

    const totalInput = select("#edit-purchase-item-total");
    const totalError = select("#edit-purchase-item-total-error");

    const generalError = select("#edit-purchase-item-general-error");

    const clearEditPurchaseItemErrors = () => {
        ingredientInput.classList.remove("is-invalid");
        ingredientError.textContent = "";

        quantityInput.classList.remove("is-invalid");
        quantityError.textContent = "";

        unitInput.classList.remove("is-invalid");
        unitError.textContent = "";

        totalInput.classList.remove("is-invalid");
        totalError.textContent = "";
    };

    onEvent(editPurchaseItemModalElement, "show.bs.modal", async () => {
        clearEditPurchaseItemErrors();
        const select = document.getElementById('edit-purchase-item-ingredient');
        const { ok, data } = await httpRequest('/ingredient/search', { method: "GET" });

        if (!ok) {
            getEditPurchaseItemModal().hide();
            showAlertMessage("Não foi possível carregar a lista de ingredientes. Tente novamente.");
        }

        data.ingredients.forEach(ingredient => {
            const option = document.createElement('option');
            option.value = ingredient.id;
            option.textContent = ingredient.name;
            select.appendChild(option);
        });

        select.value = ingredientIdForEditing;
    });

    delegateEvent(document, "click", ".edit-purchase-item", (_evt, button) => {        
        ingredientIdForEditing = button.dataset.ingredient ?? "";
        clearEditPurchaseItemErrors();
        purchaseItemIdInput.value = button.dataset.id ?? "";
        ingredientInput.value = ingredientIdForEditing;
        quantityInput.value = button.dataset.quantity?.replace(".", "").replace(",", ".") ?? "";
        unitInput.value = button.dataset.unit ?? "";
        totalInput.value = button.dataset.total.replace(".", "").replace(",", ".") ?? "";
        getEditPurchaseItemModal().show();
    });

    onEvent(editPurchaseItemForm, "submit", async evt => {
        evt.preventDefault();
        clearEditPurchaseItemErrors();

        const ingredient = (ingredientInput.value ?? "").trim();
        const quantity = (quantityInput.value ?? "").trim();
        const unitOfMeasure = (unitInput.value ?? "").trim();

        if (!ingredient) { ingredientInput.classList.add("is-invalid"); ingredientError.textContent = "Informe o ingreediente."; return; }
        if (!quantity) { quantityInput.classList.add("is-invalid"); quantityError.textContent = "Informe a quantidade do ingrediente."; return; }
        if (!unitOfMeasure) { unitInput.classList.add("is-invalid"); unitError.textContent = "Informe a unidade de medida da quantidade."; return; }

        try {
            const formData = new FormData(editPurchaseItemForm);
            const updateUrl = "/purchase-item/update/" + encodeURIComponent(purchaseItemIdInput.value);
            const { ok, data } = await httpRequest(updateUrl, { method: "POST", body: formData });

            if (!ok || !data?.ok) {
                if (data?.errors?.ingredient) {
                    ingredientInput.classList.add("is-invalid");
                    ingredientError.textContent = data.errors.ingredient.join(" ");
                }
                else if (data?.errors?.quantity) {
                    quantityInput.classList.add("is-invalid");
                    quantityError.textContent = data.errors.quantity.join(" ");
                }
                else if (data?.errors?.unit) {
                    unitInput.classList.add("is-invalid");
                    unitError.textContent = data.errors.unit.join(" ");
                }
                else {
                    generalError.classList.remove("d-none");
                    generalError.textContent = "Não foi possivel salvar o registro. Tente novamente.";
                }
                return;
            }

            getEditPurchaseItemModal().hide();
            showAlertMessage("Registro salvo com sucesso");
            window.location.reload();
        } catch {
            generalError.classList.remove("d-none");
            generalError.textContent = "Erro de rede. Por favor, tente novamente.";
        }
    });
};

document.addEventListener("DOMContentLoaded", initEditPurchaseItemModule);