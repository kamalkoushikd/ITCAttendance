# setup_db.py
"""
Script to create all tables in the database using models.py
Usage: python setup_db.py
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from models import Base

load_dotenv()
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///attendance.db')
engine = create_engine(DATABASE_URL)

if __name__ == '__main__':
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    print('Database tables created.')
