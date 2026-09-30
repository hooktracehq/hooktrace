







from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

DATABASE_URL = os.getenv(
"DATABASE_URL",
"postgresql+psycopg2://hooktrace@db:5432/hooktrace"
)

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
autocommit=False,
autoflush=False,
bind=engine
)

Base = declarative_base()