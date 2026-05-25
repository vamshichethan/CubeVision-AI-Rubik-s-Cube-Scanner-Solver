#include "EdgePiece.h"

#include <algorithm>
#include <sstream>
#include <utility>

namespace {
std::string canonicalColorKey(std::array<Color, 2> colors) {
    std::sort(colors.begin(), colors.end(), [](Color left, Color right) {
        return static_cast<int>(left) < static_cast<int>(right);
    });

    std::ostringstream out;
    out << colorToString(colors[0]) << '-' << colorToString(colors[1]);
    return out.str();
}
}

EdgePiece::EdgePiece(std::array<Color, 2> colors, std::string position)
    : colors_(colors), position_(std::move(position)) {}

const std::array<Color, 2>& EdgePiece::colors() const {
    return colors_;
}

const std::string& EdgePiece::position() const {
    return position_;
}

std::string EdgePiece::key() const {
    return canonicalColorKey(colors_);
}

bool EdgePiece::samePieceIgnoringOrientation(const EdgePiece& other) const {
    return key() == other.key();
}
