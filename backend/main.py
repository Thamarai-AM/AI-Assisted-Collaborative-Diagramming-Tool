from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import jwt
import os
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware


# Load secrets from env
JWT_SECRET = os.getenv("JWT_SECRET", "supersecretkey")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "ai")

# App + DB
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # or ["*"] to allow all
    allow_credentials=True,
    allow_methods=["*"],          # allow all methods (GET, POST, etc.)
    allow_headers=["*"],          # allow all headers
)

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]
users_collection = db["users"]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Pydantic models
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Helpers
def create_token(data: dict):
    payload = {
        **data,
        "exp": datetime.utcnow() + timedelta(hours=1),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

# ==========================
# REGISTER
# ==========================
@app.post("/register")
async def register_user(req: RegisterRequest):
    print("------------",req)
    existing = await users_collection.find_one({"email": req.email})
    if existing:
        raise HTTPException(status_code=409, detail="email already registered")

    hashed_pw = pwd_context.hash(req.password)
    user_doc = {
        "name": req.name,
        "email": req.email,
        "password": hashed_pw,
    }
    result = await users_collection.insert_one(user_doc)

    return {"userId": str(result.inserted_id), "email": req.email}

# ==========================
# LOGIN
# ==========================
@app.post("/login")
async def login_user(req: LoginRequest):
    user = await users_collection.find_one({"email": req.email})
    if not user:
        raise HTTPException(status_code=401, detail="invalid credentials")

    if not pwd_context.verify(req.password, user["password"]):
        raise HTTPException(status_code=401, detail="invalid credentials")

    token = create_token({"userId": str(user["_id"]), "email": user["email"]})

    return {
        "token": token,
        "userId": str(user["_id"]),
        "email": user["email"],
        "name": user["name"],
    }
