from flask_sqlalchemy import SQLAlchemy
from flask_pymongo import PyMongo

db = SQLAlchemy()
mongo = PyMongo()

def init_db(app):
    db.init_app(app)
    mongo.init_app(app)
