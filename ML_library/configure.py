from os import path
from json import load

# Find the root (not the root of this library!)
root = path.dirname(path.abspath(path.dirname(__file__)))
# Parse the config file
with open(path.join(root, 'config.json')) as file:
    config = load(file)
    # The paths are relative to config.json's location, so they need to be updated
    config['uploadsDir'] = path.join(root, config['uploadsDir'])
    if config['processing']['frames'] != False:
        config['processing']['frames']['outputDir'] = path.join(
            root, config['processing']['frames']['outputDir'])
    if config['processing']['audio'] != False:
        config['processing']['audio']['outputDir'] = path.join(
            root, config['processing']['audio']['outputDir'])
