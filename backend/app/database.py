from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings
import certifi
import ssl

client: AsyncIOMotorClient = None
db: AsyncIOMotorDatabase = None

async def init_database():
    global client, db
    
    try:
        ssl_context = ssl.create_default_context(cafile=certifi.where())
        ssl_context.check_hostname = True
        ssl_context.verify_mode = ssl.CERT_REQUIRED
        ssl_context.minimum_version = ssl.TLSVersion.TLSv1_2
        
        client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            tls=True,
            tlsCAFile=certifi.where(),
            tlsAllowInvalidCertificates=False,
            tlsAllowInvalidHostnames=False,
            serverSelectionTimeoutMS=30000,
            connectTimeoutMS=20000,
            socketTimeoutMS=20000,
            retryWrites=True,
            w='majority'
        )
        db = client[settings.DATABASE_NAME]
        
        await client.admin.command('ping')
        import logging
        logger = logging.getLogger(__name__)
        logger.info("✅ MongoDB connected")
        
        users_collection = db["users"]
        tasks_collection = db["tasks"]
        checkins_collection = db["checkins"]
        
        await users_collection.create_index("email", unique=True)
        await tasks_collection.create_index("task_id", unique=True)
        await checkins_collection.create_index([("emp_id", 1), ("created_at", -1)])
        
        return db
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"❌ MongoDB failed: {e}", exc_info=True)
        raise

async def get_database():
    if db is None:
        await init_database()
    return db

def get_users_collection():
    if db is None:
        raise RuntimeError("Database not initialized")
    return db["users"]

def get_checkins_collection():
    if db is None:
        raise RuntimeError("Database not initialized")
    return db["checkins"]

def get_tasks_collection():
    if db is None:
        raise RuntimeError("Database not initialized")
    return db["tasks"]

