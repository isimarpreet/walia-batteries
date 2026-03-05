from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError as PydanticValidationError
from pydantic_core import ValidationError as PydanticCoreValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import origins  # This loads envs before anything else
from app.exceptions import (
    custom_http_exception_handler,
    generic_exception_handler,
    validation_exception_handler,
)
from app.models.models import create_tables

app = FastAPI()

# Middleware for CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register exception handlers
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)
app.add_exception_handler(StarletteHTTPException, custom_http_exception_handler)
app.add_exception_handler(PydanticValidationError, validation_exception_handler)
app.add_exception_handler(PydanticCoreValidationError, validation_exception_handler)

@app.on_event("startup")
async def startup_event():
    create_tables()

@app.get("/")
async def root():
    return {"message": "Server is running and database tables are created!"}

# Add this to app/main.py (below your @app.get("/") route)

@app.get("/api/customers")
async def get_customers():
    # For now, we are returning dummy data from the backend.
    # Later, we will replace this with a real SQLAlchemy database query!
    return {
        "status_code": 200,
        "message": "Customers fetched successfully",
        "data": [
            { "id": 1, "name": "Rujesh Kumar", "phone": "9870542210", "email": "rejesh@kumar.com", "address": "1600, Unit 1 Delhi, deoto" },
            { "id": 2, "name": "Snarch Natore", "phone": "9870542210", "email": "rejesh@kumar.com", "address": "1200, Unit 1 Delhi, deoto" },
            { "id": 3, "name": "Amit Singh", "phone": "9876543210", "email": "amit@singh.com", "address": "45, Phase 2, Noida" }
        ]
    }
