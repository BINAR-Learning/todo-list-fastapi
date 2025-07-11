from fastapi import Depends, HTTPException, status, Request
from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials,
    HTTPBasic,
    HTTPBasicCredentials,
)
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.security import verify_token, verify_password
from app.models.user import User
from app.services.auth_service import AuthService
from typing import Optional, Union
import base64

# HTTP Bearer token scheme
security_bearer = HTTPBearer(auto_error=False)
# HTTP Basic auth scheme for email/password
security_basic = HTTPBasic(auto_error=False)


def get_current_user_bearer(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """
    Dependency untuk mendapatkan user berdasarkan Bearer token
    """
    if not credentials:
        return None

    token = credentials.credentials
    user_id = verify_token(token)

    if user_id is None:
        return None

    user = db.query(User).filter(User.id == user_id).first()
    if user is None or not user.is_active:
        return None

    return user


def get_current_user_basic(
    credentials: Optional[HTTPBasicCredentials] = Depends(security_basic),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """
    Dependency untuk mendapatkan user berdasarkan email/password (Basic Auth)
    """
    if not credentials:
        return None

    auth_service = AuthService(db)
    user = auth_service.authenticate_user_email(
        credentials.username, credentials.password
    )

    if user is None or not user.is_active:
        return None

    return user


def get_current_user_flexible(
    bearer_user: Optional[User] = Depends(get_current_user_bearer),
    basic_user: Optional[User] = Depends(get_current_user_basic),
) -> User:
    """
    Dependency yang menerima autentikasi Bearer token atau Basic Auth (email/password)
    """
    user = bearer_user or basic_user

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials. Please provide valid Bearer token or email/password.",
            headers={
                "WWW-Authenticate": "Bearer",
                "WWW-Authenticate-Basic": 'Basic realm="Access to API"',
            },
        )

    return user


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
    db: Session = Depends(get_db),
) -> User:
    """
    Dependency untuk mendapatkan user yang sedang login berdasarkan JWT token (backward compatibility)
    """
    token = credentials.credentials
    user_id = verify_token(token)

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )

    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user_flexible),
) -> User:
    """
    Dependency untuk memastikan user aktif dengan flexible authentication
    """
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
