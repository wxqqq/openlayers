import _ol_string_ from '../../../src/ol/string.js';


describe('ol.string', function() {

  describe('ol.string.padNumber', function() {

    it('returns the correct padding without precision', function() {
      expect(_ol_string_.padNumber(6.5, 2)).to.be('06.5');
      expect(_ol_string_.padNumber(6.5, 3)).to.be('006.5');
      expect(_ol_string_.padNumber(1.25, 2)).to.be('01.25');
      expect(_ol_string_.padNumber(5, 3)).to.be('005');
    });

    it('returns the same string when padding is less than length', function() {
      expect(_ol_string_.padNumber(6.5, 0)).to.be('6.5');
      expect(_ol_string_.padNumber(6.5, 1)).to.be('6.5');
      expect(_ol_string_.padNumber(1.25, 0)).to.be('1.25');
      expect(_ol_string_.padNumber(5, 0)).to.be('5');
      expect(_ol_string_.padNumber(5, 1)).to.be('5');
    });

    it('returns the correct string precision is given', function() {
      expect(_ol_string_.padNumber(6.5, 0, 2)).to.be('6.50');
      expect(_ol_string_.padNumber(6.5, 1, 2)).to.be('6.50');
      expect(_ol_string_.padNumber(6.5, 2, 2)).to.be('06.50');
      expect(_ol_string_.padNumber(1.25, 2, 3)).to.be('01.250');
      expect(_ol_string_.padNumber(1.25, 2, 1)).to.be('01.3');
      expect(_ol_string_.padNumber(9.9, 2, 0)).to.be('10');
      expect(_ol_string_.padNumber(5, 0, 0)).to.be('5');
      expect(_ol_string_.padNumber(5, 1, 1)).to.be('5.0');
      expect(_ol_string_.padNumber(5, 2, 1)).to.be('05.0');
      expect(_ol_string_.padNumber(5, 2, 0)).to.be('05');
    });

  });

  describe('ol.string.compareVersions', function() {
    var f = _ol_string_.compareVersions;
    it('should return the correct value for number input', function() {
      expect(f(1, 1)).to.be(0);
      expect(f(1.0, 1.1)).to.be.below(0);
      expect(f(2.0, 1.1)).to.be.above(0);
    });
    it('should return the correct value for string input', function() {
      expect(f('1.0', '1.0')).to.be(0);
      expect(f('1.0.0.0', '1.0')).to.be(0);
      expect(f('1.000', '1.0')).to.be(0);
      expect(f('1.0.2.1', '1.1')).to.be.below(0);
      expect(f('1.1', '1.0.2.1')).to.be.above(0);
      expect(f('1', '1.1')).to.be.below(0);
      expect(f('2.2', '2')).to.be.above(0);

      expect(f('9.5', '9.10')).to.be.below(0);
      expect(f('9.5', '9.11')).to.be.below(0);
      expect(f('9.11', '9.10')).to.be.above(0);
      expect(f('9.1', '9.10')).to.be.below(0);
      expect(f('9.1.1', '9.10')).to.be.below(0);
      expect(f('9.1.1', '9.11')).to.be.below(0);

      expect(f(' 7', '6')).to.be.above(0);
      expect(f('7 ', '6')).to.be.above(0);
      expect(f(' 7 ', '6')).to.be.above(0);
      expect(f('7', ' 6')).to.be.above(0);
      expect(f('7', '6 ')).to.be.above(0);
      expect(f('7', ' 6 ')).to.be.above(0);
      expect(f(' 7', ' 6')).to.be.above(0);
      expect(f('7 ', '6 ')).to.be.above(0);
      expect(f(' 7 ', ' 6 ')).to.be.above(0);
    });
  });
});
