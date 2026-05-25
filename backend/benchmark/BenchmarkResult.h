#pragma once

#include "../../src/Move.h"
#include "AlgorithmStats.h"

#include <string>
#include <vector>

struct BenchmarkResult {
    std::string algorithmName;
    bool success = false;
    int solutionLength = 0;
    double timeTakenMs = 0.0;
    long long nodesExplored = 0;
    double memoryUsedMB = 0.0;
    int maxDepthReached = 0;
    std::vector<Move> solution;
    std::string notes;
    AlgorithmStats stats;
};
