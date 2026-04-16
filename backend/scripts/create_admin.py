import sys
import os

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.connection import SessionLocal
from app.models.models import User, create_tables
from app.utils.auth import register_user_in_supabase
from sqlalchemy import func


def create_admin_user(email: str, password: str):
    """
    Create an admin user in both Supabase Auth and local User table
    """
    # Create tables if they don't exist
    create_tables()
    
    db = SessionLocal()
    
    try:
        # Check if user already exists in local DB
        existing_user = db.query(User).filter(
            func.lower(User.email) == email.lower()
        ).first()
        
        if existing_user:
            print(f"❌ User with email {email} already exists in database!")
            return False
        
        # Register user in Supabase Auth
        print(f"📝 Creating user in Supabase Auth...")
        supabase_response = register_user_in_supabase(email=email, password=password)
        
        if not supabase_response.success:
            print(f"❌ Failed to create user in Supabase: {supabase_response.message}")
            return False
        
        supabase_uid = supabase_response.data["user_id"]
        print(f"✅ User created in Supabase Auth with UID: {supabase_uid}")
        
        # Create user in local database
        print(f"📝 Creating user in local database...")
        new_user = User(
            supabase_uid=supabase_uid,
            email=email,
            is_active=1  # 1 = active
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        print(f"✅ User created successfully in local database with ID: {new_user.id}")
        print(f"\n✨ Admin user created successfully!")
        print(f"📧 Email: {email}")
        print(f"🔑 Password: {password}")
        print(f"🆔 Supabase UID: {supabase_uid}")
        print(f"🆔 Local User ID: {new_user.id}")
        
        return True
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating admin user: {str(e)}")
        return False
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 50)
    print("🔧 Admin User Creation Script")
    print("=" * 50)
    
    # ⚠️ HARDCODE YOUR ADMIN CREDENTIALS HERE ⚠️
    email = "simar123@yopmail.com"  # Change this to your admin email
    password = "simar123"     # Change this to your admin password
    
    if not email or not password:
        print("❌ Email and password must be set in the script!")
        sys.exit(1)
    
    if len(password) < 6:
        print("❌ Password must be at least 6 characters long!")
        sys.exit(1)
    
    success = create_admin_user(email, password)
    
    if success:
        print("\n✅ You can now login with these credentials")
        sys.exit(0)
    else:
        print("\n❌ Failed to create admin user")
        sys.exit(1)
