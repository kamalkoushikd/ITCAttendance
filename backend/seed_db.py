# seed_db.py
"""
Script to seed the database with initial data (optional).
Usage: python seed_db.py
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from models import Base, Vendor, Location, Approver, BillingCycleRule, Designation, Employee, MonthlyAttendance
from datetime import date
import datetime
import bcrypt

load_dotenv()
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///attendance.db')
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

if __name__ == '__main__':
    session = Session()
    # Clear all tables
    session.query(MonthlyAttendance).delete()
    session.query(Employee).delete()
    session.query(Approver).delete()
    session.query(Location).delete()
    session.query(BillingCycleRule).delete()
    session.query(Designation).delete()
    session.query(Vendor).delete()
    session.commit()

    # Add sample vendors
    v1 = Vendor(vendor_name='Acme Corp')
    v2 = Vendor(vendor_name='Globex Inc')
    session.add_all([v1, v2])
    session.commit()

    # Add sample locations
    l1 = Location(location='NYC', state='NY')
    l2 = Location(location='LA', state='CA')
    session.add_all([l1, l2])
    session.commit()

    # Add sample approvers with non-null managers (manager is not an approver)
    a1 = Approver(emp_id='A001', name='Alice', email='alice@acme.com', password_hash=bcrypt.hashpw('pass'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'), manager_emp_id='M001', manager_name='Mary Manager', manager_email='mary@acme.com')
    a2 = Approver(emp_id='A002', name='Bob', email='bob@globex.com', password_hash=bcrypt.hashpw('pass'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'), manager_emp_id='M002', manager_name='Ben Boss', manager_email='ben@globex.com')
    session.add_all([a1, a2])
    session.commit()

    # Add sample designations
    d1 = Designation(designation='Engineer', vendor_name='Acme Corp')
    d2 = Designation(designation='Manager', vendor_name='Acme Corp')
    d3 = Designation(designation='Analyst', vendor_name='Globex Inc')
    session.add_all([d1, d2, d3])
    session.commit()

    # Add sample billing rules
    b1 = BillingCycleRule(rule_id='BR1', start_day=1, vendor_name='Acme Corp')
    b2 = BillingCycleRule(rule_id='BR2', start_day=15, vendor_name='Globex Inc')
    session.add_all([b1, b2])
    session.commit()

    # Fetch designation IDs for use in employees
    acme_engineer = session.query(Designation).filter_by(designation='Engineer', vendor_name='Acme Corp').first()
    globex_analyst = session.query(Designation).filter_by(designation='Analyst', vendor_name='Globex Inc').first()

    # Add sample employees
    e1 = Employee(
        emp_id='E001',
        name='Eve',
        gender='Female',
        state='NY',
        location='NYC',
        vendor_name='Acme Corp',
        approver_emp_id='A001',
        billing_rule_id='BR1',
        designation_id=acme_engineer.designation_id,
        dob=datetime.date(1990, 5, 10),
        doj=datetime.date(2023, 1, 1),
        resignation_date=None,
        resigned=False
    )
    e2 = Employee(
        emp_id='E002',
        name='Frank',
        gender='Male',
        state='CA',
        location='LA',
        vendor_name='Globex Inc',
        approver_emp_id='A002',
        billing_rule_id='BR2',
        designation_id=globex_analyst.designation_id,
        dob=datetime.date(1988, 8, 20),
        doj=datetime.date(2023, 2, 1),
        resignation_date=None,
        resigned=False
    )
    session.add_all([e1, e2])
    session.commit()
    session.close()
    print('Seeded database with initial data.')
