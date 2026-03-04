from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text, func
from sqlalchemy.ext.declarative import declarative_base
from app.database.connection import engine
from datetime import datetime

Base = declarative_base()



# ---------------------------
# CUSTOMER TABLE
# ---------------------------
class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, unique=True, nullable=False)
    email = Column(String, nullable=True)
    address = Column(Text, nullable=True)

    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


# ---------------------------
# BATTERY BRAND TABLE
# ---------------------------
class BatteryBrand(Base):
    __tablename__ = "battery_brands"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


# ---------------------------
# BATTERY MODEL TABLE
# ---------------------------
class BatteryModel(Base):
    __tablename__ = "battery_models"

    id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, ForeignKey("battery_brands.id"), nullable=False)
    model_name = Column(String, nullable=False)
    warranty_months = Column(Integer, nullable=True)

    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


# ---------------------------
# BATTERY TABLE (Sold Battery)
# ---------------------------
class Battery(Base):
    __tablename__ = "batteries"

    id = Column(Integer, primary_key=True, index=True)

    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    brand_id = Column(Integer, ForeignKey("battery_brands.id"), nullable=False)
    model_id = Column(Integer, ForeignKey("battery_models.id"), nullable=False)

    serial_number = Column(String, unique=True, nullable=False)
    date_of_sale = Column(Date, nullable=False)
    invoice_number = Column(String, nullable=True)

    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


# ---------------------------
# CLAIM TABLE
# ---------------------------
class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)

    claim_number = Column(Integer, unique=True, index=True)

    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    faulty_battery_id = Column(Integer, ForeignKey("batteries.id"), nullable=False)

    actual_dos = Column(Date, nullable=True)
    co_number = Column(String, nullable=True)

    new_battery_model_id = Column(Integer, ForeignKey("battery_models.id"), nullable=True)
    new_battery_serial_number = Column(String, nullable=True)

    stock_status = Column(String, nullable=False)  # new / foc / not_in_stock
    remarks = Column(Text, nullable=True)

    status = Column(String, default="pending")

    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now, onupdate=func.now())

# Create the table
def create_tables():
    Base.metadata.create_all(bind=engine)
