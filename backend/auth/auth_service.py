from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID
import bcrypt
import secrets
from jose import JWTError, jwt
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
from models.database import User, Session as DBSession
from schemas.schemas import UserLogin, SessionCreate
import os

# 設定
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 30

security = HTTPBearer()


class AuthService:
    @staticmethod
    def hash_password(password: str) -> str:
        """パスワードをハッシュ化"""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    @staticmethod
    def verify_password(password: str, hashed_password: str) -> bool:
        """パスワードを検証"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
        """アクセストークンを作成"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def create_refresh_token() -> str:
        """リフレッシュトークンを作成（ランダム文字列）"""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def verify_access_token(token: str) -> dict:
        """アクセストークンを検証"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id: str = payload.get("sub")
            if user_id is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication credentials",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            return payload
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        """ユーザー認証"""
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None
        if not AuthService.verify_password(password, user.password_hash):
            return None
        return user
    
    @staticmethod
    def create_session(
        db: Session, 
        user_id: UUID, 
        refresh_token: str,
        session_data: SessionCreate
    ) -> DBSession:
        """セッションを作成"""
        expires_at = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        
        db_session = DBSession(
            user_id=user_id,
            refresh_token_hash=AuthService.hash_password(refresh_token),
            user_agent=session_data.user_agent,
            device_name=session_data.device_name,
            ip_address=session_data.ip_address,
            expires_at=expires_at
        )
        
        db.add(db_session)
        db.commit()
        db.refresh(db_session)
        return db_session
    
    @staticmethod
    def revoke_session(db: Session, session_id: UUID) -> bool:
        """セッションを無効化"""
        db_session = db.query(DBSession).filter(DBSession.id == session_id).first()
        if not db_session:
            return False
        
        db_session.revoked_at = datetime.utcnow()
        db.commit()
        return True
    
    @staticmethod
    def verify_refresh_token(db: Session, refresh_token: str) -> Optional[DBSession]:
        """リフレッシュトークンを検証"""
        sessions = db.query(DBSession).filter(
            DBSession.revoked_at.is_(None),
            DBSession.expires_at > datetime.utcnow()
        ).all()
        
        for session in sessions:
            if AuthService.verify_password(refresh_token, session.refresh_token_hash):
                return session
        
        return None


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """現在のユーザーを取得"""
    token = credentials.credentials
    payload = AuthService.verify_access_token(token)
    user_id = payload.get("sub")
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """現在のユーザーを取得（オプショナル）"""
    if not credentials:
        return None
    
    try:
        return get_current_user(credentials, db)
    except HTTPException:
        return None
