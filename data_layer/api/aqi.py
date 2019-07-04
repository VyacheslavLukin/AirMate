from .converter import *
def get_aqi_of_parameter(measurement):
    # I - the (Air Quality) index
    # value - the pollutant concentration
    # c_high - the upper concentration breakpoint
    # c_low - the lower concentration breakpoint
    # i_high - the upper index breakpoint corresponding to c_high
    # i_low - the lower index breakpoint corresponding to c_low

    # Formula used: I = (i_high - i_low)/(c_high-c_low) * (value - c_low) + i_low

    parameter = measurement['parameter']
    value = measurement['value']
    units = measurement['unit']
    breakpoints = []
    i_bounds = [[0, 50], [51, 100], [101, 150], [151, 200], [201, 300], [301, 400], [401, 500], [501, 999]]
    i_meaning = ["Good", "Moderate", "Unhealthy for Sensitive Groups", "Unhealthy", "Very Unhealthy", "Hazardous",
                 "Hazardous", "Hazardous"]
    if parameter == 'o3':
        breakpoints = [[0, 54], [55, 70], [71, 85], [86, 105], [106, 200], [201, 404], [405, 604], [605, 9999]]
        if units != 'ppm':
            value = convert_ugm3_to_ppm(parameter, value)  # convert to ppm
        value = round(value * 1000)  # convert ppm to ppb

    elif parameter == 'no2':
        breakpoints = [[0, 53], [54, 100], [101, 360], [361, 649], [650, 1249], [1250, 1649], [1650, 2049],
                       [2050, 9999]]
        if units != 'ppm':
            value = convert_ugm3_to_ppm(parameter, value)  # convert to ppm
        value = round(value * 1000)  # convert ppm to ppb

    elif parameter == 'so2':
        breakpoints = [[0, 35], [36, 75], [76, 185], [186, 304], [305, 604], [605, 804], [805, 1004],
                       [1005, 9999]]
        if units != 'ppm':
            value = convert_ugm3_to_ppm(parameter, value)  # convert to ppm
        value = round(value * 1000)  # convert ppm to ppb

    elif parameter == 'pm25':
        breakpoints = [[0, 12], [12.1, 35.4], [35.5, 55.4], [55.5, 150.4], [150.5, 250.4], [250.5, 350.4],
                       [350.5, 500.4], [500.5, 9999]]
        if units == 'ppm':
            value = round(convert_ppm_to_ugm3(parameter, value), 1)  # convert to ugm3

    elif parameter == 'pm10':
        breakpoints = [[0, 54], [55, 154], [155, 254], [255, 354], [355, 424], [425, 504], [505, 604],
                       [605, 9999]]
        if units == 'ppm':
            value = round(convert_ppm_to_ugm3(parameter, value))  # convert to ugm3

    elif parameter == 'co':
        breakpoints = [[0, 4.4], [4.5, 9.4], [9.5, 12.4], [12.5, 15.4], [15.5, 30.4], [30.5, 40.4], [40.5, 50.4],
                       [50.5, 9999]]
        if units != 'ppm':
            value = round(convert_ugm3_to_ppm(parameter, value), 1)  # convert to ppm
    else:
        return [
            {
                "value": 0,
                "text": "Undefined"
            }
        ]

    # define to which sector the concentration correspond to
    sector = 0
    while value > breakpoints[sector][1]:
        sector += 1

    c_high = breakpoints[sector][1]
    c_low = breakpoints[sector][0]
    i_high = i_bounds[sector][1]
    i_low = i_bounds[sector][0]

    I = (i_high - i_low) / (c_high - c_low) * (value - c_low) + i_low

    return [
        {
            "value": I,
            "text": i_meaning[sector]
        }
    ]


def get_aqi_of_station(measurements):
    all_aqis = []
    i_bounds = [[0, 50], [51, 100], [101, 150], [151, 200], [201, 300], [301, 400], [401, 500], [501, 999]]
    i_meaning = ["Good", "Moderate", "Unhealthy for Sensitive Groups", "Unhealthy", "Very Unhealthy", "Hazardous",
                 "Hazardous", "Hazardous"]

    for measurement in measurements:
        if measurement['parameter'] != 'bc':
            aqi = get_aqi_of_parameter(measurement)
            all_aqis.append(aqi[0]['value'])
    if len(all_aqis)> 0:
        station_aqi = sum(all_aqis)/len(all_aqis)
        sector = 0
        while station_aqi > i_bounds[sector][1]:
            sector += 1
        return [
            {
                "value": station_aqi,
                "text": i_meaning[sector]
            }
        ]
    else:
        return [
            {
                "value": 0,
                "text": "Undefined"
            }
        ]
