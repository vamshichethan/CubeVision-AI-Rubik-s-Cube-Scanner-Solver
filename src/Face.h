#pragma once

#include <array>
#include <iostream>
#include <string>

enum class Color {
    WHITE,
    YELLOW,
    RED,
    ORANGE,
    BLUE,
    GREEN
};

class Sticker {
public:
    Sticker();
    explicit Sticker(Color color);

    Color color() const;
    void setColor(Color color);

private:
    Color color_;
};

class Face {
public:
    Face();
    explicit Face(Color color);

    const Sticker& at(int row, int col) const;
    Sticker& at(int row, int col);

    const std::array<Sticker, 9>& stickers() const;
    std::array<Sticker, 9>& stickers();

    void setAll(Color color);
    void rotateClockwise();
    void rotateCounterClockwise();
    void print(std::ostream& out) const;

private:
    std::array<Sticker, 9> stickers_;

    static int index(int row, int col);
};

std::string colorToString(Color color);
char colorToChar(Color color);
bool colorFromChar(char input, Color& color);
