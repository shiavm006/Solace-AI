from fastapi import APIRouter, HTTPException, status, Depends, Request

from datetime import timedelta

from app.schemas.user import UserCreate, UserLogin, UserResponse, Token

from app.database import get_users_collection

from app.utils.auth import get_password_hash, verify_password, create_access_token, get_current_active_user

from app.config import settings

from pymongo.errors import DuplicateKeyError

from datetime import datetime

from slowapi import Limiter

from slowapi.util import get_remote_address



limiter = Limiter(key_func=get_remote_address)



router = APIRouter()



@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)

@limiter.limit("5/minute")

async def register(request: Request, user: UserCreate):

    users_collection = get_users_collection()

    existing_user = await users_collection.find_one({"email": user.email})

    if existing_user:

        raise HTTPException(

            status_code=status.HTTP_400_BAD_REQUEST,

            detail="Email already registered"

        )

    

    user_dict = {

        "email": user.email,

        "first_name": user.first_name,

        "last_name": user.last_name,

        "role": user.role,

        "hashed_password": get_password_hash(user.password),

        "is_active": True,

        "created_at": datetime.utcnow(),

        "updated_at": datetime.utcnow()

    }

    

    try:

        result = await users_collection.insert_one(user_dict)

        user_dict["id"] = str(result.inserted_id)

        return UserResponse(**user_dict)

    except DuplicateKeyError:

        raise HTTPException(

            status_code=status.HTTP_400_BAD_REQUEST,

            detail="Email already registered"

        )



@router.post("/login", response_model=Token)

@limiter.limit("10/minute")

async def login(request: Request, credentials: UserLogin):

    users_collection = get_users_collection()

    user = await users_collection.find_one({"email": credentials.email})

    

    if not user or not verify_password(credentials.password, user["hashed_password"]):

        raise HTTPException(

            status_code=status.HTTP_401_UNAUTHORIZED,

            detail="Incorrect email or password",

            headers={"WWW-Authenticate": "Bearer"},

        )

    

    if not user.get("is_active", True):

        raise HTTPException(

            status_code=status.HTTP_400_BAD_REQUEST,

            detail="Inactive user account"

        )

    

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

        if "name" in user:

            pass

        await users_collection.update_one(

            {"_id": user["_id"]},

            {"$set": update_data}

        )

    

    if credentials.remember_me:

        access_token_expires = timedelta(days=settings.REMEMBER_ME_TOKEN_EXPIRE_DAYS)

    else:

        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    

    access_token = create_access_token(

        data={"sub": user["email"]}, expires_delta=access_token_expires

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

    user_response = UserResponse(**user_for_response)

    

    return Token(access_token=access_token, token_type="bearer", user=user_response)



@router.get("/me", response_model=UserResponse)

async def get_current_user_profile(current_user: UserResponse = Depends(get_current_active_user)):

    return current_user



@router.put("/me", response_model=UserResponse)

async def update_current_user(

    first_name: str = None,

    last_name: str = None,

    role: str = None,

    current_user: UserResponse = Depends(get_current_active_user)

):

    update_data = {"updated_at": datetime.utcnow()}

    

    if first_name is not None:

        update_data["first_name"] = first_name

    if last_name is not None:

        update_data["last_name"] = last_name

    if role is not None:

        if role not in ["admin", "employee"]:

            raise HTTPException(

                status_code=status.HTTP_400_BAD_REQUEST,

                detail="Role must be either 'admin' or 'employee'"

            )

        update_data["role"] = role

    

    users_collection = get_users_collection()

    await users_collection.update_one(

        {"email": current_user.email},

        {"$set": update_data}

    )

    

    updated_user = await users_collection.find_one({"email": current_user.email})

    updated_user["id"] = str(updated_user["_id"])

    

    return UserResponse(**updated_user)

