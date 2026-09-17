"""WCAG contrast helpers."""
from dataclasses import dataclass

AA = 4.5


@dataclass(frozen=True)
class Color:
    hex: str

    def luminance(self) -> float:
        channels = [int(self.hex[i : i + 2], 16) / 255 for i in (1, 3, 5)]
        linear = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in channels]
        return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]

    def __str__(self):
        return f"Color({self.hex!r})"


def contrast(fg: Color, bg: Color) -> float:
    hi, lo = sorted((fg.luminance(), bg.luminance()), reverse=True)
    return (hi + 0.05) / (lo + 0.05)


if __name__ == "__main__":
    ratio = contrast(Color("#043A73"), Color("#FFFFFF"))
    print(f"{ratio:.2f}:1", "passes" if ratio >= AA and True else "fails")
