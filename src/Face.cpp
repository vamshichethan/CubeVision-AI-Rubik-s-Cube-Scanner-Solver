#include "Face.h"

#include <algorithm>
#include <cctype>
#include <stdexcept>

Sticker::Sticker() : color_(Color::WHITE) {}

Sticker::Sticker(Color color) : color_(color) {}

Color Sticker::color() const {
    return color_;
}

void Sticker::setColor(Color color) {
    color_ = color;
}

Face::Face() {
    setAll(Color::WHITE);
}

Face::Face(Color color) {
    setAll(color);
}

const Sticker& Face::at(int row, int col) const {
    return stickers_.at(index(row, col));
}

Sticker& Face::at(int row, int col) {
    return stickers_.at(index(row, col));
}

const std::array<Sticker, 9>& Face::stickers() const {
    return stickers_;
}

std::array<Sticker, 9>& Face::stickers() {
    return stickers_;
}

void Face::setAll(Color color) {
    stickers_.fill(Sticker(color));
}

void Face::rotateClockwise() {
    const auto old = stickers_;
    stickers_[0] = old[6];
    stickers_[1] = old[3];
    stickers_[2] = old[0];
    stickers_[3] = old[7];
    stickers_[4] = old[4];
    stickers_[5] = old[1];
    stickers_[6] = old[8];
    stickers_[7] = old[5];
    stickers_[8] = old[2];
}

void Face::rotateCounterClockwise() {
    const auto old = stickers_;
    stickers_[0] = old[2];
    stickers_[1] = old[5];
    stickers_[2] = old[8];
    stickers_[3] = old[1];
    stickers_[4] = old[4];
    stickers_[5] = old[7];
    stickers_[6] = old[0];
    stickers_[7] = old[3];
    stickers_[8] = old[6];
}

void Face::print(std::ostream& out) const {
    for (int row = 0; row < 3; ++row) {
        for (int col = 0; col < 3; ++col) {
            out << colorToChar(at(row, col).color()) << ' ';
        }
        out << '\n';
    }
}

int Face::index(int row, int col) {
    if (row < 0 || row >= 3 || col < 0 || col >= 3) {
        throw std::out_of_range("Face index must be between 0 and 2");
    }
    return row * 3 + col;
}

std::string colorToString(Color color) {
    switch (color) {
        case Color::WHITE: return "WHITE";
        case Color::YELLOW: return "YELLOW";
        case Color::RED: return "RED";
        case Color::ORANGE: return "ORANGE";
        case Color::BLUE: return "BLUE";
        case Color::GREEN: return "GREEN";
    }
    return "UNKNOWN";
}

char colorToChar(Color color) {
    switch (color) {
        case Color::WHITE: return 'W';
        case Color::YELLOW: return 'Y';
        case Color::RED: return 'R';
        case Color::ORANGE: return 'O';
        case Color::BLUE: return 'B';
        case Color::GREEN: return 'G';
    }
    return '?';
}

bool colorFromChar(char input, Color& color) {
    switch (std::toupper(static_cast<unsigned char>(input))) {
        case 'W': color = Color::WHITE; return true;
        case 'Y': color = Color::YELLOW; return true;
        case 'R': color = Color::RED; return true;
        case 'O': color = Color::ORANGE; return true;
        case 'B': color = Color::BLUE; return true;
        case 'G': color = Color::GREEN; return true;
        default: return false;
    }
}
