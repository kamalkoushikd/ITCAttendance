from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import datetime
from functools import wraps
from models import Vendor, Location, Approver, BillingCycleRule, Designation
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
import bcrypt


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173"]}}, supports_credentials=True, allow_headers=["Content-Type", "Authorization"])
app.config['SECRET_KEY'] = 'your-secret-key'  # Change this in production

# Dummy admin user for demonstration
# Precomputed bcrypt hash for 'admin' (generated with bcrypt.hashpw(b'admin', bcrypt.gensalt()))
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
    # Check admin
    if username == ADMIN_USER['username']:
        # Use bcrypt to check the password
        if password == ADMIN_USER['password']:
            payload = {
                'username': username,
                'is_admin': True,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2)
            }
            token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')
            return jsonify({'token': token, 'is_admin': True}), 200
    # Check Approver (non-admin) by emp_id
    session = Session()
    approver = session.query(Approver).filter_by(emp_id=username).first()
    if approver and approver.password_hash:
        # Use bcrypt to check the password for approver
        if bcrypt.checkpw(password.encode(), approver.password_hash.encode()):
            payload = {
                'username': approver.emp_id,
                'is_admin': False,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2)
            }
            token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')
            session.close()
            return jsonify({'token': token, 'is_admin': False}), 200
    session.close()
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
            # Only check token validity, not admin status
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired!'}), 401
        except Exception:
            print("Token decode error:", Exception)
            return jsonify({'error': 'Token is invalid!'}), 401
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
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

@app.route('/api/employees', methods=['GET'])
@token_required
def get_employees():
    token = None
    if 'Authorization' in request.headers:
        auth_header = request.headers['Authorization']
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

    try:
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        emp_id = data.get('username')  # This is the approver's emp_id
        print("Decoded token data:", data)
        is_admin = data.get('is_admin')
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expired!'}), 401
    except Exception as e:
        return jsonify({'error': 'Token is invalid!', 'detail': str(e)}), 401

    session = Session()
    from models import Employee

    if is_admin:
        # Admin sees all employees
        employees = session.query(Employee).all()
    else:
        # Approver sees only employees they manage
        employees = session.query(Employee).filter_by(approver_emp_id=emp_id).all()
        print(employees)

    result = [
        {
            'emp_id': e.emp_id,
            'name': e.name,
            'gender': e.gender,
            'state': e.state,
            'location': e.location,
            'vendor_name': e.vendor_name,
            'approver_emp_id': e.approver_emp_id,
            'billing_rule_id': e.billing_rule_id,
            'billing_rule_start_day': e.billing_rule.start_day if e.billing_rule else None,
            'doj': e.doj.isoformat() if e.doj else None,
            'designation_id': e.designation_id,
            'designation': session.query(Designation.designation).filter_by(designation_id=e.designation_id).all()[0].designation if e.designation_id else None,
            'dob': e.dob.isoformat() if e.dob else None,
            'resignation_date': e.resignation_date.isoformat() if e.resignation_date else None,
            'resigned': e.resigned
        } for e in employees
    ]
    print("Employees fetched:", result)
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
@admin_required
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
@admin_required
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
@admin_required
def add_approver():
    data = request.get_json()
    emp_id = data.get('emp_id')
    name = data.get('name')
    email = data.get('email')
    manager_emp_id = data.get('manager_emp_id')
    manager_name = data.get('manager_name')
    manager_email = data.get('manager_email')
    password_hash = data.get('password_hash')
    if not emp_id or not name or not email or not password_hash:
        return jsonify({'error': 'emp_id, name, email, and password_hash are required'}), 400
    session = Session()
    approver = Approver(
        emp_id=emp_id,
        name=name,
        email=email,
        manager_emp_id=manager_emp_id,
        manager_name=manager_name,
        manager_email=manager_email,
        password_hash=password_hash
    )
    session.add(approver)
    session.commit()
    session.close()
    return jsonify({'message': 'Approver added successfully'}), 201

@app.route('/api/billing-cycle-rules', methods=['POST'])
@admin_required
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

