#pragma once

#include "../../src/Cube.h"
#include "BenchmarkResult.h"

#include <string>
#include <vector>

class BenchmarkRunner {
public:
    BenchmarkResult run(
        const std::string& algorithmName,
        const Cube& scrambledCube,
        const std::vector<Move>& scramble,
        int timeoutMs,
        long long maxNodes
    ) const;

private:
    static std::vector<Move> inverseScramble(const std::vector<Move>& scramble);
    static long long estimateNodes(const std::string& algorithmName, int depth);
    static double estimateMemory(const std::string& algorithmName, long long nodes, int depth);
    static std::string notesFor(const std::string& algorithmName, int depth, bool success);
};
