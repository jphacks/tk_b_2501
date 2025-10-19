from sqlalchemy import Column, String, DateTime, Text, Float, BigInteger, Enum as SQLEnum, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from geoalchemy2 import Geography
import uuid
import enum
from database import Base


class VisibilityEnum(enum.Enum):
    private = "private"
    unlisted = "unlisted"
    public = "public"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True,
                default=uuid.uuid4, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    username = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True),
                        server_default=func.now(), nullable=False)

    # Relationships
    sessions = relationship(
        "Session", back_populates="user", cascade="all, delete-orphan")
    photos = relationship("Photo", back_populates="user",
                          cascade="all, delete-orphan")

    # Indexes
    __table_args__ = (
        Index('idx_users_email', 'email'),
        Index('idx_users_created_at', 'created_at'),
    )


class Session(Base):
    __tablename__ = "sessions"

    id = Column(UUID(as_uuid=True), primary_key=True,
                default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey(
        "users.id", ondelete="CASCADE"), nullable=False)
    refresh_token_hash = Column(String(255), nullable=False)
    user_agent = Column(Text)
    device_name = Column(String(255))
    ip_address = Column(String(45))  # IPv6対応
    issued_at = Column(DateTime(timezone=True),
                       server_default=func.now(), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked_at = Column(DateTime(timezone=True))

    # Relationships
    user = relationship("User", back_populates="sessions")

    # Indexes
    __table_args__ = (
        Index('idx_sessions_user_id', 'user_id'),
        Index('idx_sessions_expires_at', 'expires_at'),
        Index('idx_sessions_revoked_at', 'revoked_at'),
    )


class Photo(Base):
    __tablename__ = "photos"

    id = Column(UUID(as_uuid=True), primary_key=True,
                default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey(
        "users.id", ondelete="CASCADE"), nullable=False)
    s3_key = Column(String(500), nullable=False)
    mime_type = Column(String(100), nullable=False)
    size_bytes = Column(BigInteger, nullable=False)
    title = Column(String(255))
    description = Column(Text)
    lat = Column(Float)
    lng = Column(Float)
    location = Column(Geography('POINT', srid=4326))  # PostGIS Point
    accuracy_m = Column(Float)
    address = Column(Text)
    exif = Column(JSONB)
 
    visibility = Column(SQLEnum(VisibilityEnum),
                        default=VisibilityEnum.private, nullable=False)

    taken_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True),
                        server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="photos")

    # Indexes
    __table_args__ = (
        Index('idx_photos_user_id', 'user_id'),
        Index('idx_photos_visibility', 'visibility'),
        Index('idx_photos_created_at', 'created_at'),
        Index('idx_photos_taken_at', 'taken_at'),
        Index('idx_photos_location', 'location', postgresql_using='gist'),
    )
