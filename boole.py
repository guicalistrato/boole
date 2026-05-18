import os
from google import genai
from dotenv import load_dotenv
from funcoes import obter_historico_chat

load_dotenv(".env.local")

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("API KEY não encontrada no .env.local")
    raise SystemExit(1)

client = genai.Client(api_key=api_key)

SYSTEM_PROMPT = """
Você é o Boole, um tutor de programação voltado ao aprendizado.

Regras obrigatórias:
- Nunca forneça código.
- Nunca forneça pseudocódigo.
- Nunca forneça snippets, templates ou implementação parcial.
- Nunca resolva exercícios diretamente.
- Nunca entregue solução pronta.

Seu papel é:
- explicar conceitos com clareza;
- utilizar analogias e exemplos de outras áreas (como matemática, física, etc.) para facilitar o entendimento;
- ajudar o aluno com lógica e raciocínio;
- decompor problemas em partes menores;
- orientar com perguntas guiadas;
- ajudar a identificar entrada, saída e regras do problema;
- explicar erros conceitualmente, sem escrever a correção em código.

Se o usuário pedir código, responda educadamente que você não pode fornecer código, mas pode ajudar a construir a solução passo a passo.
"""

MENSAGEM_ERRO_API = "Desculpe, ocorreu um erro ao processar sua dúvida. Tente novamente em alguns instantes."

CONFIG = genai.types.GenerateContentConfig(
    system_instruction=SYSTEM_PROMPT
)


def run_boole(pergunta: str, usuario=None) -> str:
    """Recebe uma pergunta do aluno e retorna a resposta do tutor Boole."""

    # seleciona o modelo
    if modelo == "pro":
        modelo = "gemini-2.5-pro"
    
    else:
        modelo = "gemini-2.5-flash"

    if not pergunta or not pergunta.strip():
        return "Por favor, envie uma pergunta válida."

    full_prompt = f"{SYSTEM_PROMPT}\n\nPergunta do aluno:\n{pergunta}"
    prompt_titulo = f"Gere apenas um título simples, de poucas palavras, contendo apenas letras ou números, sobre a seguinte pergunta: {pergunta}"

    codigo_prompt = ""
    if codigo != None:
        codigo_prompt = f"\nTrabalhe sobre este código base. Se o aluno se questionar sobre o uso de um código, ele está falando sobre este: {codigo}"
        
    try:
        historico = obter_historico_chat(usuario) if usuario else []
        contents = historico + [{"role": "user", "parts": [{"text": pergunta}]}]

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents,
            config=CONFIG
        )
        # se for a primeira mensagem, gera um título
        titulo_final = ''
        if num <= 2:
            titulo = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt_titulo
            )

            titulo_final = titulo.text
        return (response.text, titulo_final)

    except Exception as error:
        print(f"Erro ao chamar a API: {error}")
        return MENSAGEM_ERRO_API