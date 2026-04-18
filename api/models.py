from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.sql import func
from .database import Base

class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    url = Column(String, unique=True, index=True)
    source = Column(String, index=True)
    category = Column(String, default="Teknoloji", index=True)
    content = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    published_at = Column(DateTime(timezone=True), server_default=func.now())
    is_vibe_coding = Column(Boolean, default=False)
    is_robotics = Column(Boolean, default=False)

class RSSSource(Base):
    __tablename__ = "rss_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    url = Column(String, unique=True)
    category = Column(String, default="Teknoloji", index=True)
    added_at = Column(DateTime(timezone=True), server_default=func.now())

class BriefingCache(Base):
    __tablename__ = "briefing_cache"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, unique=True, index=True)
    text = Column(Text)
    audio_base64 = Column(Text, nullable=True) # Pre-generated audio stored as base64
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
