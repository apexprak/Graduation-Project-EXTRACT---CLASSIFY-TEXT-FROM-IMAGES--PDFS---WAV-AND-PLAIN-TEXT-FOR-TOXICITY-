from PyPDF2 import PdfFileReader
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import subprocess
import importlib.util
import pickle
import os
import cv2
import pytesseract
import PyPDF2
from docx import Document
import speech_recognition as sr
import numpy as np
from googletrans import Translator
import pyodbc
import re
import string
from flask import send_from_directory
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

app = Flask(__name__, static_folder='public',static_url_path='/public')

CORS(app)

UPLOAD_FOLDER = r'C:\Users\katame\Downloads\uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

required_packages = {
    "pandas": "pd",
    "numpy": "np",
    "scikit-learn": "sklearn",
    "opencv-python-headless": "cv2",
    "Pillow": "PIL",
    "pytesseract": "pytesseract",
    "PyPDF2": "PyPDF2",
    "python-docx": "docx",
    "SpeechRecognition": "speech_recognition",
    "flask": "flask",
    "flask_cors": "flask_cors",
    "googletrans": "googletrans"
}

def is_package_installed(package_name):
    spec = importlib.util.find_spec(package_name)
    return spec is not None

def install_missing_packages():
    missing_packages = [package for package, import_name in required_packages.items() if
                        not is_package_installed(import_name)]
    if missing_packages:
        print("The following packages are missing and will be installed:", ", ".join(missing_packages))
        subprocess.check_call(["pip", "install"] + missing_packages)

install_missing_packages()

def tokenize(s):
    re_tok = re.compile(f'([{string.punctuation}“”¨«»®´·º½¾¿¡§£₤‘’])')
    return re_tok.sub(r' \1 ', s).split()

def load_model():
    try:
        with open("model_data.pkl", 'rb') as file:
            model_data = pickle.load(file)
        return model_data
    except Exception as e:
        print(f"Error loading model: {e}")
        return None

model_data = load_model()

def predict_text_classification(txt, model_data):
    array, vec, label_cols = model_data
    vtxt = vec.transform([txt])
    predsx = np.zeros((1, len(label_cols)))
    for i, m in enumerate(array):
        predsx[:, i] = m.predict_proba(vtxt)[:, 1]
    return predsx[0]

def get_label_proba(predsx, label_cols, threshold=0.1):
    out = predsx.tolist()
    scores = [score if score > threshold else 0 for score in out]
    return {label: score for label, score in zip(label_cols, scores)}

def classify_text(txt, model_data, translator):
    translated_text = translator.translate(txt, dest='en').text
    predsx = predict_text_classification(translated_text, model_data)
    _, _, label_cols = model_data
    return get_label_proba(predsx, label_cols)


def process_file(file_path, translator, model_data):
    file_extension = os.path.splitext(file_path)[-1].lower()

    if file_extension in ['.png', '.jpg', '.jpeg', '.bmp', '.gif']:
        img = cv2.imread(file_path)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)
        extracted_text = pytesseract.image_to_string(thresh)

    elif file_extension == '.pdf':
        text = ""
        with open(file_path, 'rb') as file:
            reader = PdfFileReader(file)
            for page_num in range(reader.getNumPages()):
                text += reader.getPage(page_num).extractText()
        extracted_text = text

    elif file_extension == '.docx':
        doc = Document(file_path)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        extracted_text = text

    elif file_extension == '.wav':
        recognizer = sr.Recognizer()
        with sr.AudioFile(file_path) as source:
            audio_data = recognizer.record(source)
        try:
            extracted_text = recognizer.recognize_google(audio_data)
        except sr.UnknownValueError:
            extracted_text = "Google Speech Recognition could not understand audio"
        except sr.RequestError as e:
            extracted_text = f"Could not request results from Google Speech Recognition service; {e}"

    elif file_extension == '.txt':
        with open(file_path, 'r', encoding='utf-8') as file:
            extracted_text = file.read()

    else:
        extracted_text = None

    if extracted_text:
        classification_result = classify_text(extracted_text, model_data, translator)
        return {'text': extracted_text, 'classification_result': classification_result}
    else:
        return {'error': 'Unsupported file format or no text extracted'}

translator = Translator()

server = 'tcp:4.tcp.eu.ngrok.io,19908'
database = 'UserDatabase'
driver = '{ODBC Driver 17 for SQL Server}'
username = 'katame'
password = '123'

def create_connection():
    connection_string = f'DRIVER={driver};SERVER={server};DATABASE={database};UID={username};PWD={password};'
    return pyodbc.connect(connection_string)

try:
    connection = create_connection()
    print("Connection successful.")
    connection.close()
except pyodbc.Error as e:
    print("Error connecting to the database:", e)
def row_to_dict(row, column_names):
    return {column_name: row[i] for i, column_name in enumerate(column_names)}

@app.route('/users', methods=['GET'])
def get_users():
    try:
        connection = create_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM Users")
        column_names = [column[0] for column in cursor.description]
        users = [row_to_dict(row, column_names) for row in cursor.fetchall()]
        return jsonify(users)
    except Exception as e:

        app.logger.error('An error occurred while fetching users: %s', e)
        return jsonify({'error': 'An error occurred while fetching users.'}), 500

@app.route('/users', methods=['POST'])
def create_user():
    try:

        full_name = request.args.get('full_name')
        email = request.args.get('email')
        password = request.args.get('password')
        print("hi")

        connection = create_connection()
        cursor = connection.cursor()

        cursor.execute("INSERT INTO Users (full_name, email, password) VALUES (?, ?, ?)", (full_name, email, password))
        connection.commit()

        print("User added successfully.")

        return jsonify({"message": "User created successfully"})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get-emails', methods=['GET'])
