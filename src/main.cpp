#include "../backend/benchmark/BenchmarkSuite.h"
#include "Cube.h"

#include <iomanip>
#include <iostream>
#include <string>

namespace {
void printBenchmarkReport(const BenchmarkReport& report) {
    std::cout << "CubeVision AI - Phase 6 Algorithm Benchmark\n\n";
    std::cout << "Scramble: " << report.scramble << "\n";
    std::cout << "Difficulty: " << report.difficulty << "\n\n";

    std::cout << std::left
              << std::setw(12) << "Algorithm"
              << std::setw(10) << "Status"
              << std::setw(8) << "Moves"
              << std::setw(12) << "Time(ms)"
              << std::setw(12) << "Memory(MB)"
              << std::setw(14) << "Nodes"
              << std::setw(10) << "MaxDepth"
              << "\n";

    for (const auto& result : report.results) {
        std::cout << std::left
                  << std::setw(12) << result.algorithmName
                  << std::setw(10) << (result.success ? "OK" : "TIMEOUT")
                  << std::setw(8) << result.solutionLength
                  << std::setw(12) << std::fixed << std::setprecision(2) << result.timeTakenMs
                  << std::setw(12) << std::fixed << std::setprecision(2) << result.memoryUsedMB
                  << std::setw(14) << result.nodesExplored
                  << std::setw(10) << result.maxDepthReached
                  << "\n";
    }

    std::cout << "\nBest:\n";
    std::cout << "  Fastest: " << report.fastest << "\n";
    std::cout << "  Shortest: " << report.shortest << "\n";
    std::cout << "  Lowest memory: " << report.lowestMemory << "\n";
}
}

int main() {
    BenchmarkSuite suite;
    printBenchmarkReport(suite.runAll(ScrambleDifficulty::Easy, 1500, 1000000));
    return 0;
}
