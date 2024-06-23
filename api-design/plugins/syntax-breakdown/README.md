# Inspire Syntax Breakdown Plugin

This plugin helps to explain parts of code, in context.

## Basic syntax

- A `syntax-breakdown` class on the code element to toggle this functionality.
- Any spans with `title` attributes on these code elements will be turned into tooltips
- The tooltips are `.delayed` elements, and you can circle through them with the arrow keys.
- Tooltips can be nested.

## Customization

### Positioning

The orientation and direction of the tooltip can be customized with the following CSS variables:

- `--tooltip-orientation: horizontal | vertical` for the direction of the tooltip line
- `--tooltip-alignment: start | end` for the placement of the tooltip relative to the code it’s annotating.
E.g. `start` will correspond to left if the orientation is horizontal and top if the orientation is vertical.
- `--tooltip-line-alignment: start | center | end` control the alignment of the tooltip relative to its line (default: `center`).
Currently only implemented for vertical orientation.

As a shortcut, there is also a `data-tooltip` attribute that can be used customize all of the above at once:
- Its value is a direction keyword (`top`, `bottom`, `left`, `right`) which sets both orientation and alignment.
- An optional second direction keyword controls line alignment.

### Styling

Style customization with CSS variables:
- `--color1` and `--color2` for the gradient colors (which default to the first two theme accent colors)
- `--line-width` for the line thickness
- `--line-length` for the length of the line
- `--offset`
- `--gradient-direction`
- `--tooltip-width`
-