#include "MoveOptimizer.h"

#include <algorithm>

namespace {
MoveDirection directionFromQuarterTurns(int turns) {
    switch (turns % 4) {
        case 1: return MoveDirection::CLOCKWISE;
        case 2: return MoveDirection::HALF_TURN;
        case 3: return MoveDirection::COUNTER_CLOCKWISE;
        default: return MoveDirection::CLOCKWISE;
    }
}
}

std::vector<Move> MoveOptimizer::simplify(const std::vector<Move>& moves) {
    std::vector<Move> optimized;

    for (const auto& move : moves) {
        if (!optimized.empty() && optimized.back().face() == move.face()) {
            int turns = (optimized.back().quarterTurns() + move.quarterTurns()) % 4;
            optimized.pop_back();
            if (turns != 0) {
                optimized.emplace_back(move.face(), directionFromQuarterTurns(turns));
            }
        } else {
            optimized.push_back(move);
        }
    }

    return optimized;
}

std::vector<Move> MoveOptimizer::inverseOf(const std::vector<Move>& moves) {
    std::vector<Move> inverse;
    inverse.reserve(moves.size());

    for (auto it = moves.rbegin(); it != moves.rend(); ++it) {
        inverse.push_back(it->inverse());
    }

    return simplify(inverse);
}
