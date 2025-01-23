from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates
from app.utils import fetch_nearby_schools  # Import the helper function

# Initialize the router and templates
router = APIRouter()
templates = Jinja2Templates(directory="app/templates")

@router.get("/fetch-schools")
def get_nearby_schools(location: str):
    schools = fetch_nearby_schools(location)
    if not schools:
        raise HTTPException(status_code=404, detail="No schools found for the given location.")
    return RedirectResponse(f"/show-schools?location={location}")

@router.get("/show-schools")
def show_schools(location: str, request: Request):
    schools = fetch_nearby_schools(location)
    if not schools:
        raise HTTPException(status_code=404, detail="No schools found for the given location.")
    return templates.TemplateResponse("schools.html", {"request": request, "location": location, "schools": schools})