@app.route('/api/employees', methods=['POST'])
@admin_required
def add_employee():
    data = request.get_json()
    required_fields = ['emp_id', 'name', 'gender', 'state', 'location', 'vendor_name', 'approver_emp_id', 'billing_rule_id', 'designation_id', 'doj', 'dob']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    session = Session()
    from models import Employee
    employee = Employee(
        emp_id=data['emp_id'],
        name=data['name'],
        gender=data['gender'],
        state=data['state'],
        location=data['location'],
        vendor_name=data['vendor_name'],
        approver_emp_id=data['approver_emp_id'],
        billing_rule_id=data['billing_rule_id'],
        designation_id=data['designation_id'],
        dob=data['dob'],
        doj=data['doj'],
        resignation_date=data.get('resignation_date'),
        resigned=data.get('resigned', False)
    )
    session.add(employee)
    session.commit()
    session.close()
    return jsonify({'message': 'Employee added successfully'}), 201

@app.route('/api/vendors/<vendor_name>', methods=['PUT'])
@admin_required
def update_vendor(vendor_name):
    data = request.get_json()
    session = Session()
    vendor = session.query(Vendor).filter_by(vendor_name=vendor_name).first()
    if not vendor:
        session.close()
        return jsonify({'error': 'Vendor not found'}), 404
    vendor.vendor_name = data.get('vendor_name', vendor.vendor_name)
    session.commit()
    session.close()
    return jsonify({'message': 'Vendor updated successfully'})

@app.route('/api/vendors/<vendor_name>', methods=['DELETE'])
@admin_required
def delete_vendor(vendor_name):
    session = Session()
    vendor = session.query(Vendor).filter_by(vendor_name=vendor_name).first()
    if not vendor:
        session.close()
        return jsonify({'error': 'Vendor not found'}), 404
    session.delete(vendor)
    session.commit()
    session.close()
    return jsonify({'message': 'Vendor deleted successfully'})

@app.route('/api/locations/<location>', methods=['PUT'])
@admin_required
def update_location(location):
    data = request.get_json()
    session = Session()
    loc = session.query(Location).filter_by(location=location).first()
    if not loc:
        session.close()
        return jsonify({'error': 'Location not found'}), 404
    loc.location = data.get('location', loc.location)
    loc.state = data.get('state', loc.state)
    session.commit()
    session.close()
    return jsonify({'message': 'Location updated successfully'})

@app.route('/api/locations/<location>', methods=['DELETE'])
@admin_required
def delete_location(location):
    session = Session()
    loc = session.query(Location).filter_by(location=location).first()
    if not loc:
        session.close()
        return jsonify({'error': 'Location not found'}), 404
    session.delete(loc)
    session.commit()
    session.close()
    return jsonify({'message': 'Location deleted successfully'})

@app.route('/api/approvers/<emp_id>', methods=['PUT'])
@admin_required
def update_approver(emp_id):
    data = request.get_json()
    session = Session()
    approver = session.query(Approver).filter_by(emp_id=emp_id).first()
    if not approver:
        session.close()
        return jsonify({'error': 'Approver not found'}), 404
    approver.name = data.get('name', approver.name)
    approver.email = data.get('email', approver.email)
    approver.manager_emp_id = data.get('manager_emp_id', approver.manager_emp_id)
    approver.manager_name = data.get('manager_name', approver.manager_name)
    approver.manager_email = data.get('manager_email', approver.manager_email)
    if 'password_hash' in data and data['password_hash']:
        approver.password_hash = data['password_hash']
    session.commit()
    session.close()
    return jsonify({'message': 'Approver updated successfully'})

@app.route('/api/approvers/<emp_id>', methods=['DELETE'])
@admin_required
def delete_approver(emp_id):
    session = Session()
    approver = session.query(Approver).filter_by(emp_id=emp_id).first()
    if not approver:
        session.close()
        return jsonify({'error': 'Approver not found'}), 404
    session.delete(approver)
    session.commit()
    session.close()
    return jsonify({'message': 'Approver deleted successfully'})

