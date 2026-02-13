import pandas as pd
from pathlib import Path

# Load the plant care database from an Excel file into a DataFrame
db_path = Path(__file__).parent / 'plant_care_database.xlsx'
plant_care_df = pd.read_excel(db_path).set_index("Plant Name")