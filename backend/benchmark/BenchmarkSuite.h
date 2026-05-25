#pragma once

#include "../../src/Cube.h"
#include "BenchmarkResult.h"

#include <string>
#include <vector>

enum class ScrambleDifficulty {
    Easy,
    Medium,
    Hard
};

struct BenchmarkReport {
    std::string scramble;
    std::string difficulty;
    std::vector<BenchmarkResult> results;
    std::string fastest;
    std::string shortest;
    std::string lowestMemory;
};

class BenchmarkSuite {
public:
    BenchmarkReport runAll(ScrambleDifficulty difficulty, int timeoutMs = 1500, long long maxNodes = 250000) const;

private:
    static int scrambleLength(ScrambleDifficulty difficulty);
    static std::string difficultyName(ScrambleDifficulty difficulty);
};
