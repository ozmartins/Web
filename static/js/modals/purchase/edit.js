var purchaseIdForEditing = 0;
var supplierIdForEditing = 0;

const editPurchaseModalElement = select("#editPurchaseModal");

const getEditPurchaseModal = () => {
    return bootstrap.Modal.getOrCreateInstance(editPurchaseModalElement);
}

const initEditPurchaseModule = () => {
    const editPurchaseForm = select("#editPurchaseForm");

    const purchasedInput = select("#purchase-id");

    const supplierInput = select("#edit-purchase-supplier");
    const supplierError = select("#edit-purchase-supplier-error");

    const generalError = select("#edit-purchase-general-error");

    const clearEditPurchaseErrors = () => {
        supplierInput.classList.remove("is-invalid");
        supplierError.textContent = "";
    };

    onEvent(editPurchaseModalElement, "show.bs.modal", async () => {
        clearEditPurchaseErrors();
        const select = document.getElementById('edit-purchase-supplier');
        const { ok, data } = await httpRequest('/supplier/search', { method: "GET" });

        if (!ok) {
            getEditPurchaseModal().hide();
            showAlertMessage("Não foi possível carregar a lista de fornecedores. Tente novamente.");
        }

        data.suppliers.forEach(supplier => {
            const option = document.createElement('option');
            option.value = supplier.id;
            option.textContent = supplier.name;
            select.appendChild(option);
        });

        select.value = supplierIdForEditing;
    });

    delegateEvent(document, "click", ".edit-purchase", (_evt, button) => {
        supplierIdForEditing = button.dataset.supplier ?? "";
        purchaseIdForEditing = button.dataset.id ?? "";
        clearEditPurchaseErrors();
        getEditPurchaseModal().show();
    });

    onEvent(editPurchaseForm, "submit", async evt => {
        evt.preventDefault();
        clearEditPurchaseErrors();

        const supplier = (supplierInput.value ?? "").trim();

        if (!supplier) {
            ingredientInput.classList.add("is-invalid");
            supplierError.textContent = "Informe o fornecedor.";
            return;
        }

        try {
            const formData = new FormData(editPurchaseForm);
            const updateUrl = "/purchase/update/" + encodeURIComponent(purchaseIdForEditing);
            window.alert(updateUrl);
            const { ok, data } = await httpRequest(updateUrl, { method: "POST", body: formData });

            if (!ok || !data?.ok) {
                if (data?.errors?.supplier) {
                    supplierInput.classList.add("is-invalid");
                    supplierError.textContent = data.errors.supplier.join(" ");
                }
                else {
                    generalError.classList.remove("d-none");
                    generalError.textContent = "Não foi possivel salvar o registro. Tente novamente.";
                }
                return;
            }

            getEditPurchaseModal().hide();
            showAlertMessage("Registro salvo com sucesso");
            window.location.reload();
        } catch {
            generalError.classList.remove("d-none");
            generalError.textContent = "Erro de rede. Por favor, tente novamente.";
        }
    });
};

document.addEventListener("DOMContentLoaded", initEditPurchaseModule);