#pragma once

#include "Solver.h"

class LayerByLayerSolver : public Solver {
public:
    SolveResult solve(const Cube& cube) override;

private:
    static SolvePhase makePhase(
        const std::string& name,
        const std::string& goal,
        const std::vector<Move>& moves,
        int remainingMoves
    );
};
