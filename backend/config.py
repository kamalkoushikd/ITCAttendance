# config.py
import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/mydb")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
