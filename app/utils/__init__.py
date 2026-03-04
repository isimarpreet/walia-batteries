# Define or import the `response` object here

def response(status_code: int, message: str, data=None):
    """
    Utility function to create a consistent response structure.
    """
    return {
        "status_code": status_code,
        "message": message,
        "data": data,
    }
