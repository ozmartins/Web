let productId = 0;

const editEntityModalElement = select("#editEntityModal");

const getEditEntityModal = () => bootstrap.Modal.getOrCreateInstance(editEntityModalElement);

const initEditEntityModule = () => {
    const editEntityForm = select("#editEntityForm");
    const saveEditedEntityButton = select("#btnSaveEntity");

    const idInput = select("#edt-id");

    const productSelect = select("#edit-entity-product");
    const productError = select("#edit-entity-product-error");

    const yieldsInput = select("#edit-entity-yields");
    const yieldsError = select("#edit-entity-yields-error");

    const prepTimeInput = select("#edit-entity-preptime");
    const prepTimeError = select("#edit-entity-preptime-error");

    const generalError = select("#edit-entity-general-error");

    const clearEditEntityErrors = () => {
        productSelect.classList.remove("is-invalid");
        productError.textContent = "";

        yieldsInput.classList.remove("is-invalid");
        yieldsError.textContent = "";

        prepTimeInput.classList.remove("is-invalid");
        prepTimeError.textContent = "";

        //generalError.classList.add("d-none");
        //generalError.textContent = "";
    };    

    onEvent(editEntityModalElement, "show.bs.modal", () => {        
        clearEditEntityErrors();        
    });

    delegateEvent(document, "click", ".btn-entity-edit", (_evt, button) => {
        clearEditEntityErrors();
        productId = button.dataset.product ?? "";
        idInput.value = button.dataset.id ?? "";
        yieldsInput.value = button.dataset.yields.replace(".", "").replace(",", ".") ?? "";
        prepTimeInput.value = button.dataset.preptime ?? "";
        getEditEntityModal().show();
    });

    onEvent(editEntityForm, "submit", async evt => {
        evt.preventDefault();
        clearEditEntityErrors();

        const id = (idInput.value ?? "").trim();
        const product = (productSelect.value ?? "").trim();
        const yields = (yieldsInput.value ?? "").trim();
        const prepTime = (prepTimeInput.value ?? "").trim();

        if (!id) { generalError.classList.remove("d-none"); generalError.textContent = "ID inválido ."; return; }
        if (!product) { productSelect.classList.add("is-invalid"); productError.textContent = "Informe o produto."; return; }
        if (!yields) { yieldsInput.classList.add("is-invalid"); yieldsError.textContent = "Informe o rendimento da receita."; return; }
        if (!prepTime) { prepTimeInput.classList.add("is-invalid"); prepTimeError.textContent = "Informe o tempo de preparo da receita."; return; }
        
        try {
            const formData = new FormData(editEntityForm);
            const updateUrl = "update/" + encodeURIComponent(id);
            const { ok, data } = await httpRequest(updateUrl, { method: "POST", body: formData });

            if (!ok || !data?.ok) {
                if (data?.errors?.product) {
                    productSelect.classList.add("is-invalid");
                    productError.textContent = data.errors.product.join(" ");
                } 
                else if (data?.errors?.yields) {
                    yieldsInput.classList.add("is-invalid");
                    yieldsError.textContent = data.errors.yields.join(" ");
                }
                else if (data?.errors?.prepTime) {
                    prepTimeInput.classList.add("is-invalid");
                    prepTimeError.textContent = data.errors.prepTime.join(" ");
                }
                else {
                    generalError.classList.remove("d-none");
                    generalError.textContent = "Não foi possivel salvar o registro. Tente novamente.";
                }
                return;
            }

            getEditEntityModal().hide();
            showAlertMessage("Registro salvo com sucesso");
            window.location.reload();
        } catch {
            generalError.classList.remove("d-none");
            generalError.textContent = "Erro de rede. Por favor, tente novamente.";
        } finally {
            saveEditedEntityButton.disabled = false;
        }
    });
};

document.addEventListener("DOMContentLoaded", initEditEntityModule);