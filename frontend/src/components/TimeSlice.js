import React from 'react';
import { Bar } from 'react-chartjs-2';
import { addAlpha } from '../add-alpha';

export function TimeSlice({ labels, colors, features, fps, uploadedAt }) {
  let timeLabels = [];
  let datasets = generateEmptyDatasets(labels, colors);

  // Calculate how long one frame is
  const msPerFrame = (1 / fps) * 1000;

  let startTime = new Date(uploadedAt);

  features.forEach((featuresInFrame, frameNumber) => {
    let timeOfThisFrame = new Date(+startTime);
    timeOfThisFrame.setMilliseconds(
      timeOfThisFrame.getMilliseconds() + Math.round(msPerFrame * frameNumber)
    );
    timeLabels.push(timeOfThisFrame.toLocaleTimeString());
    datasets.forEach((dataset, i) => {
      if (featuresInFrame === null) {
        dataset.data.push(0); // Push 0 if there is no data for this frame
      } else {
        dataset.data.push(featuresInFrame[i]);
      }
    });
  });

  return (
    <Bar
      data={{ labels: timeLabels, datasets }}
      width={100}
      height={50}
      options={{
        scales: {
          xAxes: [{ stacked: true }],
          yAxes: [
            {
              stacked: true,
              ticks: {
                // Note that the lines below make sure the graph only shows data in the range of 0 to 1!
                min: 0,
                max: 1
              }
            }
          ]
        }
      }}
    />
  );
}

// Want to add another property that you want to get shown? Add another array item here.
export function generateEmptyDatasets(labels, colors) {
  // Zip labels and colors together:
  const labelsAndColors = labels.map((label, i) => [label, colors[i]]);
  // Now map a label + color to an empty dataset entry
  return labelsAndColors.map(([label, color]) => ({
    label,
    backgroundColor: addAlpha(color, 0.3),
    borderColor: color,
    borderWidth: 1,
    data: []
  }));
}
