type Scheme = 'light' | 'dark';

interface Palette {
  readonly alpha: string;
  readonly beta: string;
  readonly gamma: string;
  scheme?: Scheme;
}

enum Contrast {
  AA = 4.5,
  AAA = 7,
}

@sealed
export class Theme<T extends Palette> {
  private static count = 0;

  constructor(public readonly palette: T, private name: string) {
    Theme.count++;
  }

  passes(ratio: number, level: Contrast = Contrast.AA): boolean {
    return ratio >= level;
  }
}

function sealed(constructor: Function): void {
  Object.seal(constructor);
}

export const cita = new Theme({ alpha: '#63F2C5', beta: '#FF3366', gamma: '#043A73' }, 'Cita');
