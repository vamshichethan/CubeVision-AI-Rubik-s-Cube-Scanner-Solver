#pragma once

#include "Face.h"

#include <array>
#include <string>

class CornerPiece {
public:
    CornerPiece(std::array<Color, 3> colors, std::string position);

    const std::array<Color, 3>& colors() const;
    const std::string& position() const;
    std::string key() const;

    bool samePieceIgnoringOrientation(const CornerPiece& other) const;

private:
    std::array<Color, 3> colors_;
    std::string position_;
};
