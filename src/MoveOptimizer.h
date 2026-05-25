#pragma once

#include "Move.h"

#include <vector>

class MoveOptimizer {
public:
    static std::vector<Move> simplify(const std::vector<Move>& moves);
    static std::vector<Move> inverseOf(const std::vector<Move>& moves);
};
