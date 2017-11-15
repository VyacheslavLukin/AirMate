import json


def main():
    with open('sampleRawData.json', 'r') as fh:
       raw_data = json.load(fh)

    meta = raw_data['meta']
    locations = set()
    clean_data = list()
    for item in raw_data['results']:
        location = item['location']
        if location not in locations:
            locations.add(location)
            clean_data.append(item)
    result = dict()
    result['meta'] = meta
    result['results'] = clean_data
    with open('cleanRawData.json', 'w') as fh:
        json.dump(result, fh)

if __name__ == "__main__":
    main()
    check = json.load(open('cleanRawData.json'))
    for item in check['results']:
        if item['location'] == "DENW179":
            print(item)
