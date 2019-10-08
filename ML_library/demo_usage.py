from demo import image_analyzer
import numpy as np
import pandas as pd

alice = image_analyzer()
bob = image_analyzer()

bob.analyze('/path/to/bob/img11')
bob.analyze('/path/to/bob/img2')


imgs = ['/path/to/alice/img21', '/path/to/alice/img22']

alice.analyze_batch(imgs)

bob_features = bob.get_features()
#alice.print_features()

x = alice.get_features()
x = [x[k].values() for k in x]
#make sure everthing adds up to 1
print([sum(k) for k in x])
