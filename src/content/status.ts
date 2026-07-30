import type { Project } from './projects';

/**
 * Status colour is a property of the status, never of the artwork.
 *
 * Both the index card and the project page read from here, so a state cannot
 * render one colour in the grid and a different one on its own page.
 *
 * One warm accent marks live work; everything settled recedes into the
 * neutrals. Colour's only job in this list is to say what is running now.
 */
export const STATUS_COLOR: Record<Project['status'], string> = {
  'In progress': 'var(--color-sodium)',
  Shipped: 'var(--color-frost)',
  Experiment: 'var(--color-frost-dim)',
  Archived: 'var(--color-frost-faint)',
};