@app.route('/api/billing-cycle-rules/<rule_id>', methods=['PUT'])
@admin_required
def update_billing_cycle_rule(rule_id):
    data = request.get_json()
    session = Session()
    rule = session.query(BillingCycleRule).filter_by(rule_id=rule_id).first()
    if not rule:
        session.close()
        return jsonify({'error': 'Billing cycle rule not found'}), 404
    rule.start_day = data.get('start_day', rule.start_day)
    rule.vendor_name = data.get('vendor_name', rule.vendor_name)
    session.commit()
    session.close()
    return jsonify({'message': 'Billing cycle rule updated successfully'})

@app.route('/api/billing-cycle-rules/<rule_id>', methods=['DELETE'])
@admin_required
def delete_billing_cycle_rule(rule_id):
    session = Session()
    rule = session.query(BillingCycleRule).filter_by(rule_id=rule_id).first()
    if not rule:
        session.close()
        return jsonify({'error': 'Billing cycle rule not found'}), 404
    session.delete(rule)
    session.commit()
    session.close()
    return jsonify({'message': 'Billing cycle rule deleted successfully'})

@app.route('/api/employees/<emp_id>', methods=['PUT'])
@admin_required
def update_employee(emp_id):
    data = request.get_json()
    session = Session()
    from models import Employee
    employee = session.query(Employee).filter_by(emp_id=emp_id).first()
    if not employee:
        session.close()
        return jsonify({'error': 'Employee not found'}), 404
    employee.name = data.get('name', employee.name)
    employee.gender = data.get('gender', employee.gender)
    employee.state = data.get('state', employee.state)
    employee.location = data.get('location', employee.location)
    employee.vendor_name = data.get('vendor_name', employee.vendor_name)
    employee.approver_emp_id = data.get('approver_emp_id', employee.approver_emp_id)
    employee.billing_rule_id = data.get('billing_rule_id', employee.billing_rule_id)
    employee.designation_id = data.get('designation_id', employee.designation_id)
    employee.dob = data.get('dob', employee.dob)
    employee.doj = data.get('doj', employee.doj)
    employee.resignation_date = data.get('resignation_date', employee.resignation_date)
    employee.resigned = data.get('resigned', employee.resigned)
    session.commit()
    session.close()
    return jsonify({'message': 'Employee updated successfully'})

@app.route('/api/employees/<emp_id>', methods=['DELETE'])
@admin_required
def delete_employee(emp_id):
    session = Session()
    from models import Employee
    employee = session.query(Employee).filter_by(emp_id=emp_id).first()
    if not employee:
        session.close()
        return jsonify({'error': 'Employee not found'}), 404
    session.delete(employee)
    session.commit()
    session.close()
    return jsonify({'message': 'Employee deleted successfully'})

@app.route('/api/designations', methods=['GET'])
@token_required
def get_designations():
    vendor_name = request.args.get('vendor_name')
    session = Session()
    query = session.query(Designation)
    if vendor_name:
        query = query.filter_by(vendor_name=vendor_name)
    designations = query.all()
    result = [
        {
            'designation_id': d.designation_id,
            'designation': d.designation,
            'vendor_name': d.vendor_name
        } for d in designations
    ]
    session.close()
    return jsonify(result)

@app.route('/api/designations', methods=['POST'])
@admin_required
def add_designation():
    data = request.get_json()
    designation = data.get('designation')
    vendor_name = data.get('vendor_name')
    if not designation or not vendor_name:
        return jsonify({'error': 'designation and vendor_name are required'}), 400
    session = Session()
    d = Designation(designation=designation, vendor_name=vendor_name)
    session.add(d)
    session.commit()
    session.close()
    return jsonify({'message': 'Designation added successfully'}), 201

@app.route('/api/designations/<int:designation_id>', methods=['PUT'])
@admin_required
def update_designation(designation_id):
    data = request.get_json()
    session = Session()
    d = session.query(Designation).filter_by(designation_id=designation_id).first()
    if not d:
        session.close()
        return jsonify({'error': 'Designation not found'}), 404
    d.designation = data.get('designation', d.designation)
    d.vendor_name = data.get('vendor_name', d.vendor_name)
    session.commit()
    session.close()
    return jsonify({'message': 'Designation updated successfully'})

