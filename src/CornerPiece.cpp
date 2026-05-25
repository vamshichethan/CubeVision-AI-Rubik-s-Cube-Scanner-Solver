#include "CornerPiece.h"

#include <algorithm>
#include <sstream>
#include <utility>

namespace {
std::string canonicalColorKey(std::array<Color, 3> colors) {
    std::sort(colors.begin(), colors.end(), [](Color left, Color right) {
        return static_cast<int>(left) < static_cast<int>(right);
    });

    std::ostringstream out;
    out << colorToString(colors[0]) << '-' << colorToString(colors[1]) << '-' << colorToString(colors[2]);
    return out.str();
}
}

CornerPiece::CornerPiece(std::array<Color, 3> colors, std::string position)
    : colors_(colors), position_(std::move(position)) {}

const std::array<Color, 3>& CornerPiece::colors() const {
    return colors_;
}

const std::string& CornerPiece::position() const {
    return position_;
}

std::string CornerPiece::key() const {
    return canonicalColorKey(colors_);
}

bool CornerPiece::samePieceIgnoringOrientation(const CornerPiece& other) const {
    return key() == other.key();
}
