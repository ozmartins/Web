import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def convert_cost(cost, originUnit, targetUnit):
    if originUnit == targetUnit:
        return cost

    prompt = f"""O valor {cost} corresponde ao preço de um produto na unidade de medida {originUnit}.
Qual o preço correspondente na unidade de medida {targetUnit}.
Seu retorno deve ser extremamente conciso, ou seja, me devolva apenas o número já devidamente convertido."""
    
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "Você é um especialista em conversão de unidades de medida"},
            {"role": "user", "content": prompt}
        ]
    )    

    return float(response.choices[0].message.content)
