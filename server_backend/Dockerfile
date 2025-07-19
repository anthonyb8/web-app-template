#syntax=docker/dockerfile:1 

FROM python:3.11-slim

# Set working directory
WORKDIR /server_backend

# Copy only requirements first for better caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app code
COPY . .

# Run the FastAPI app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]

