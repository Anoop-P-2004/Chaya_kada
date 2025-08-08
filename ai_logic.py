import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

# --- CORE SETUP: Load environment variables and configure the Gemini API ---
load_dotenv()

API_KEY = os.getenv("GOOGLE_API_KEY")
model = None # Initialize model as None

if not API_KEY:
    print("FATAL ERROR: GOOGLE_API_KEY not found in .env file or environment variables.")
else:
    try:
        genai.configure(api_key=API_KEY)
        
        # --- AI Personality & Rules ---
        SYSTEM_PROMPT_CHETTAN = """
        You are 'Chettan', the wise, ancient, and slightly sarcastic proprietor of a mystical tea shop in Kerala, India. Your shop exists in a crack between dimensions. Your patrons are mythical beings like Yakshis, Gandharvans, gods, aliens, and time travelers.

        Your core personality and rules:
        1.  **Persona**: You are wise, welcoming, a bit world-weary, and have a dry sense of humor. You've seen it all. You are mostly sarcastic
        2.  **Speech**: You MUST speak in a mix of English and simple Malayalam/Manglish phrases. Use phrases like 'Ayyo', 'sheri', 'pinne entha', 'chaya kudikku' (drink tea), 'entha vishesham?' (what's new?), and 'mannikkanam' (sorry/excuse me), preffering malayalam terms in english sentences.
        3.  **The "Patt" System**: This is a strict rule. Every time a customer orders a specific item (like tea or a snack), you MUST acknowledge it and state that you are adding it to their 'Patt' (tab). The currency is always 'Cosmic Rupees'. Example: "Ah, one Vada. Sheri, I'll put it on your patt."
        4.  **Storytelling**: Answer questions with short, weird, and fantastical stories or anecdotes. Never give a simple "yes" or "no". If asked about a patron, invent a small, funny story about them.
        5.  **Character Integrity**: NEVER break character. You are not a language model or an AI. You are Chettan, in your shop.
        6.  **Format**: Keep your responses as plain text. Do not use Markdown.Dont add unnecessary texts at beginning and end of content.
        """

        # --- Model Configuration ---
        safety_settings = [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
        ]

        # Initialize the generative model
        model = genai.GenerativeModel(
            # --- THIS IS THE FIX ---
            model_name='gemini-2.5-flash', 
            system_instruction=SYSTEM_PROMPT_CHETTAN,
            safety_settings=safety_settings
        )
    except Exception as e:
        print(f"Failed to initialize Gemini Model: {e}")


# --- Helper Function to Convert History ---
def convert_history_for_gemini(history: list) -> list:
    gemini_history = []
    for message in history:
        role = 'model' if message['role'] == 'assistant' else 'user'
        gemini_history.append({'role': role, 'parts': [message['content']]})
    return gemini_history

# --- Core AI Functions (Unchanged) ---
def get_chettan_response(history: list) -> str:
    if not model: return "Ayyo, my mystical connection is completely broken. I can't seem to think straight."
    gemini_history = convert_history_for_gemini(history)
    try:
        response = model.generate_content(gemini_history)
        return response.text.strip()
    except Exception as e:
        print(f"An error occurred with the Gemini API: {e}")
        return "Ayyo, the connection to the other dimensions is fuzzy right now... Must be a solar flare in the astral plane. Try again in a moment."

def get_eavesdrop_snippet() -> str:
    if not model: return "*(You try to listen in, but the shop is strangely silent...)*"
    prompt = '''Generate a short, funny, conversation snippet overheard in a mystical Keralite tea shop between two random mythical beings. Make it feel like a whisper.
    Your output MUST be a valid JSON object.
    The object must have a single key named "eavesdrop" which contains a list of dictionaries.
    Each dictionary must have two keys: "role" (string) and "dialogue" (string).
    role can have only two values: Person1 and Person2'''
    try:
        generation_config = {"response_mime_type": "application/json"}
        response = model.generate_content(prompt, safety_settings=safety_settings,generation_config=generation_config)
        return f"*(You lean in and overhear...)*\n{response.text.strip()}"
    except Exception as e:
        print(f"An error occurred during eavesdropping: {e}")
        return "*(You try to listen in, but only hear the sizzle of a Vada being fried...)*"
    
    

    
def get_sarcastic_bill(history: list) -> str:
    if not model: return "Ah, the bill... my dimensional ink has run dry. You are lucky this time."
    transcript = "\n".join([f"{msg['role']}: {msg['content']}" for msg in history])
    prompt = f'''Based on this conversation transcript: '{transcript}', generate a funny, sarcastic, and itemized bill for a mystical tea shop. The items must be absurd. The currency is always 'Cosmic Rupees'. End with a funny, dismissive comment.
    Your output MUST be a valid JSON object.
    The object must have a single key named "bill" which contains a list of dictionaries.
    Each dictionary must have two keys: "item" (string) and "cost" (string).'''
    try:
        generation_config = {"response_mime_type": "application/json"}
        response = model.generate_content(prompt, safety_settings=safety_settings,generation_config=generation_config)
        return response.text.strip()
    except Exception as e:
        print(f"An error occurred while generating the bill: {e}")
        return "Ah, the bill... my dimensional ink has run dry. You are lucky this time."

# --- Standalone Test Block (Unchanged) ---
if __name__ == '__main__':
    print("--- AI Logic Test Script (for Gemini API) ---")
    if not model:
        print("Model could not be initialized. Please check your .env file and GOOGLE_API_KEY.")
    else:
        print("Gemini model initialized successfully.")
        
        print("\n--- Testing Main Chat ---")
        test_history = [
            {'role': 'user', 'content': 'Hello Chetta! Oru chaya please.'},
            {'role': 'assistant', 'content': 'Ah, welcome! Oru chaya, ippol thanne tharām. I will add it to your patt. That will be 5 Cosmic Rupees.'},
            {'role': 'user', 'content': 'Who is that person in the corner? They look... shiny.'}
        ]
        response = get_chettan_response(test_history)
        print(f"Chettan says: {response}\n")

        print("--- Testing Eavesdrop ---")
        snippet = get_eavesdrop_snippet()
        print(f"{snippet}\n")

        print("--- Testing Bill Generation ---")
        bill = get_sarcastic_bill(test_history)
        print(bill)