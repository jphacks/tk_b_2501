from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from datetime import datetime, timedelta

from database import get_db
from models.database import User, Session as DBSession
from schemas.schemas import (
    UserCreate, UserResponse, UserUpdate, UserLogin,
    TokenResponse, RefreshTokenRequest, SessionResponse,
    PaginationParams, PaginatedResponse
)
from auth.auth_service import AuthService, get_current_user

router = APIRouter(prefix="/auth", tags=["認証"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """ユーザー登録"""
    # メールアドレスの重複チェック
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="このメールアドレスは既に登録されています"
        )
    
    # ユーザー作成
    hashed_password = AuthService.hash_password(user.password)
    db_user = User(
        email=user.email,
        password_hash=hashed_password,
        username=user.username
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


@router.post("/login", response_model=TokenResponse)
async def login(
    user_login: UserLogin,
    db: Session = Depends(get_db)
):
    """ログイン"""
    user = AuthService.authenticate_user(db, user_login.email, user_login.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="メールアドレスまたはパスワードが正しくありません"
        )
    
    # アクセストークン作成
    access_token_expires = timedelta(minutes=30)
    access_token = AuthService.create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    # リフレッシュトークン作成
    refresh_token = AuthService.create_refresh_token()
    
    # セッション作成
    session_data = SessionCreate(
        user_agent=None,  # フロントエンドから送信
        device_name=None,  # フロントエンドから送信
        ip_address=None  # フロントエンドから送信
    )
    AuthService.create_session(db, user.id, refresh_token, session_data)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=1800  # 30分
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_request: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """リフレッシュトークンでアクセストークンを更新"""
    session = AuthService.verify_refresh_token(db, refresh_request.refresh_token)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="無効なリフレッシュトークンです"
        )
    
    # 新しいアクセストークン作成
    access_token_expires = timedelta(minutes=30)
    access_token = AuthService.create_access_token(
        data={"sub": str(session.user_id)}, expires_delta=access_token_expires
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_request.refresh_token,
        expires_in=1800
    )


@router.post("/logout")
async def logout(
    refresh_request: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """ログアウト（セッション無効化）"""
    session = AuthService.verify_refresh_token(db, refresh_request.refresh_token)
    if session:
        AuthService.revoke_session(db, session.id)
    
    return {"message": "ログアウトしました"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """現在のユーザー情報を取得"""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """現在のユーザー情報を更新"""
    if user_update.email and user_update.email != current_user.email:
        # メールアドレスの重複チェック
        existing_user = db.query(User).filter(User.email == user_update.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="このメールアドレスは既に使用されています"
            )
        current_user.email = user_update.email
    
    if user_update.username:
        current_user.username = user_update.username
    
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/sessions", response_model=List[SessionResponse])
async def get_user_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """ユーザーのセッション一覧を取得"""
    sessions = db.query(DBSession).filter(
        DBSession.user_id == current_user.id,
        DBSession.revoked_at.is_(None)
    ).order_by(DBSession.issued_at.desc()).all()
    
    return sessions


@router.delete("/sessions/{session_id}")
async def revoke_session(
    session_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """特定のセッションを無効化"""
    session = db.query(DBSession).filter(
        DBSession.id == session_id,
        DBSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="セッションが見つかりません"
        )
    
    AuthService.revoke_session(db, session_id)
    return {"message": "セッションを無効化しました"}
