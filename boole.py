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

    if not pergunta or not pergunta.strip():
        return "Por favor, envie uma pergunta válida."

    try:
        historico = obter_historico_chat(usuario) if usuario else []
        contents = historico + [{"role": "user", "parts": [{"text": pergunta}]}]

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents,
            config=CONFIG
        )
        return response.text

    except Exception as error:
        print(f"Erro ao chamar a API: {error}")
        return MENSAGEM_ERRO_API