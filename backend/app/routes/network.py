from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas
from . import oauth2
import httpx
import os
from datetime import datetime

router = APIRouter(
    prefix="/api/network",
    tags=["Network Issues"]
)

SERPER_API_KEY = ''

@router.get("/issues", response_model=List[schemas.NetworkIssue])
async def get_network_issues(
    latitude: float,
    longitude: float,
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(oauth2.get_current_user)
):
    try:
        # Validate coordinates
        if not (-90 <= latitude <= 90) or not (-180 <= longitude <= 180):
            raise HTTPException(
                status_code=400,
                detail="Invalid coordinates provided"
            )

        # Get location name using OpenStreetMap Nominatim
        async with httpx.AsyncClient() as client:
            geocoding_url = f"https://nominatim.openstreetmap.org/reverse?lat={latitude}&lon={longitude}&format=json"
            headers = {"User-Agent": "FeedbackHub/1.0"}
            
            try:
                geo_response = await client.get(geocoding_url, headers=headers)
                geo_response.raise_for_status()
                location_data = geo_response.json()
                location_name = location_data.get("display_name", "Unknown Location")
            except Exception as e:
                print(f"Geocoding error: {str(e)}")
                location_name = "Unknown Location"

        # Get ISP information
        try:
            async with httpx.AsyncClient() as client:
                ip_response = await client.get("http://ip-api.com/json/")
                ip_response.raise_for_status()
                isp_data = ip_response.json()
                isp_name = isp_data.get("isp", "Unknown ISP")
        except Exception as e:
            print(f"ISP lookup error: {str(e)}")
            isp_name = "Unknown ISP"

        # Create a new network issue entry
        network_issue = models.NetworkIssue(
            title=f"Network Status Check for {location_name}",
            description=f"Automated network status check for the area",
            location=location_name,
            source="System Generated",
            severity="low",  # Default severity
            isp_affected=isp_name,
            reported_by=current_user.id
        )
        
        db.add(network_issue)
        db.commit()
        db.refresh(network_issue)

        # Return the created issue along with any existing issues in the area
        existing_issues = db.query(models.NetworkIssue)\
            .filter(models.NetworkIssue.location == location_name)\
            .order_by(models.NetworkIssue.timestamp.desc())\
            .limit(5)\
            .all()

        return existing_issues

    except Exception as e:
        print(f"Error in get_network_issues: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

def _determine_severity(text: str) -> str:
    text = text.lower()
    if any(word in text for word in ["outage", "down", "major", "severe"]):
        return "high"
    elif any(word in text for word in ["slow", "intermittent", "minor"]):
        return "low"
    return "medium"