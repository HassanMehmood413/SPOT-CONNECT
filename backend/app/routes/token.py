from datetime import datetime, timedelta, timezone
from jose import jwt
from jose.exceptions import JWTError, ExpiredSignatureError  # Only use exceptions from jose
from fastapi.security import OAuth2PasswordBearer
from .. import schemas
from fastapi import HTTPException



oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")



SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30




def create_access_token(data: dict):
    to_encode = data.copy()
    
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str, credentials_exception: HTTPException):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role")
        user_id: int = payload.get("id")

        print(email)
        print(role)
        
        if email is None or role is None:
            raise credentials_exception
        
        return schemas.TokenData(email=email, role=role,id=user_id)
    
    except JWTError:
        raise credentials_exception
