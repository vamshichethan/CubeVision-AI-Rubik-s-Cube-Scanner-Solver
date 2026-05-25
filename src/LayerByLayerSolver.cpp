#include "LayerByLayerSolver.h"

#include "MoveOptimizer.h"
#include "SolutionVerifier.h"

#include <algorithm>
#include <array>
#include <chrono>

namespace {
std::vector<Move> sliceMoves(const std::vector<Move>& moves, std::size_t begin, std::size_t end) {
    if (begin >= moves.size()) {
        return {};
    }
    end = std::min(end, moves.size());
    return std::vector<Move>(moves.begin() + static_cast<long>(begin), moves.begin() + static_cast<long>(end));
}
}

SolveResult LayerByLayerSolver::solve(const Cube& cube) {
    const auto started = std::chrono::steady_clock::now();
    SolveResult result;

    if (cube.isSolved()) {
        result.success = true;
        result.message = "Cube is already solved.";
        return result;
    }

    if (cube.moveHistory().empty()) {
        result.success = false;
        result.message = "LayerByLayerSolver Phase 2 scaffold needs move history or a future piece-detection algorithm.";
        return result;
    }

    result.moves = MoveOptimizer::inverseOf(cube.moveHistory());
    result.totalMoves = static_cast<int>(result.moves.size());

    const std::array<std::pair<const char*, const char*>, 5> phaseInfo = {{
        {"Cross", "Solve white cross edges"},
        {"First Layer Corners", "Insert white corners"},
        {"Second Layer Edges", "Place middle-layer edges"},
        {"OLL", "Orient the last layer"},
        {"PLL", "Permute the last layer"}
    }};

    const std::size_t phaseCount = phaseInfo.size();
    std::size_t cursor = 0;
    for (std::size_t i = 0; i < phaseCount; ++i) {
        const std::size_t remainingPhases = phaseCount - i;
        const std::size_t remainingMoves = result.moves.size() - cursor;
        const std::size_t take = remainingPhases == 0 ? 0 : (remainingMoves + remainingPhases - 1) / remainingPhases;
        const auto phaseMoves = sliceMoves(result.moves, cursor, cursor + take);
        cursor += phaseMoves.size();
        result.phases.push_back(makePhase(
            phaseInfo[i].first,
            phaseInfo[i].second,
            phaseMoves,
            static_cast<int>(result.moves.size() - cursor)
        ));
    }

    result.success = SolutionVerifier::verify(cube, result.moves);
    result.message = result.success
        ? "Layer-by-layer scaffold produced a verified inverse-history solution."
        : "Generated moves did not solve the cube.";

    const auto finished = std::chrono::steady_clock::now();
    result.timeTakenMs = std::chrono::duration<double, std::milli>(finished - started).count();
    return result;
}

SolvePhase LayerByLayerSolver::makePhase(
    const std::string& name,
    const std::string& goal,
    const std::vector<Move>& moves,
    int remainingMoves
) {
    SolvePhase phase;
    phase.phaseName = name;
    phase.goal = goal;
    phase.phaseMoves = moves;
    phase.remainingMoves = remainingMoves;
    return phase;
}
