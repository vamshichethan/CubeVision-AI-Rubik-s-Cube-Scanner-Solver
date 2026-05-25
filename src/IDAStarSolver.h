#pragma once

#include "Solver.h"

#include <chrono>
#include <optional>
#include <unordered_set>

class IDAStarSolver : public Solver {
public:
    explicit IDAStarSolver(int maxDepth = 7, double timeoutMs = 250.0);

    SolveResult solve(const Cube& cube) override;

private:
    int maxDepth_;
    double timeoutMs_;
    long long nodesExplored_ = 0;
    std::chrono::steady_clock::time_point started_;

    int heuristic(const Cube& cube) const;
    bool depthLimitedSearch(
        Cube cube,
        int depth,
        int limit,
        std::optional<MoveFace> previousFace,
        std::vector<Move>& path,
        std::unordered_set<std::string>& visited
    );
    bool timedOut() const;
    static std::vector<Move> candidateMoves();
};
