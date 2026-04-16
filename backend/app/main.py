from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import origins
from app.exceptions import (
    custom_http_exception_handler,
    generic_exception_handler,
    validation_exception_handler,
)
from app.models.models import create_tables
from app.routers import customer, battery, auth,brand, model,claim

app = FastAPI(
    title="Battery Claim Management System",
    description="Backend API for managing battery warranty claims",
    version="1.0.0"
)

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

# Include routers
app.include_router(auth.router)
app.include_router(customer.router)
app.include_router(battery.router)
app.include_router(brand.router)
app.include_router(model.router)
app.include_router(claim.router)


@app.on_event("startup")
async def startup_event():
    create_tables()


@app.get("/")
async def root():
    return {
        "message": "Battery Claim Management System API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
