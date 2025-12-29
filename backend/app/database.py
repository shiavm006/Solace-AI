from pymongo import MongoClient
from pymongo.database import Database
from app.config import settings

client = MongoClient(settings.MONGODB_URL)
db: Database = client[settings.DATABASE_NAME]

def get_database() -> Database:
    return db

users_collection = db["users"]
calls_collection = db["calls"]

users_collection.create_index("email", unique=True)

