const { hasRequiredFields, convert, norcap } = require('./util');

describe('util', () => {
  it('norcap', () => {
    expect(norcap('src', [['src', 'dest']])).toBe('dest');
    expect(
      norcap('srcA', [
        ['src', 'dest'],
        ['srcA', 'destA'],
        ['srcB', 'destB'],
      ]),
    ).toBe('destA');
  });
  it('norcap throws', () => {
    expect(() => norcap('invalid', [['', '']])).toThrow(TypeError);
  });
  it('convert', () => {
    expect(
      convert(
        {
          a: 1,
          b: 2,
          c: 3,
        },
        [
          ['a', 'aa'],
          ['b', 'bb'],
          ['c', 'cc'],
        ],
      ),
    ).toStrictEqual({
      aa: 1,
      bb: 2,
      cc: 3,
    });

    expect(convert({})).toStrictEqual({});
  });
  it('hasRequiredFields', () => {
    expect(
      hasRequiredFields(
        {
          a: 1,
          b: 2,
          c: 3,
        },
        [
          ['a', 'aa'],
          ['b', 'bb'],
          ['c', 'cc'],
        ],
      ),
    ).toBe(true);
    expect(
      hasRequiredFields(
        {
          a: 1,
          b: 2,
          c: 3,
        },
        [
          ['b', 'bb'],
          ['c', 'cc'],
        ],
      ),
    ).toBe(true);
    expect(
      hasRequiredFields(
        {
          a: 1,
          c: 3,
        },
        [
          ['a', 'aa'],
          ['b', 'bb'],
          ['c', 'cc'],
        ],
      ),
    ).toBe(false);
  });
});
