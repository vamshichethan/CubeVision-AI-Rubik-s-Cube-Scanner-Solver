#pragma once

struct AlgorithmStats {
    long long nodesGenerated = 0;
    long long nodesExpanded = 0;
    long long pruningCount = 0;
    double branchingFactor = 0.0;
    int heuristicValue = 0;
};
