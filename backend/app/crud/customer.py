from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse
from app.utils.response import SuccessResponse, ErrorResponse


def create_customer(*, db: Session, customer: CustomerCreate, current_user: dict):
    """Create a new customer"""
    # Check if phone already exists
    existing_customer = db.query(Customer).filter(
        func.lower(Customer.phone) == customer.phone.lower()
    ).first()
    
    if existing_customer:
        return ErrorResponse(
            code=400,
            message=f"Customer with phone number {customer.phone} already exists.",
            success=False,
        )

    # Create new customer
    db_customer = Customer(
        name=customer.name,
        phone=customer.phone,
        email=customer.email,
        address=customer.address
    )
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    
    response = CustomerResponse.model_validate(db_customer)
    return SuccessResponse(
        code=201,
        message="Customer created successfully.",
        data=response,
        success=True,
    )


def get_customer_by_phone(*, db: Session, phone: str, current_user: dict):
    """Search customer by phone number"""
    customer = db.query(Customer).filter(Customer.phone == phone).first()
    
    if not customer:
        return ErrorResponse(
            code=404,
            message="Customer not found.",
            success=False,
        )
    
    response = CustomerResponse.model_validate(customer)
    return SuccessResponse(
        code=200,
        message="Customer fetched successfully.",
        data=response,
        success=True,
    )


def get_customer_by_id(*, db: Session, customer_id: int, current_user: dict):
    """Get customer by ID"""
    customer = db.query(Customer).filter(Customer.id == customer_id, Customer.is_active == 1).first()
    
    if not customer:
        return ErrorResponse(
            code=404,
            message="Customer not found.",
            success=False,
        )
    
    response = CustomerResponse.model_validate(customer)
    return SuccessResponse(
        code=200,
        message="Customer fetched successfully.",
        data=response,
        success=True,
    )


def get_all_customers(
    *,
    db: Session,
    current_user: dict,
    page: int = None,
    page_size: int = None,
):
    """Get all customers with pagination"""
    customer_query = db.query(Customer)
    total_count = db.query(Customer).count()
    total_records = customer_query.count()
    
    if page is not None and page_size is not None:
        total_pages = (total_records + page_size - 1) // page_size
        offset = (page - 1) * page_size
        customers = (
            customer_query.order_by(Customer.created_at.desc())
            .offset(offset)
            .limit(page_size)
            .all()
        )
    else:
        customers = customer_query.order_by(Customer.created_at.desc()).all()
        total_pages = 1
        page = 1
        page_size = total_records
    
    response = [CustomerResponse.model_validate(c) for c in customers]
    
    return SuccessResponse(
        code=200,
        message="Customers fetched successfully.",
        data={
            "page": page,
            "page_size": page_size,
            "total_count": total_count,
            "total_records": total_records,
            "total_pages": total_pages,
            "customers": response,
        },
        success=True,
    )


# # def update_customer(
# #     *, db: Session, customer_id: int, customer_update: CustomerUpdate, current_user: dict
# # ):
# #     """Update customer details"""
# #     db_customer = db.query(Customer).filter(Customer.id == customer_id).first()
    
# #     if not db_customer:
# #         return ErrorResponse(
# #             code=404,
# #             message="Customer not found.",
# #             success=False,
# #         )
    
# #     # Check if phone is being updated and if it already exists
# #     if customer_update.phone and customer_update.phone != db_customer.phone:
# #         existing_customer = db.query(Customer).filter(
# #             Customer.phone == customer_update.phone,
# #             Customer.id != customer_id
# #         ).first()
# #         if existing_customer:
# #             return ErrorResponse(
# #                 code=400,
# #                 message=f"Customer with phone number {customer_update.phone} already exists.",
# #                 success=False,
# #             )
    
#     update_data = customer_update.dict(exclude_unset=True)
#     for key, value in update_data.items():
#         setattr(db_customer, key, value)
    
#     db.commit()
#     db.refresh(db_customer)
    
#     response = CustomerResponse.model_validate(db_customer)
#     return SuccessResponse(
#         code=200,
#         message="Customer updated successfully.",
#         data=response,
#         success=True,
#     )


# def delete_customer(*, db: Session, customer_id: int, current_user: dict):
#     """Delete customer"""
#     db_customer = db.query(Customer).filter(Customer.id == customer_id).first()
    
#     if not db_customer:
#         return ErrorResponse(
#             code=404,
#             message="Customer not found.",
#             success=False,
#         )
    
#     db.delete(db_customer)
#     db.commit()
    
#     return SuccessResponse(
#         code=200,
#         message="Customer deleted successfully.",
#         success=True,
#     )
