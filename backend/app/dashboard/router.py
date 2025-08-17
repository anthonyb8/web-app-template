# app/dashboard/router.py
from fastapi import APIRouter


router = APIRouter(prefix="/dashboard")


@router.get("/")
def root():
    return {"message": "MFA Authentication API"}


@router.get("/health")
def health_check():
    return {"status": "healthy"}
