from datetime import datetime, timedelta

from typing import Optional

from jose import JWTError, jwt

import bcrypt

from fastapi import Depends, HTTPException, status

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.config import settings

from app.database import get_users_collection

from app.schemas.user import TokenData, UserResponse

from bson import ObjectId

security = HTTPBearer()



def verify_password(plain_password: str, hashed_password: str) -> bool:

    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))



def get_password_hash(password: str) -> str:

    salt = bcrypt.gensalt()

    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)

    return hashed.decode('utf-8')



def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):

    to_encode = data.copy()

    if expires_delta:

        expire = datetime.utcnow() + expires_delta

    else:

        expire = datetime.utcnow() + timedelta(minutes=15)

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    return encoded_jwt



async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserResponse:

    credentials_exception = HTTPException(

        status_code=status.HTTP_401_UNAUTHORIZED,

        detail="Could not validate credentials",

        headers={"WWW-Authenticate": "Bearer"},

    )

    

    try:

        token = credentials.credentials

        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

        email: str = payload.get("sub")

        if email is None:

            raise credentials_exception

        token_data = TokenData(email=email)

    except JWTError:

        raise credentials_exception

    

    users_collection = get_users_collection()

    user = await users_collection.find_one({"email": token_data.email})

    if user is None:

        raise credentials_exception

    

    needs_migration = False

    if "name" in user and ("first_name" not in user or "last_name" not in user):

        name_parts = user["name"].strip().split(" ", 1)

        user["first_name"] = name_parts[0] if name_parts else "User"

        user["last_name"] = name_parts[1] if len(name_parts) > 1 else ""

        if not user["last_name"]:

            user["last_name"] = "User"

        needs_migration = True

    

    if "role" not in user:

        user["role"] = "employee"

        needs_migration = True

    

    if needs_migration:

        update_data = {

            "first_name": user["first_name"],

            "last_name": user["last_name"],

            "role": user["role"],

            "updated_at": datetime.utcnow()

        }

        await users_collection.update_one(

            {"_id": user["_id"]},

            {"$set": update_data}

        )

    

    user["id"] = str(user["_id"])

    user_for_response = {

        "id": user["id"],

        "email": user["email"],

        "first_name": user["first_name"],

        "last_name": user["last_name"],

        "role": user["role"],

        "is_active": user.get("is_active", True),

        "created_at": user.get("created_at", datetime.utcnow()),

        "updated_at": user.get("updated_at", datetime.utcnow())

    }

    return UserResponse(**user_for_response)



async def get_current_active_user(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:

    if not current_user.is_active:

        raise HTTPException(status_code=400, detail="Inactive user")

    return current_user



