from fastapi.security import OAuth2PasswordBearer
from fastapi import HTTPException, status, Depends
from typing import Union
from . import token
from .. import schemas


# OAuth2PasswordBearer scheme for extracting token
user_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")
admin_oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/admin/login')


def get_current_user(data: str = Depends(user_oauth2_scheme)) -> Union[schemas.UserLogin, schemas.AdminLogin]:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate user credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Decoding and validating the token using your `verify_token` function
    payload = token.verify_token(data, credentials_exception)
    
    # If the payload role is 'user' or 'admin', return the respective payload
    if payload.role == "user":
        return payload  # Returning User Login model for user requests
    elif payload.role == "admin":
        return payload  # Returning Admin Login model for admin requests
    
    # Unauthorized access
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized access")
