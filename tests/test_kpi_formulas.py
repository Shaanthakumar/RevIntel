import pytest

def calculate_occupancy_rate(rooms_sold: int, available_rooms: int) -> float:
    if available_rooms <= 0:
        return 0.0
    return round((rooms_sold / available_rooms) * 100, 2)

def calculate_adr(room_revenue: float, rooms_sold: int) -> float:
    if rooms_sold <= 0:
        return 0.0
    return round(room_revenue / rooms_sold, 2)

def calculate_revpar(room_revenue: float, available_rooms: int) -> float:
    if available_rooms <= 0:
        return 0.0
    return round(room_revenue / available_rooms, 2)

def calculate_cancellation_rate(cancelled_bookings: int, total_bookings: int) -> float:
    if total_bookings <= 0:
        return 0.0
    return round((cancelled_bookings / total_bookings) * 100, 2)


def test_occupancy_rate_calculation():
    assert calculate_occupancy_rate(120, 150) == 80.0
    assert calculate_occupancy_rate(0, 150) == 0.0
    assert calculate_occupancy_rate(150, 0) == 0.0  # Division by zero safety

def test_adr_calculation():
    assert calculate_adr(18000.0, 120) == 150.0
    assert calculate_adr(0.0, 0) == 0.0  # Division by zero safety

def test_revpar_calculation():
    assert calculate_revpar(18000.0, 150) == 120.0
    # RevPAR must also equal (Occupancy * ADR) / 100
    occ = calculate_occupancy_rate(120, 150)
    adr = calculate_adr(18000.0, 120)
    assert round((occ * adr) / 100, 2) == 120.0

def test_cancellation_rate_calculation():
    assert calculate_cancellation_rate(25, 100) == 25.0
    assert calculate_cancellation_rate(0, 0) == 0.0  # Division by zero safety
