# app.py

import os
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS # Import CORS
import ai_logic # This imports and runs your ai_logic.py file

# --- Flask App Initialization ---
app = Flask(__name__)
# IMPORTANT FOR HACKATHONS: Enable CORS to allow your frontend
# (even if served from a file) to communicate with this backend.
CORS(app)

# --- Route to Serve the Website ---
# This single route will serve your main index.html page.
@app.route('/')
def index():
    # render_template looks for files in a 'templates' folder.
    return render_template('index.html')

# --- ============================= ---
# --- API ENDPOINTS FOR THE FRONTEND ---
# --- ============================= ---

# The main endpoint for all chat interactions
@app.route('/chat', methods=['POST'])
def chat():
    # Get the conversation history from the frontend's request
    data = request.json
    history = data.get('history', [])
    
    # Call the function from your ai_logic file
    response_text = ai_logic.get_chettan_response(history)
    
    # Return the AI's plain text reply in a JSON object
    return jsonify({'reply': response_text})

# Endpoint for the "Eavesdrop" feature
@app.route('/eavesdrop', methods=['POST'])
def eavesdrop():
    # This feature doesn't require history
    snippet_data = ai_logic.get_eavesdrop_snippet()
    
    # Return the structured JSON data
    return jsonify({'data': snippet_data})

# Endpoint for getting the current "Patt" (tab)
@app.route('/get-patt', methods=['POST'])
def get_patt():
    data = request.json
    history = data.get('history', [])
    
    patt_data = ai_logic.get_patt_summary(history)
    
    # Return the list of items on the patt
    return jsonify({'patt_items': patt_data})

# Endpoint for the "Get Bill" feature
@app.route('/get-bill', methods=['POST'])
def get_bill():
    data = request.json
    history = data.get('history', [])
    
    bill_data = ai_logic.get_sarcastic_bill(history)
    
    # Return the structured list of bill items
    return jsonify({'bill': bill_data})

# --- Main Execution Block ---
# This makes the server runnable by typing "python app.py" in the terminal.
if __name__ == '__main__':
    # Using a port other than 5000 is good practice to avoid conflicts.
    # debug=True allows the server to auto-reload when you save changes.
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=True, host='0.0.0.0', port=port)