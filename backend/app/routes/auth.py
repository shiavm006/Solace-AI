from fastapi import APIRouter, HTTPException, status, Depends
from datetime import timedelta
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.database import users_collection
from app.utils.auth import get_password_hash, verify_password, create_access_token, get_current_active_user
from app.config import settings
from pymongo.errors import DuplicateKeyError
from datetime import datetime
import json
import time

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    # #region agent log
    try:
        with open('/Users/shivammittal/Desktop/Sara_AI/.cursor/debug.log','a') as f:f.write(json.dumps({"location":"auth.py:15","message":"Register endpoint entry","data":{"email":user.email,"first_name":user.first_name,"last_name":user.last_name,"role":user.role},"timestamp":int(time.time()*1000),"sessionId":"debug-session","hypothesisId":"A,C"})+'\n')
    except: pass
    # #endregion
    
    existing_user = users_collection.find_one({"email": user.email})
    if existing_user:
        # #region agent log
        try:
            with open('/Users/shivammittal/Desktop/Sara_AI/.cursor/debug.log','a') as f:f.write(json.dumps({"location":"auth.py:24","message":"Email already exists","data":{"email":user.email},"timestamp":int(time.time()*1000),"sessionId":"debug-session","hypothesisId":"D"})+'\n')
        except: pass
        # #endregion
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # #region agent log
    try:
        with open('/Users/shivammittal/Desktop/Sara_AI/.cursor/debug.log','a') as f:f.write(json.dumps({"location":"auth.py:34","message":"Before password hash","data":{"email":user.email},"timestamp":int(time.time()*1000),"sessionId":"debug-session","hypothesisId":"A"})+'\n')
    except: pass
    # #endregion
    
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
    
    # #region agent log
    try:
        with open('/Users/shivammittal/Desktop/Sara_AI/.cursor/debug.log','a') as f:f.write(json.dumps({"location":"auth.py:50","message":"After password hash, before DB insert","data":{"email":user.email},"timestamp":int(time.time()*1000),"sessionId":"debug-session","hypothesisId":"A"})+'\n')
    except: pass
    # #endregion
    
    try:
        result = users_collection.insert_one(user_dict)
        user_dict["id"] = str(result.inserted_id)
        # #region agent log
        try:
            with open('/Users/shivammittal/Desktop/Sara_AI/.cursor/debug.log','a') as f:f.write(json.dumps({"location":"auth.py:60","message":"Registration successful","data":{"userId":user_dict["id"]},"timestamp":int(time.time()*1000),"sessionId":"debug-session","hypothesisId":"A"})+'\n')
        except: pass
        # #endregion
        return UserResponse(**user_dict)
    except DuplicateKeyError:
        # #region agent log
        try:
            with open('/Users/shivammittal/Desktop/Sara_AI/.cursor/debug.log','a') as f:f.write(json.dumps({"location":"auth.py:68","message":"Duplicate key error","data":{"email":user.email},"timestamp":int(time.time()*1000),"sessionId":"debug-session","hypothesisId":"D"})+'\n')
        except: pass
        # #endregion
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    # #region agent log
    try:
        with open('/Users/shivammittal/Desktop/Sara_AI/.cursor/debug.log','a') as f:f.write(json.dumps({"location":"auth.py:80","message":"Login endpoint entry","data":{"email":credentials.email},"timestamp":int(time.time()*1000),"sessionId":"debug-session","hypothesisId":"B"})+'\n')
    except: pass
    # #endregion
    
    user = users_collection.find_one({"email": credentials.email})
    
    # #region agent log
    try:
        with open('/Users/shivammittal/Desktop/Sara_AI/.cursor/debug.log','a') as f:f.write(json.dumps({"location":"auth.py:89","message":"User lookup result","data":{"userFound":user is not None,"email":credentials.email},"timestamp":int(time.time()*1000),"sessionId":"debug-session","hypothesisId":"B,D"})+'\n')
    except: pass
    # #endregion
    
    if not user or not verify_password(credentials.password, user["hashed_password"]):
        # #region agent log
        try:
            with open('/Users/shivammittal/Desktop/Sara_AI/.cursor/debug.log','a') as f:f.write(json.dumps({"location":"auth.py:97","message":"Login failed - invalid credentials","data":{"email":credentials.email,"userFound":user is not None},"timestamp":int(time.time()*1000),"sessionId":"debug-session","hypothesisId":"B,D"})+'\n')
        except: pass
        # #endregion
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
    
    # Migrate old user records to new schema
    needs_migration = False
    if "name" in user and ("first_name" not in user or "last_name" not in user):
        # Split old "name" field into first_name and last_name
        name_parts = user["name"].strip().split(" ", 1)
        user["first_name"] = name_parts[0] if name_parts else "User"
        user["last_name"] = name_parts[1] if len(name_parts) > 1 else ""
        if not user["last_name"]:
            user["last_name"] = "User"  # Default if no last name
        needs_migration = True
    
    if "role" not in user:
        # Default to employee for old users
        user["role"] = "employee"
        needs_migration = True
    
    # Update database if migration was needed
    if needs_migration:
        update_data = {
            "first_name": user["first_name"],
            "last_name": user["last_name"],
            "role": user["role"],
            "updated_at": datetime.utcnow()
        }
        if "name" in user:
            # Keep old name field for backward compatibility, but add new fields
            pass
        users_collection.update_one(
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
    # Prepare user data for response (exclude MongoDB _id and old name field)
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
    
    # #region agent log
    try:
        with open('/Users/shivammittal/Desktop/Sara_AI/.cursor/debug.log','a') as f:f.write(json.dumps({"location":"auth.py:125","message":"Login successful","data":{"userId":user["id"],"hasToken":bool(access_token)},"timestamp":int(time.time()*1000),"sessionId":"debug-session","hypothesisId":"B"})+'\n')
    except: pass
    # #endregion
    
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
    
    users_collection.update_one(
        {"email": current_user.email},
        {"$set": update_data}
    )
    
    updated_user = users_collection.find_one({"email": current_user.email})
    updated_user["id"] = str(updated_user["_id"])
    
    return UserResponse(**updated_user)

