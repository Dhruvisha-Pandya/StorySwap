from flask import Flask, send_from_directory
from flask_cors import CORS
from config import Config
from routes.books import books_bp
from routes.email import email_bp
from routes.debug import debug_bp

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = Config.SECRET_KEY

# Register blueprints
app.register_blueprint(books_bp, url_prefix='/api')
app.register_blueprint(email_bp, url_prefix='/api')
app.register_blueprint(debug_bp, url_prefix='/api')

# Serve React build
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    return send_from_directory('../frontend/build', 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=Config.PORT, debug=False)