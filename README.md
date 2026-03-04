# 🧥WALIA BATTERY (FastAPI + Supabase)

This is the backend for a **walia battery*, built using **FastAPI**, **Supabase Auth**, and **PostgreSQL**.  
It allows sellers to list second-hand clothing items (manually or via bulk upload) and buyers to browse them.

---

## 🚀 Tech Stack

- FastAPI — Python Web Framework  
- Supabase Auth — Authentication  
- PostgreSQL — Database  
- SQLAlchemy — ORM  
- Pandas — For Excel bulk uploads  
- python-dotenv — For env variable management  
- httpx — Async HTTP support (optional)  

---

## 🛠️ Project Setup (Full Guide)
1. **Clone the Repository**

```bash
git clone https://github.com/your-username/walia_battery.git
cd walia_battery
```


2. **Move to the project directory:**

    Change the directory to the cloned project:

    ```bash
    cd Thrift-store-platform
    ```

3. **Create the `.env` file:**

    Create a `.env` file in the root directory:

    ```bash
    touch .env
    ```

4. **Add database configuration to the `.env` file:**

    Open the `.env` file and add the following database configuration variables:

    ```plaintext
    # Server Configurations
    HOST=0.0.0.0
    PORT=8000

    # Allowed Origin
    ALLOWED_ORIGINS=

    # Database Configurations
    SUPABASE_URL=
    SUPABASE_KEY=
    DIALECT=postgresql
    DB_HOST=
    DB_NAME=
    DB_USER=
    DB_PASSWORD=
    DB_PORT=

    #JWT Secret
    JWT_SECRET=
    ```

5. **Set up the project (choose one of the following):**

    - **Option 1: Set up with Docker**

        If you're using Docker, run the following command to set up the services:

        ```bash
        docker compose up -d
        ```

    - **Option 2: Set up without Docker**

        If you're not using Docker, follow these steps:

        1. Create a virtual environment:

            ```bash
            python3 -m venv env
            ```

        2. Activate the virtual environment:

            ```bash
            Ubuntu/Mac:
               source env/bin/activate

            Windows:
               env\Scripts\activate

            ```

        3. Install the required dependencies:

            ```bash
            pip install -r requirements.txt
            ```

        4. Start the FastAPI server:

            ```bash
            uvicorn app.main:app --port=8000 --host="0.0.0.0" --reload
            ```

The backend should now be running on `http://0.0.0.0:8000`.

# walia-batteries
