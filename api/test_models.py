import sys
import google.generativeai as genai

api_key = sys.argv[1]
genai.configure(api_key=api_key)
try:
    models = list(genai.list_models())
    for m in models:
        print(f"Name: {m.name}, Methods: {m.supported_generation_methods}")
        if 'generateContent' in m.supported_generation_methods:
            print(f"Tokens: {getattr(m, 'input_token_limit', 'None')}")
except Exception as e:
    print(f"Error: {e}")
