import pandas as pd
from typing import Optional, Dict, Any

class DatasetStore:
    """In-memory dataset state store for quick runtime execution & fallback."""
    _instance = None

    def __init__(self):
        self.raw_df: Optional[pd.DataFrame] = None
        self.mapped_df: Optional[pd.DataFrame] = None
        self.column_mapping: Dict[str, str] = {}
        self.detected_fields: Dict[str, Any] = {}
        self.filename: str = "Synthetic_Sample_Hotel_Data.csv"
        self.inventory_capacity: int = 150

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = DatasetStore()
        return cls._instance

    def set_dataset(self, raw_df: pd.DataFrame, mapped_df: pd.DataFrame, column_mapping: Dict[str, str], detected_fields: Dict[str, Any], filename: str):
        self.raw_df = raw_df
        self.mapped_df = mapped_df
        self.column_mapping = column_mapping
        self.detected_fields = detected_fields
        self.filename = filename

    def set_inventory_capacity(self, capacity: int):
        if capacity > 0:
            self.inventory_capacity = capacity
