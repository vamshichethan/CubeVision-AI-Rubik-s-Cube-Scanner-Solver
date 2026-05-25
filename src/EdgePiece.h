#pragma once

#include "Face.h"

#include <array>
#include <string>

class EdgePiece {
public:
    EdgePiece(std::array<Color, 2> colors, std::string position);

    const std::array<Color, 2>& colors() const;
    const std::string& position() const;
    std::string key() const;

    bool samePieceIgnoringOrientation(const EdgePiece& other) const;

private:
    std::array<Color, 2> colors_;
    std::string position_;
};
