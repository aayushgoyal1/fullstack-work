import { addAlpha } from './add-alpha';

it('handles RGB', () => {
  expect(addAlpha('  rgb(10,20,30)\t', 0.2)).toBe('rgba(10,20,30, 0.2)');
  expect(addAlpha('rgb(10, 20, 30)', 1)).toBe('rgba(10, 20, 30, 1)');
  expect(addAlpha('rgb(10, 20, 30) ;', 0)).toBe('rgba(10, 20, 30, 0)');
});
it('handles Hex', () => {
  expect(addAlpha('#a8cdef', 0)).toBe('#a8cdef00');
  expect(addAlpha('#a8cdef', 1)).toBe('#a8cdefff');
  expect(addAlpha('#a8cdef;', 0.5)).toBe('#a8cdef80');
});
