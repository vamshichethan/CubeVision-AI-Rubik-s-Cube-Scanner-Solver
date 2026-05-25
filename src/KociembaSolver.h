#pragma once

#include "Solver.h"

class KociembaSolver : public Solver {
public:
    SolveResult solve(const Cube& cube) override;
};
