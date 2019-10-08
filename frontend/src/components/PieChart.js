import React from 'react';
import { Pie } from 'react-chartjs-2';
import { addAlpha } from '../add-alpha';

export function PieChart({ labels, colors, features }) {
  // We want data to be an average of features on each frame
  // First, let the data be a bunch of zeros (as many as there are features)
  const data = labels.map(() => 0);

  // Filter out frames where the features are set to null
  features = features.filter(item => item !== null);

  // Next, sum up all of the features that aren't set to -1
  features
    .filter(item => item !== null)
    .forEach(featuresInFrame =>
      featuresInFrame.forEach((feature, index) => (data[index] += feature))
    );

  // Finally, divide them by the number of frames
  const averages = data.map(featureSum => featureSum / features.length);

  return (
    <Pie
      data={{
        labels,
        datasets: [
          {
            data: averages,
            backgroundColor: colors.map(color => addAlpha(color, 0.8)),
            hoverBackgroundColor: colors
          }
        ]
      }}
    />
  );
}
