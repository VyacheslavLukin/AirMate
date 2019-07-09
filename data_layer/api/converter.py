import json
import logging

log = logging.getLogger('DataConverter')

def convert_ppm_to_ugm3(parameter, ppm_value):
    # The formula used : μg/m3 = ppm / (Vm/M) * 1000
    # Where Vm is molar volume and M is molar mass
    log.debug("Input: parameter: %s, ppm value: %4.3f" % (parameter, ppm_value))
    log.info("Reading 'molar_masses.json' file")
    with open('molar_masses.json', 'r') as f:
        molar = json.load(f)
    log.info("Successfully read 'molar_masses.json' file")
    res = ppm_value / (22.4 / molar[parameter]) * 1000
    log.debug("Result: ug/m3 value: %4.3f" % res)
    return res


def convert_ugm3_to_ppm(parameter, ugm3_value):
    # The formula used : ppm = μg/m3 * (Vm/M) / 1000
    # Where Vm is molar volume and M is molar mass
    log.debug("Input: parameter: %s, ppm value: %4.3f" % (parameter, ugm3_value))
    log.info("Reading 'molar_masses.json' file")
    with open('molar_masses.json', 'r') as f:
        molar = json.load(f)
    log.info("Successfully read 'molar_masses.json' file")
    res = ugm3_value * (22.4 / molar[parameter]) / 1000
    log.debug("Result: ug/m3 value: %4.3f" % res)
    return res

