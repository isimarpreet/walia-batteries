import os
from dotenv import load_dotenv

load_dotenv()

env = os.getenv("ENV", "development")
if env == "production":
    load_dotenv(".env.production")
elif env == "beta":
    load_dotenv(".env.beta")
else:
    load_dotenv(".env.development")

# Load ALLOWED_ORIGINS and ensure it defaults to an empty string if not set
raw_origins = os.getenv("ALLOWED_ORIGINS", "")
# Parse origins into a list
origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]