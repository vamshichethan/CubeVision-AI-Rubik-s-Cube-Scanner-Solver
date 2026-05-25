#include "SolutionVerifier.h"

bool SolutionVerifier::verify(const Cube& scrambledCube, const std::vector<Move>& solution) {
    Cube candidate = scrambledCube;
    candidate.applyMoves(solution, false, false);
    return candidate.isSolved();
}
