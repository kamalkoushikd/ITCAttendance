from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import datetime
from functools import wraps
from models import Vendor, Location, Approver, BillingCycleRule
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.config['SECRET_KEY'] = 'your-secret-key'  # Change this in production

# Dummy admin user for demonstration
ADMIN_USER = {
    'username': 'admin',
    'password': 'admin',
    'is_admin': True
}

load_dotenv()

# Configure your database URI
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///attendance.db')  # Default fallback
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if username == ADMIN_USER['username'] and password == ADMIN_USER['password']:
        payload = {
            'username': username,
            'is_admin': True,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2)
        }
        token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')
        return jsonify({'token': token, 'is_admin': True}), 200
    return jsonify({'error': 'Invalid credentials'}), 401

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        if not token:
            return jsonify({'error': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            if not data.get('is_admin'):
                return jsonify({'error': 'Admin privileges required!'}), 403
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired!'}), 401
        except Exception:
            return jsonify({'error': 'Token is invalid!'}), 401
        return f(*args, **kwargs)
    return decorated

@app.route('/api/vendors', methods=['GET'])
@token_required
def get_vendors():
    session = Session()
    vendors = session.query(Vendor).all()
    result = [{'vendor_name': v.vendor_name} for v in vendors]
    session.close()
    return jsonify(result)

@app.route('/api/locations', methods=['GET'])
@token_required
def get_locations():
    session = Session()
    locations = session.query(Location).all()
    result = [{'location': l.location, 'state': l.state} for l in locations]
    session.close()
    return jsonify(result)

@app.route('/api/approvers', methods=['GET'])
@token_required
def get_approvers():
    session = Session()
    approvers = session.query(Approver).all()
    result = [
        {
            'emp_id': a.emp_id,
            'name': a.name,
            'email': a.email,
            'manager_emp_id': a.manager_emp_id,
            'manager_name': a.manager_name,
            'manager_email': a.manager_email
        } for a in approvers
    ]
    session.close()
    return jsonify(result)

@app.route('/api/billing-cycle-rules', methods=['GET'])
@token_required
def get_billing_cycle_rules():
    session = Session()
    rules = session.query(BillingCycleRule).all()
    result = [{'rule_id': r.rule_id, 'start_day': r.start_day, 'vendor_name': r.vendor_name} for r in rules]
    session.close()
    return jsonify(result)

@app.route('/api/vendors', methods=['POST'])
@token_required
def add_vendor():
    data = request.get_json()
    vendor_name = data.get('vendor_name')
    if not vendor_name:
        return jsonify({'error': 'vendor_name is required'}), 400
    session = Session()
    vendor = Vendor(vendor_name=vendor_name)
    session.add(vendor)
    session.commit()
    session.close()
    return jsonify({'message': 'Vendor added successfully'}), 201

@app.route('/api/locations', methods=['POST'])
@token_required
def add_location():
    data = request.get_json()
    location = data.get('location')
    state = data.get('state')
    if not location or not state:
        return jsonify({'error': 'location and state are required'}), 400
    session = Session()
    loc = Location(location=location, state=state)
    session.add(loc)
    session.commit()
    session.close()
    return jsonify({'message': 'Location added successfully'}), 201

@app.route('/api/approvers', methods=['POST'])
@token_required
def add_approver():
    data = request.get_json()
    emp_id = data.get('emp_id')
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    manager_emp_id = data.get('manager_emp_id')
    manager_name = data.get('manager_name')
    manager_email = data.get('manager_email')
    if not emp_id or not name or not email or not password:
        return jsonify({'error': 'emp_id, name, email, and password are required'}), 400
    session = Session()
    approver = Approver(
        emp_id=emp_id,
        name=name,
        email=email,
        password=password,
        manager_emp_id=manager_emp_id,
        manager_name=manager_name,
        manager_email=manager_email
    )
    session.add(approver)
    session.commit()
    session.close()
    return jsonify({'message': 'Approver added successfully'}), 201

@app.route('/api/billing-cycle-rules', methods=['POST'])
@token_required
def add_billing_cycle_rule():
    data = request.get_json()
    rule_id = data.get('rule_id')
    start_day = data.get('start_day')
    vendor_name = data.get('vendor_name')
    if not rule_id or not start_day or not vendor_name:
        return jsonify({'error': 'rule_id, start_day, and vendor_name are required'}), 400
    session = Session()
    rule = BillingCycleRule(rule_id=rule_id, start_day=start_day, vendor_name=vendor_name)
    session.add(rule)
    session.commit()
    session.close()
    return jsonify({'message': 'Billing cycle rule added successfully'}), 201

# Example usage of @token_required
def protected_example():
    # ...
    pass

if __name__ == '__main__':
    app.run(debug=True, port='8000')
