from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    username = Column(
        String, unique=True, index=True, nullable=True
    )  # Made nullable for email-only users
    email = Column(String, unique=True, index=True, nullable=False)  # New email field
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)  # Email verification status
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship
    lists = relationship("List", back_populates="owner", cascade="all, delete-orphan")

    def __str__(self):
        """String representation of user"""
        return self.username if self.username else self.email
