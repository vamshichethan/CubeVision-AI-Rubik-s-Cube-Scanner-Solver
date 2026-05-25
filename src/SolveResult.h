#pragma once

#include "Move.h"

#include <string>
#include <vector>

struct SolvePhase {
    std::string phaseName;
    std::vector<Move> phaseMoves;
    std::string goal;
    int remainingMoves = 0;
};

struct SolveResult {
    bool success = false;
    std::vector<Move> moves;
    std::vector<SolvePhase> phases;
    int totalMoves = 0;
    double timeTakenMs = 0.0;
    long long nodesExplored = 0;
    std::string message;
};
