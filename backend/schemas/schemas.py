from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID
from enum import Enum


class VisibilityEnum(str, Enum):
    private = "private"
    unlisted = "unlisted"
    public = "public"


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=1, max_length=100)


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None


# Session Schemas
class SessionCreate(BaseModel):
    user_agent: Optional[str] = None
    device_name: Optional[str] = None
    ip_address: Optional[str] = None


class SessionResponse(BaseModel):
    id: UUID
    user_id: UUID
    device_name: Optional[str]
    ip_address: Optional[str]
    issued_at: datetime
    expires_at: datetime
    revoked_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# Photo Schemas
class PhotoBase(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    lat: Optional[float] = Field(None, ge=-90, le=90)
    lng: Optional[float] = Field(None, ge=-180, le=180)
    accuracy_m: Optional[float] = Field(None, ge=0)
    address: Optional[str] = None
    visibility: VisibilityEnum = VisibilityEnum.PRIVATE
    taken_at: Optional[datetime] = None


class PhotoCreate(PhotoBase):
    s3_key: str = Field(..., max_length=500)
    mime_type: str = Field(..., max_length=100)
    size_bytes: int = Field(..., gt=0)
    exif: Optional[Dict[str, Any]] = None


class PhotoUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    visibility: Optional[VisibilityEnum] = None
    address: Optional[str] = None


class PhotoResponse(PhotoBase):
    id: UUID
    user_id: UUID
    s3_key: str
    mime_type: str
    size_bytes: int
    exif: Optional[Dict[str, Any]]
    created_at: datetime
    
    class Config:
        from_attributes = True


# Auth Schemas
class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshTokenRequest(BaseModel):
    refresh_token: str


# Error Schemas
class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None


# Pagination Schemas
class PaginationParams(BaseModel):
    skip: int = Field(0, ge=0)
    limit: int = Field(100, ge=1, le=1000)


class PaginatedResponse(BaseModel):
    items: list
    total: int
    skip: int
    limit: int
    has_next: bool
