#include "BenchmarkSuite.h"

#include "BenchmarkRunner.h"

#include <algorithm>
#include <limits>

BenchmarkReport BenchmarkSuite::runAll(ScrambleDifficulty difficulty, int timeoutMs, long long maxNodes) const {
    const auto scrambleMoves = Cube::generateScramble(scrambleLength(difficulty));
    Cube cube;
    cube.applyMoves(scrambleMoves);

    BenchmarkRunner runner;
    BenchmarkReport report;
    report.scramble = Cube::movesToString(scrambleMoves);
    report.difficulty = difficultyName(difficulty);

    const std::vector<std::string> algorithms = {"BFS", "IDDFS", "A*", "IDA*", "Kociemba"};
    for (const auto& algorithm : algorithms) {
        report.results.push_back(runner.run(algorithm, cube, scrambleMoves, timeoutMs, maxNodes));
    }

    double bestTime = std::numeric_limits<double>::max();
    int bestLength = std::numeric_limits<int>::max();
    double bestMemory = std::numeric_limits<double>::max();

    for (const auto& result : report.results) {
        if (!result.success) continue;
        if (result.timeTakenMs < bestTime) {
            bestTime = result.timeTakenMs;
            report.fastest = result.algorithmName;
        }
        if (result.solutionLength < bestLength) {
            bestLength = result.solutionLength;
            report.shortest = result.algorithmName;
        }
        if (result.memoryUsedMB < bestMemory) {
            bestMemory = result.memoryUsedMB;
            report.lowestMemory = result.algorithmName;
        }
    }

    return report;
}

int BenchmarkSuite::scrambleLength(ScrambleDifficulty difficulty) {
    switch (difficulty) {
        case ScrambleDifficulty::Easy: return 5;
        case ScrambleDifficulty::Medium: return 9;
        case ScrambleDifficulty::Hard: return 16;
    }
    return 5;
}

std::string BenchmarkSuite::difficultyName(ScrambleDifficulty difficulty) {
    switch (difficulty) {
        case ScrambleDifficulty::Easy: return "Easy";
        case ScrambleDifficulty::Medium: return "Medium";
        case ScrambleDifficulty::Hard: return "Hard";
    }
    return "Easy";
}
