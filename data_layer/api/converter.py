import json

def convert_ppm_to_ugm3(parameter, ppm_value):
    # The formula used : μg/m3 = ppm / (Vm/M) * 1000
    # Where Vm is molar volume and M is molar mass
    with open('molar_masses.json', 'r') as f:
        molar = json.load(f)
        return ppm_value / (22.4 / molar[parameter]) * 1000


def convert_ugm3_to_ppm(parameter, ugm3_value):
    # The formula used : ppm = μg/m3 * (Vm/M) / 1000
    # Where Vm is molar volume and M is molar mass
    with open('molar_masses.json', 'r') as f:
        molar = json.load(f)
        return ugm3_value * (22.4 / molar[parameter]) / 1000