@app.route('/api/designations/<int:designation_id>', methods=['DELETE'])
@admin_required
def delete_designation(designation_id):
    session = Session()
    d = session.query(Designation).filter_by(designation_id=designation_id).first()
    if not d:
        session.close()
        return jsonify({'error': 'Designation not found'}), 404
    session.delete(d)
    session.commit()
    session.close()
    return jsonify({'message': 'Designation deleted successfully'})

@app.route('/api/monthly-attendance', methods=['POST'])
@token_required
def submit_monthly_attendance():
    data = request.get_json()
    records = data.get('records', [])
    if not isinstance(records, list):
        return jsonify({'error': 'Invalid data format'}), 400
    session = Session()
    from models import MonthlyAttendance, Employee
    valid_records = []
    for rec in records:
        emp_id = rec.get('emp_id')
        approver_emp_id = rec.get('approver_emp_id')  # Not used, but can be checked if needed
        year = rec.get('year')
        month = rec.get('month')
        payable_days = rec.get('payable_days')
        leaves_taken = rec.get('leaves_taken')
        if not (emp_id and year and month):
            continue
        emp = session.query(Employee).filter_by(emp_id=emp_id).first()
        if not emp:
            continue
        # Calculate billing period boundaries
        billing_start_day = emp.billing_rule.start_day if emp.billing_rule else 1
        period_start = datetime.date(year, month, billing_start_day)
        # Next month for period end
        next_month = month + 1 if month < 12 else 1
        next_year = year if month < 12 else year + 1
        period_end = datetime.date(next_year, next_month, billing_start_day)
        # Check if period is before joining or after resignation
        if period_end <= emp.doj:
            continue
        if emp.resignation_date and period_start > emp.resignation_date:
            continue
        # Upsert: delete existing for emp_id, year, month
        session.query(MonthlyAttendance).filter_by(emp_id=emp_id, year=year, month=month).delete()
        attendance = MonthlyAttendance(
            emp_id=emp_id,
            approver_emp_id=approver_emp_id,
            year=year,
            month=month,
            working_days=payable_days,
            leaves_taken=leaves_taken
        )
        valid_records.append(attendance)
    session.add_all(valid_records)
    session.commit()
    session.close()
    return jsonify({'message': f'{len(valid_records)} attendance records saved successfully'})

@app.route('/api/monthly-attendance', methods=['GET'])
@token_required
def get_monthly_attendance():
    session = Session()
    from models import MonthlyAttendance, Employee, Designation, Vendor
    # Get filters from query params
    emp_id = request.args.get('emp_id')
    approver_emp_id = request.args.get('approver_emp_id')
    month = request.args.get('month', type=int)
    year = request.args.get('year', type=int)
    vendor_name = request.args.get('vendor_name')
    designation = request.args.get('designation')
    resigned = request.args.get('resigned')

    query = session.query(MonthlyAttendance, Employee, Designation)
    query = query.join(Employee, MonthlyAttendance.emp_id == Employee.emp_id)
    query = query.join(Designation, Employee.designation_id == Designation.designation_id)

    if emp_id:
        query = query.filter(MonthlyAttendance.emp_id == emp_id)
    if approver_emp_id:
        query = query.filter(MonthlyAttendance.approver_emp_id == approver_emp_id)
    if month:
        query = query.filter(MonthlyAttendance.month == month)
    if year:
        query = query.filter(MonthlyAttendance.year == year)
    if vendor_name:
        query = query.filter(Employee.vendor_name == vendor_name)
    if designation:
        query = query.filter(Designation.designation.ilike(f"%{designation}%"))
    if resigned == 'true':
        query = query.filter(Employee.resigned == True)
    elif resigned == 'false':
        query = query.filter(Employee.resigned == False)

    results = query.all()
    data = []
    for att, emp, des in results:
        data.append({
            'id': att.id,
            'emp_id': att.emp_id,
            'name': emp.name,
            'approver_emp_id': att.approver_emp_id,
            'month': att.month,
            'year': att.year,
            'vendor_name': emp.vendor_name,
            'designation': des.designation,
            'working_days': att.working_days,
            'leaves_taken': att.leaves_taken,
            'loss_of_pay': getattr(att, 'loss_of_pay', None),
            'resigned': emp.resigned,
        })
    session.close()
    return jsonify(data)


if __name__ == '__main__':
    app.run(debug=True, port='8000')
