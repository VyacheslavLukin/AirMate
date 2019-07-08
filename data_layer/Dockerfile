FROM python:3.7

WORKDIR /airmate_api

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY api/aqi_info.json .
COPY api/molar_masses.json .
COPY . .
