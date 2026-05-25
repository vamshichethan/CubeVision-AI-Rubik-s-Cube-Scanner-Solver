#pragma once

#include "Cube.h"
#include "Move.h"

#include <vector>

class SolutionVerifier {
public:
    static bool verify(const Cube& scrambledCube, const std::vector<Move>& solution);
};
