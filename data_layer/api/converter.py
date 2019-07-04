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


def get_molar_mass(parameter):
    # define mm (molar mass)
    if parameter == 'no2':
        mm = 518.20206
    elif parameter == 'o3':
        mm = 47.99820
    elif parameter == 'pm10':
        mm = 1449.127490
    elif parameter == 'pm25':
        mm = 3622.818725
    elif parameter == 'so2':
        mm = 64.066
    elif parameter == 'co':
        mm = 58.9331950
    elif parameter == 'bc':
        mm = 12.011
    else:
        mm = 0.001
    return mm
