// Given a color like rgb(10, 20, 30) or #ABCDEF and a percentage alpha value like .1, make the color have that level of transparency
export function addAlpha(color, alpha) {
  // Remove whitespace at beginning and end of string
  color = color.trim();
  // Remove trailing semicolon if it's present
  if (color[color.length - 1] === ';') {
    color = color.substr(0, color.length - 1).trim();
  }

  if (color[0] === '#') {
    // This color is in hex
    return (
      color +
      Math.round(alpha * 255)
        .toString(16)
        .padStart(2, '0')
    );
  } else {
    // This color is in rgb()
    // First, remove the last parenthesis, so you get e.g. rgb(10, 20, 30
    const rgbWithoutClosingParen = color.substr(0, color.length - 1);
    // Next, add the alpha and parenthesis, e.g. rgb(10, 20, 30, .1)
    const rgbWithAlpha = rgbWithoutClosingParen + ', ' + alpha + ')';
    // Finally, replace the rgb with rgba, e.g. rgba(10, 20, 30, .1)
    return 'rgba' + rgbWithAlpha.substr(3);
  }
}