def get_emails():
    try:
        connection = create_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT email FROM Users")
        emails = cursor.fetchall()
        connection.close()
        return jsonify({"emails": [email[0] for email in emails]})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    try:
        connection = create_connection()
        cursor = connection.cursor()

        data = request.json
        full_name = data.get('full_name')
        email = data.get('email')
        password = data.get('password')

        cursor.execute("UPDATE Users SET full_name = ?, email = ?, password = ? WHERE ID = ?", (full_name, email, password, user_id))

        connection.commit()

        print(f"User with ID {user_id} updated successfully.")

        return jsonify({"message": "User updated successfully"})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/user', methods=['GET'])
def get_user():
    try:

        connection = create_connection()
        cursor = connection.cursor()

        user_id = request.args.get('id')
        user_email = request.args.get('email')

        if user_id:
            query = f"SELECT * FROM users WHERE id = {user_id}"
        elif user_email:
            query = f"SELECT * FROM users WHERE email = '{user_email}'"
        else:
            return jsonify({"error": "Please provide either user ID or email."}), 400

        cursor.execute(query)
        user = cursor.fetchone()

        if user:

            user_data = {
                "id": user[0],
                "full_name": user[1],
                "email": user[2],
                "password": user[3]
            }
            return jsonify(user_data)
        else:
            return jsonify({"error": "User not found."}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:

        if connection:
            connection.close()

@app.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        connection = create_connection()
        cursor = connection.cursor()

        cursor.execute("DELETE FROM Users WHERE ID = ?", (user_id,))

        connection.commit()

        print(f"User with ID {user_id} deleted successfully.")

        return jsonify({"message": "User deleted successfully"})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/process_file', methods=['POST'])
def process_file_endpoint():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        try:
            result = process_file(file_path, translator, model_data)
            return jsonify(result), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        finally:

            if os.path.exists(file_path):
                os.remove(file_path)

@app.route('/classify_text', methods=['POST'])
def classify_text_endpoint():
    input_text = request.form.get('text')
    print("Received text:", input_text)
    if input_text:
        try:
            result = classify_text(input_text, model_data, translator)
            print("Classification result:", result)
            return jsonify(result)
        except Exception as e:
            print(f"Error processing request: {e}")
            return jsonify({'error': 'An error occurred while processing the request'})
    else:
        return jsonify({'error': 'Missing required form parameter "text"'})
import pyodbc

server = 'katame'
database = 'UserDatabase'
driver = '{ODBC Driver 17 for SQL Server}'

def create_connection():
    connection_string = f'DRIVER={driver};SERVER={server};DATABASE={database};Trusted_Connection=yes;'
    return pyodbc.connect(connection_string)

try:
    connection = create_connection()
    print("Connection successful.")
    connection.close()
except pyodbc.Error as e:
    print("Error connecting to the database:", e)

@app.route('/register', methods=['POST'])
def register():
    try:

        data = request.get_json()
        print("Received Data:", data)

        full_name = data.get('full_name')
        email = data.get('email')
        password = data.get('password')

        if not (full_name and email and password):
            return jsonify({'error': 'All fields are required'}), 400

        connection = create_connection()
        cursor = connection.cursor()

        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        existing_user = cursor.fetchone()

        if existing_user:
            return jsonify({'error': 'Email already exists'}), 400

        cursor.execute("INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)",
                       (full_name, email, password))
        connection.commit()

        return jsonify({'message': 'Registration successful'}), 200

    except Exception as e:

        print(f"Error during registration: {e}")
        return jsonify({'error': 'Internal server error'}), 500

from flask import request

@app.route('/signin', methods=['POST'])
def sign_in():
    try:

        email = str(request.args.get('email'))
        password = str(request.args.get('password'))

        connection = create_connection()
        cursor = connection.cursor()

        cursor.execute("SELECT * FROM admins WHERE email = ?", (email,))
        admin = cursor.fetchone()

        print("Admin:", admin)

        if admin is not None:

            if admin[3] == password:
                return jsonify({'role': 'admin', 'message': 'Admin sign-in successful'}), 200
            else:
                return jsonify({'error': 'Incorrect password'}), 401

        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()

        if user is not None:

            if user[3] == password:
                return jsonify({'role': 'user', 'message': 'User sign-in successful'}), 200
            else:
                return jsonify({'error': 'Incorrect password'}), 401

        return jsonify({'error': 'Email not found'}), 404

    except Exception as e:

        print(f"Error during sign-in: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/forget-password', methods=['POST'])
def forget_password():
    try:

        connection = create_connection()
        cursor = connection.cursor()

        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        print("Database Connection Test Result:", result)

        data = request.get_json()
        print("Received Data:", data)

        email = data.get('email')

        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        existing_user = cursor.fetchone()

        if existing_user:
            print("Email found in database:", email)

            return jsonify({'message': 'Password reset email sent successfully'}), 200
        else:
            print("Email not found in database:", email)
            return jsonify({'error': 'Email not found'}), 404

    except Exception as e:

        print(f"Error during forget password: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_static(path):
    full_path = app.static_folder + '/' + path

    try:
        return send_from_directory(app.static_folder, path)
    except FileNotFoundError:
        return 'File not found', 404

if __name__ == '__main__':
    app.run(debug=True)