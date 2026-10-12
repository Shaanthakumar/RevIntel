from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models.domain import Hotel
from app.schemas.dto import HotelResponse, HotelCreate

router = APIRouter(prefix="/hotels", tags=["Hotels"])

@router.get("", response_model=List[HotelResponse])
def get_hotels(db: Session = Depends(get_db)):
    """Fetches list of configured hotels."""
    hotels = db.query(Hotel).all()
    if not hotels:
        # Create default demo hotel if table is empty
        demo_hotel = Hotel(name="Grand RevIntel Resort & Spa", code="REV-GRAND", total_rooms=150, city="Miami", country="USA")
        db.add(demo_hotel)
        db.commit()
        db.refresh(demo_hotel)
        return [demo_hotel]
    return hotels

@router.post("", response_model=HotelResponse, status_code=201)
def create_hotel(hotel_in: HotelCreate, db: Session = Depends(get_db)):
    """Registers a new hotel profile."""
    existing = db.query(Hotel).filter(Hotel.code == hotel_in.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Hotel with this code already exists.")
    hotel = Hotel(**hotel_in.dict())
    db.add(hotel)
    db.commit()
    db.refresh(hotel)
    return hotel
