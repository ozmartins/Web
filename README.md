
> *A estrutura pode variar conforme evolução do projeto.*

---

## 🛠️ Tecnologias utilizadas

| Tecnologia | Uso |
|-----------|-----|
| **Python 3** | Linguagem backend |
| **Django** | Framework principal |
| **Bootstrap** | Estilização frontend |
| **SQLite** | Banco de dados padrão |
| **JavaScript** | Interatividade e validações |

---

## 🚀 Como executar o projeto

Requisitos: Python 3.10+ instalado

```bash
# Clonar repositório
git clone https://github.com/ozmartins/Sweet-Pricing.git
cd Sweet-Pricing

# Criar ambiente virtual
python -m venv .venv
source .venv/bin/activate   # Linux/Mac
.\.venv\Scripts\activate    # Windows

# Instalar dependências
pip install -r requirements.txt

# Criar estrutura do banco
python manage.py migrate

# Executar servidor local
python manage.py runserver
