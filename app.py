from flask import Flask, jsonify, request
from flask_cors import CORS
import face_recognition
import os

app = Flask(__name__)
CORS(app)

# Dummy user data (replace with your database)
users = {
    'PersonA': {
        'name': 'Person A',
        'info': 'Information about Person A',
        'encoding': face_recognition.face_encodings(face_recognition.load_image_file('personA.jpg'))[0]
    },
    'PersonB': {
        'name': 'Person B',
        'info': 'Information about Person B',
        'encoding': face_recognition.face_encodings(face_recognition.load_image_file('personB.jpg'))[0]
    },
}

# Function to detect face from image file
def detect_face(img_path):
    image = face_recognition.load_image_file(img_path)
    face_locations = face_recognition.face_locations(image)

    if not face_locations:
        return None

    top, right, bottom, left = face_locations[0]
    face_encoding = face_recognition.face_encodings(image, [(top, right, bottom, left)])[0]

    matches = face_recognition.compare_faces([user['encoding'] for user in users.values()], face_encoding)

    if True in matches:
        person = list(users.keys())[matches.index(True)]
        return {'name': users[person]['name'], 'info': users[person]['info']}
    else:
        return None

# Route for face detection
@app.route('/api/face-detection', methods=['POST'])
def face_detection():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    image_file = request.files['image']

    # Save the image temporarily (replace with a proper file storage solution)
    image_path = 'temp_image.jpg'
    image_file.save(image_path)

    # Detect face and return relevant information
    face_data = detect_face(image_path)

    if not face_data:
        return jsonify({'error': 'Face not detected'}), 400

    return jsonify(face_data)

# Run the Flask app
if __name__ == '__main__':
    # Use a random port for development
    app.run(debug=True)
