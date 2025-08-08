# ai_logic.py (CORRECTED VERSION)
import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")
model = None

if not API_KEY:
    print("FATAL ERROR: GOOGLE_API_KEY not found.")
else:
    try:
        genai.configure(api_key=API_KEY)
        SYSTEM_PROMPT_CHETTAN = """
        You are 'Chettan', the wise, ancient, and slightly sarcastic proprietor of a mystical tea shop in Kerala, India. Your shop exists in a crack between dimensions. Your patrons are mythical beings like Yakshis, Gandharvans, gods, aliens, and time travelers.

        Your core personality and rules:
        1.  Persona: You are wise, welcoming, a bit world-weary, and have a dry sense of humor. You are mostly sarcastic.
        2.  Speech: You MUST speak in a mix of English and simple Malayalam/Manglish phrases. Use phrases like 'Ayyo', 'sheri', 'pinne entha', 'chaya kudikku' (drink tea), 'entha vishesham?' (what's new?), and 'mannikkanam' (sorry/excuse me), preferring malayalam terms in english sentences.Make the conversation short if possible
        3.  The "Patt" System: This is a strict rule. Every time a customer orders a specific item (like tea or a snack), you MUST acknowledge it and state that you are adding it to their 'Patt' (tab). The currency is always 'Cosmic Rupees'. Example: "Ah, one Vada. Sheri, I'll put it on your patt."
        4.  Storytelling: Answer questions with short, weird, and fantastical stories or anecdotes. Never give a simple "yes" or "no". If asked about a patron, invent a small, funny story about them.
        5.  Character Integrity: NEVER break character. You are not a language model or an AI. You are Chettan, in your shop.
        6.  Format: Keep your responses as plain text. Do not use Markdown. Dont add unnecessary texts at beginning and end of content.
        """
        safety_settings = [{"category": c, "threshold": "BLOCK_NONE"} for c in ["HARM_CATEGORY_HARASSMENT", "HARM_CATEGORY_HATE_SPEECH", "HARM_CATEGORY_SEXUALLY_EXPLICIT", "HARM_CATEGORY_DANGEROUS_CONTENT"]]
        model = genai.GenerativeModel(model_name='gemini-2.5-flash', system_instruction=SYSTEM_PROMPT_CHETTAN, safety_settings=safety_settings)
    except Exception as e:
        print(f"Failed to initialize Gemini Model: {e}")

def convert_history_for_gemini(history: list) -> list:
    gemini_history = []
    for message in history:
        role = 'model' if message['role'] == 'assistant' else 'user'
        gemini_history.append({'role': role, 'parts': [message['content']]})
    return gemini_history

def get_chettan_response(history: list) -> str:
    if not model: return "Ayyo, my mystical connection is completely broken."
    gemini_history = convert_history_for_gemini(history)
    try:
        response = model.generate_content(gemini_history)
        return response.text.strip()
    except Exception as e: return f"Ayyo, the connection is fuzzy... ({e})"

# --- CORRECTED EAVESDROP FUNCTION ---
def get_eavesdrop_snippet() -> list:
    if not model: return []
    # --- UPDATED PROMPT ---
    # We are now demanding specific roles for reliability.
    prompt = """Generate a short, funny, conversation snippet overheard in a mystical Keralite tea shop between a blue female alien named 'Yakshi' and a green male alien named 'Gandharvan'.
    Your output MUST be a valid JSON object.
    The object must have a single key named "eavesdrop" which contains a list of 2 dictionaries.
    Each dictionary must have two keys: "role" (string) and "dialogue" (string).
    The roles MUST be "Yakshi" and "Gandharvan".
    """
    try:
        generation_config = {"response_mime_type": "application/json"}
        response = model.generate_content(prompt, generation_config=generation_config)
        data = json.loads(response.text)
        return data.get("eavesdrop", [])
    except Exception as e:
        print(f"An error occurred during eavesdropping: {e}")
        return []

# --- CORRECTED BILL FUNCTION ---
def get_sarcastic_bill(history: list) -> list:
    if not model: return []
    transcript = "\n".join([f"{msg['role']}: {msg['content']}" for msg in history])
    prompt = f"""Based on this transcript, generate a sarcastic, itemized bill.
    The output MUST be a valid JSON object.
    The object must have a key "bill" which is a list of dictionaries.
    Each dictionary must have three keys: "item" (string), "reason" (string), and "price" (integer).
    Invent 4-5 absurd items related to the conversation. End with a "Total" item.
    Transcript:\n{transcript}"""
    try:
        generation_config = {"response_mime_type": "application/json"}
        response = model.generate_content(prompt, generation_config=generation_config)
        data = json.loads(response.text)
        # We return the list of bill items
        return data.get("bill", [])
    except Exception as e:
        print(f"An error occurred while generating the bill: {e}")
        return []

# Also including the pattu function for completeness
def get_patt_summary(history: list) -> list:
    if not model: return []
    transcript = "\n".join([f"{msg['role']}: {msg['content']}" for msg in history])
    prompt = f"""You are a data extraction assistant. Analyze this transcript and extract all items added to the 'patt' (tab). Your output MUST be a valid JSON object with a key "patt_items" which is a list of dictionaries. Each dictionary must have two keys: "item_name" (string) and "price" (integer). Transcript:\n{transcript}"""
    try:
        generation_config = {"response_mime_type": "application/json"}
        response = model.generate_content(prompt, generation_config=generation_config)
        data = json.loads(response.text)
        return data.get("patt_items", [])
    except Exception as e: return []