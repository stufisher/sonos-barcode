from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from .settings import settings


engine = create_engine(
    settings.sqlalchemy_database_url,
    connect_args={"use_pure": False},
    pool_pre_ping=True,
    pool_recycle=3600,
)
SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class Barcode(Base):
    __tablename__ = "barcode"

    barcode = Column(Integer, primary_key=True, index=True)
    entity = Column(String, unique=True, index=True)
