#pragma once

#include "Cube.h"
#include "SolveResult.h"

class Solver {
public:
    virtual ~Solver() = default;
    virtual SolveResult solve(const Cube& cube) = 0;
};
