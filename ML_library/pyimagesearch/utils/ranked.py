# import the necessary packages
import numpy as np

dist = {}
allemo = [0 for x in range(8)]
def rank5_accuracy(preds, labels):
	# initialize the rank-1 and rank-5 accuracies
    rank1 = 0
    rank2 = 0

	# loop over the predictions and ground-truth labels
    for (p, gt) in zip(preds, labels):
		# sort the probabilities by their index in descending
		# order so that the more confident guesses are at the
		# front of the list
        p = np.argsort(p)[::-1]

		# predictions
        allemo[p[0]] += 1
        if gt in dist:
          dist[gt][0] += 1
        else:
          dist[gt] = [1, 0, 0]


		# check if the ground-truth label is in the top-2
        if gt in p[:2]:
            dist[gt][2] += 1  
            rank2 += 1

		# check to see if the ground-truth is the #1 prediction
        if gt == p[0]:
          dist[gt][1] += 1  
          rank1 += 1

	# compute the final rank-1 and rank-5 accuracies
    rank1 /= float(len(preds))
    rank2 /= float(len(preds))
 
    for i in range(4):
      x = i
      y = dist[i]
      prec1 =  (y[1]/y[0])
      prec2 =  (y[2]/y[0])
      recall1 = y[1] / allemo[i]
      recall2 = y[2] / allemo[i]

      f1 = 2 * (prec1 * recall1) / (prec1 + recall1)
      f2 = 2 * (prec2 * recall2) / (prec2 + recall2)
      print(x, y, (y[1]/y[0]), (y[2]/y[0]), f1, f2 )

	# return a tuple of the rank-1 and rank-2 accuracies
    return (rank1, rank2)
