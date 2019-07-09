from .converter import *
import json
import logging

log = logging.getLogger('AqiCalculator')

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
    log.debug("Input data: parameter: %s, value: %4.3f, unit: %s" % (parameter, value, units))
    log.info("Reading 'aqi_info.json' file")
    with open("aqi_info.json", 'r') as f:
        bounds = json.load(f)['american']
    log.info("Successfully read 'aqi_info.json' file")
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
        log.debug("Result: AQI = %4.3f" % I)
        return [
            {
                "value": I,
                "text": i_bounds[sector]["text"]
            }
        ]
    else:
        log.debug("Parameter %s is not supported." % parameter)
        log.debug("Result: AQI = Undefined")
        return [
            {
                "value": 0,
                "text": "Undefined"
            }
        ]


def get_aqi_of_station(measurements):
    all_aqis = []
    log.info("Reading 'aqi_info.json' file")
    with open("aqi_info.json", 'r') as f:
        bounds = json.load(f)['american']
    log.info("Successfully read 'aqi_info.json' file")
    i_bounds = bounds['aqi']
    log.debug("Received %s measurements from station" % (len(measurements)))
    for measurement in measurements:
        if measurement['parameter'] != 'bc':
            aqi = get_aqi_of_parameter(measurement)
            all_aqis.append(aqi[0]['value'])
        else:
            log.debug("Measurement of 'bc' is not supported")
    log.debug("Calculated AQIs: %s " % (str(all_aqis)))
    if len(all_aqis) > 0:
        station_aqi = sum(all_aqis) / len(all_aqis)
        sector = 0
        while station_aqi > i_bounds[sector]["up"]:
            sector += 1
        log.debug("Result: AQI = %4.3f %s" % (station_aqi, i_bounds[sector]["text"]))
        return [
            {
                "value": station_aqi,
                "text": i_bounds[sector]["text"]
            }
        ]
    else:
        log.debug("Result: AQI = Undefined")
        return [
            {
                "value": 0,
                "text": "Undefined"
            }
        ]

