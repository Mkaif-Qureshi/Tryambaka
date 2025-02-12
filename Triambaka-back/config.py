class Config:
    SQLALCHEMY_DATABASE_URI = "postgresql://user:password@localhost/triambaka"
    MONGO_URI = "mongodb://localhost:27017/triambaka"
    SQLALCHEMY_TRACK_MODIFICATIONS = False