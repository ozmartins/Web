var productIdForExistingRecipe = 0;

const editRecipeModalElement = select("#editRecipeModal");

const getEditRecipeModal = () => bootstrap.Modal.getOrCreateInstance(editRecipeModalElement);

const initEditRecipeModule = () => {
    const editRecipeForm = select("#editRecipeForm");
    const saveEditedRecipeButton = select("#btnSaveRecipe");

    const idInput = select("#edt-id");

    const productSelect = select("#edit-recipe-product");
    const productError = select("#edit-recipe-product-error");

    const yieldsInput = select("#edit-recipe-yields");
    const yieldsError = select("#edit-recipe-yields-error");

    const prepTimeInput = select("#edit-recipe-preptime");
    const prepTimeError = select("#edit-recipe-preptime-error");

    const generalError = select("#edit-recipe-general-error");

    const clearEditRecipeErrors = () => {
        productSelect.classList.remove("is-invalid");
        productError.textContent = "";

        yieldsInput.classList.remove("is-invalid");
        yieldsError.textContent = "";

        prepTimeInput.classList.remove("is-invalid");
        prepTimeError.textContent = "";
    };

    onEvent(editRecipeModalElement, "show.bs.modal", () => {
        clearEditRecipeErrors();
    });

    delegateEvent(document, "click", ".btn-recipe-edit", (_evt, button) => {
        clearEditRecipeErrors();
        productIdForExistingRecipe = button.dataset.product ?? "";
        idInput.value = button.dataset.id ?? "";
        yieldsInput.value = button.dataset.yields?.replace(".", "").replace(",", ".") ?? "";
        prepTimeInput.value = button.dataset.preptime ?? "";
        getEditRecipeModal().show();
    });

    onEvent(editRecipeForm, "submit", async evt => {
        evt.preventDefault();
        clearEditRecipeErrors();

        const id = (idInput.value ?? "").trim();
        const product = (productSelect.value ?? "").trim();
        const yields = (yieldsInput.value ?? "").trim();
        const prepTime = (prepTimeInput.value ?? "").trim();

        if (!id) { generalError.classList.remove("d-none"); generalError.textContent = "ID inválido ."; return; }
        if (!product) { productSelect.classList.add("is-invalid"); productError.textContent = "Informe o produto."; return; }
        if (!yields) { yieldsInput.classList.add("is-invalid"); yieldsError.textContent = "Informe o rendimento da receita."; return; }
        if (!prepTime) { prepTimeInput.classList.add("is-invalid"); prepTimeError.textContent = "Informe o tempo de preparo da receita."; return; }

        try {
            const formData = new FormData(editRecipeForm);
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

            getEditRecipeModal().hide();
            showAlertMessage("Registro salvo com sucesso");
            window.location.reload();
        } catch {
            generalError.classList.remove("d-none");
            generalError.textContent = "Erro de rede. Por favor, tente novamente.";
        } finally {
            saveEditedRecipeButton.disabled = false;
        }
    });
};

document.addEventListener("DOMContentLoaded", initEditRecipeModule);