var purchaseIdForNewPurchaseItem = 0

const newPurchaseItemModal = select("#newPurchaseItemModal");

const getNewPurchaseItemModal = () => bootstrap.Modal.getOrCreateInstance(newPurchaseItemModal);

const initNewPurchaseItemModule = () => {
    if (!newPurchaseItemModal) return;

    const newPurchaseItemForm = select("#newPurchaseItemForm");
    const saveNewPurchaseButton = select("#newBtnSavePurchaseItem");

    const purchaseIdInput = select("#new-purchase-id");

    const ingredientInput = select("#new-purchase-item-ingredient");
    const ingredientError = select("#new-purchase-item-ingredient-error");

    const quantityInput = select("#new-purchase-item-quantity");
    const quantityError = select("#new-purchase-item-quantity-error");

    const unitInput = select("#new-purchase-item-unit");
    const unitError = select("#new-purchase-item-unit-error");

    const totalInput = select("#new-purchase-item-total");
    const totalError = select("#new-purchase-item-total-error");

    const generalError = select("#new-purchase-item-general-error");

    const clearNewPurchaseErrors = () => {
        ingredientInput.classList.remove("is-invalid");
        ingredientError.textContent = "";

        quantityInput.classList.remove("is-invalid");
        quantityError.textContent = "";

        unitInput.classList.remove("is-invalid");
        unitError.textContent = "";

        totalInput.classList.remove("is-invalid");
        totalError.textContent = "";
    };

    onEvent(newPurchaseItemModal, "show.bs.modal", async () => {
        newPurchaseItemForm?.reset();
        clearNewPurchaseErrors();

        const select = document.getElementById('new-purchase-item-ingredient');
        const { ok, data } = await httpRequest('/ingredient/search', { method: "GET" });

        if (!ok) {
            getNewPurchaseItemModal().hide();
            showAlertMessage("Não foi possível carregar a lista de ingredientes. Tente novamente.");
        }

        data.ingredients.forEach(ingredient => {
            const option = document.createElement('option');
            option.value = ingredient.id;
            option.textContent = ingredient.name;
            select.appendChild(option);
        });
    });

    onEvent(newPurchaseItemForm, "submit", async evt => {
        evt.preventDefault();
        clearNewPurchaseErrors();

        if (saveNewPurchaseButton) saveNewPurchaseButton.disabled = true;

        try {
            const formData = new FormData(newPurchaseItemForm);

            const { ok, data } = await httpRequest("/purchase-item/create", {
                method: "POST",
                body: formData
            });

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
                else if (data?.errors?.total) {
                    totalInput.classList.add("is-invalid");
                    totalError.textContent = data.errors.unit.join(" ");
                }
                else {
                    generalError.classList.remove("d-none");
                    generalError.textContent = "Não foi possivel salvar o registro. Tente novamente.";
                }
                return;
            }

            getNewPurchaseItemModal().hide();
            showAlertMessage("Registro salvo com sucesso");
            window.location.reload()
        } catch {
            if (generalError) {
                generalError.classList.remove("d-none");
                generalError.textContent = "Erro de rede. Por favor, tente novamente.";
            }
        } finally {
            if (saveNewPurchaseButton) saveNewPurchaseButton.disabled = false;
        }
    });

    delegateEvent(document, "click", "#add-ingredient", async (_evt, button) => {
        purchaseIdForNewPurchaseItem = button.dataset.purchase_id;
        purchaseIdInput.value = purchaseIdForNewPurchaseItem;
        getNewPurchaseItemModal().show();
    });
};

document.addEventListener("DOMContentLoaded", initNewPurchaseItemModule);