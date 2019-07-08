from .converter import *
import json

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

    with open("aqi_info.json", 'r') as f:
        bounds = json.load(f)['american']
    if parameter in bounds:
        breakpoints = bounds[parameter]

        i_bounds = bounds['aqi']

        if parameter in bounds["ppm"] and units != "ppm":
            value = convert_ugm3_to_ppm(parameter, value)

        if parameter in bounds["ug/m3"] and units == "ppm":
            value = convert_ppm_to_ugm3(parameter, value)

        value = round(value, bounds["rounding"][parameter])

        # define to which sector the concentration correspond to
        sector = 0
        while value > breakpoints[sector]["up"]:
            sector += 1

        c_high = breakpoints[sector]["up"]
        c_low = breakpoints[sector]["low"]
        i_high = i_bounds[sector]["up"]
        i_low = i_bounds[sector]["low"]

        I = (i_high - i_low) / (c_high - c_low) * (value - c_low) + i_low

        return [
            {
                "value": I,
                "text": i_bounds[sector]["text"]
            }
        ]
    else:
        return [
            {
                "value": 0,
                "text": "Undefined"
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
    if len(all_aqis) > 0:
        station_aqi = sum(all_aqis) / len(all_aqis)
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

