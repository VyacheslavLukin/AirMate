# Instructions for testing

## 1. Math Tests
**Description:** This tests used to check the formulas used for operations such as:
- calculation of station AQI
- calculation of separate parameter AQI
- convertion values from ppm to ug/m3 
- convertion values from ug/m3 to ppm

**Running:** `docker-compose -f docker-compose.test.yml up -d --build `

**Results:** `docker logs -f airmate_tests_1` or `docker logs -f <tests_container_name>`

