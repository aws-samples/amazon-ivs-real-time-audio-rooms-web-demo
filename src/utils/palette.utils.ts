import { PARTICIPANT_PALETTES } from '@Constants';

class UniquePaletteAssigner {
  private usernameMap: Map<string, number>;

  private availableNumbers: number[];

  private hashSeed: number;

  private range: number;

  constructor() {
    this.range = Object.keys(PARTICIPANT_PALETTES).length;
    this.usernameMap = new Map();
    this.availableNumbers = Array.from({ length: this.range }, (_, i) => i + 1);
    this.hashSeed = 0; // Seed value for the hashing function
  }

  private hashUsername(username: string): number {
    if (this.availableNumbers.length === 0) {
      throw new Error('No available numbers left for assignment.');
    }

    let hash = this.hashSeed;
    for (let i = 0; i < username.length; i += 1) {
      hash =
        (hash * 31 + username.charCodeAt(i)) % this.availableNumbers.length;
    }

    return this.availableNumbers[hash];
  }

  private removeNumber(numberToRemove: number) {
    this.availableNumbers = this.availableNumbers.filter(
      (num) => num !== numberToRemove
    );
  }

  getNumberFromUsername(username: string): string[] {
    let assignedNumber: number;

    // Check if the username already has an assigned number
    if (this.usernameMap.has(username)) {
      assignedNumber = this.usernameMap.get(username)!;
    } else {
      // Generate a number for the username
      assignedNumber = this.hashUsername(username);

      // Ensure that the assigned number is unique
      if (this.availableNumbers.includes(assignedNumber)) {
        this.removeNumber(assignedNumber);
        this.usernameMap.set(username, assignedNumber);
      }
    }

    return Object.values(PARTICIPANT_PALETTES)[assignedNumber - 1];
  }
}

export default UniquePaletteAssigner;
