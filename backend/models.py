from sqlalchemy import (
    Column,
    String,
    Integer,
    Date,
    Boolean,
    ForeignKey,
    Computed,
    CheckConstraint
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class BillingCycleRule(Base):
    __tablename__ = 'billing_cycle_rule'
    rule_id = Column(String, primary_key=True)
    start_day = Column(
        Integer,
        nullable=False,
    )
    vendor_name = Column(String, ForeignKey('vendor.vendor_name'), nullable=False)
    vendor = relationship('Vendor')
    __table_args__ = (
        CheckConstraint('start_day BETWEEN 1 AND 31', name='ck_start_day_range'),
        {'sqlite_autoincrement': True}
    )

class Vendor(Base):
    __tablename__ = 'vendor'
    vendor_name = Column(String, primary_key=True)
    # Add additional vendor fields if needed

class Location(Base):
    __tablename__ = 'location'
    location = Column(String, primary_key=True)
    state = Column(String, nullable=False)

class Approver(Base):
    __tablename__ = 'approver'
    emp_id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    password = Column(String, nullable=False)
    manager_emp_id = Column(String, nullable=True)
    # manager = relationship('Approver', remote_side=[emp_id], backref='subordinates')
    manager_name = Column(String)
    manager_email = Column(String)

class Employee(Base):
    __tablename__ = 'employee'
    emp_id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    gender = Column(String, nullable=False)
    state = Column(String, nullable=False)
    location = Column(String, ForeignKey('location.location'), nullable=False)
    vendor_name = Column(String, ForeignKey('vendor.vendor_name'), nullable=False)
    approver_emp_id = Column(String, ForeignKey('approver.emp_id'), nullable=False)
    billing_rule_id = Column(String, ForeignKey('billing_cycle_rule.rule_id'), nullable=False)
    doj = Column(Date, nullable=False)
    resignation_date = Column(Date, nullable=True)
    resigned = Column(Boolean, default=False)

    location_rel = relationship('Location')
    vendor = relationship('Vendor')
    approver = relationship('Approver')
    billing_rule = relationship('BillingCycleRule')

class MonthlyAttendance(Base):
    __tablename__ = 'monthly_attendance'
    id = Column(Integer, primary_key=True)
    emp_id = Column(String, ForeignKey('employee.emp_id'), nullable=False)
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    working_days = Column(Integer, nullable=False)
    leaves_taken = Column(Integer, nullable=False)
    loss_of_pay = Column(
        Integer,
        Computed('GREATEST(leaves_taken - 2, 0)', persisted=True)
    )

    __table_args__ = (
        # Ensure one record per employee per period
        CheckConstraint('month BETWEEN 1 AND 12', name='ck_month_range'),
        CheckConstraint('year >= 2000', name='ck_year_valid'),
        {'sqlite_autoincrement': True},
    )

    employee = relationship('Employee')
