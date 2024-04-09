import Themepack from './Themepack';

describe('Themepack', () => {
  let pack: Themepack;

  describe('randomly generate numbers with the correct range', () => {
    it('should generate a number between 15053 and 15116 for the food themepack', () => {
      pack = new Themepack('food');
      const randomItemId = pack.getRandomItemId();
      expect(randomItemId).toBeGreaterThanOrEqual(15053);
      expect(randomItemId).toBeLessThanOrEqual(15116);
    });
    it('should generate a number between 15117 and 15180 for the emojis themepack', () => {
      pack = new Themepack('emojis');
      const randomItemId = pack.getRandomItemId();
      expect(randomItemId).toBeGreaterThanOrEqual(15117);
      expect(randomItemId).toBeLessThanOrEqual(15180);
    });
    it('should generate a number between 15181 and 15229 for the egg themepack', () => {
      pack = new Themepack('egg');
      const randomItemId = pack.getRandomItemId();
      expect(randomItemId).toBeGreaterThanOrEqual(15181);
      expect(randomItemId).toBeLessThanOrEqual(15229);
    });
  });
});
