# seed_db.py
"""
Script to seed the database with initial data (optional).
Usage: python seed_db.py
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from models import Base, Vendor, Location, Approver, BillingCycleRule, Employee
from datetime import date

load_dotenv()
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///attendance.db')
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

if __name__ == '__main__':
    session = Session()
    # Add sample vendors
    v1 = Vendor(vendor_name='Acme Corp')
    v2 = Vendor(vendor_name='Globex Inc')
    session.add_all([v1, v2])
    # Add sample locations
    l1 = Location(location='NYC', state='NY')
    l2 = Location(location='LA', state='CA')
    session.add_all([l1, l2])
    # Add sample approvers
    a1 = Approver(emp_id='A001', name='Alice', email='alice@example.com', password='pass', manager_emp_id='A002', manager_name='Bob', manager_email='bob@example.com')
    a2 = Approver(emp_id='A002', name='Bob', email='bob@example.com', password='pass', manager_emp_id='M001', manager_name='Manager 1', manager_email='manager1.example.com')
    session.add_all([a1, a2])
    # Add sample billing rules
    b1 = BillingCycleRule(rule_id='BR1', start_day=1, vendor_name='Acme Corp')
    b2 = BillingCycleRule(rule_id='BR2', start_day=15, vendor_name='Globex Inc')
    session.add_all([b1, b2])
    # Add sample employees
    e1 = Employee(emp_id='E001', name='Eve', gender='Female', state='NY', location='NYC', vendor_name='Acme Corp', approver_emp_id='A001', billing_rule_id='BR1', doj=date(2023,1,1), resignation_date=None, resigned=False)
    e2 = Employee(emp_id='E002', name='Frank', gender='Male', state='CA', location='LA', vendor_name='Globex Inc', approver_emp_id='A002', billing_rule_id='BR2', doj=date(2023,2,1), resignation_date=None, resigned=False)
    session.add_all([e1, e2])
    session.commit()
    print('Database seeded.')
    session.close()
