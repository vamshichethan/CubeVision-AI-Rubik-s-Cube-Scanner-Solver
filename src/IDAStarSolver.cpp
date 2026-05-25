#include "IDAStarSolver.h"

#include "MoveOptimizer.h"

#include <algorithm>
#include <array>
#include <cmath>

IDAStarSolver::IDAStarSolver(int maxDepth, double timeoutMs)
    : maxDepth_(maxDepth), timeoutMs_(timeoutMs) {}

SolveResult IDAStarSolver::solve(const Cube& cube) {
    started_ = std::chrono::steady_clock::now();
    nodesExplored_ = 0;

    SolveResult result;
    if (cube.isSolved()) {
        result.success = true;
        result.message = "Cube is already solved.";
        return result;
    }

    for (int limit = heuristic(cube); limit <= maxDepth_; ++limit) {
        std::vector<Move> path;
        std::unordered_set<std::string> visited;
        Cube searchRoot = cube;
        searchRoot.clearHistory();

        if (depthLimitedSearch(searchRoot, 0, limit, std::nullopt, path, visited)) {
            result.success = true;
            result.moves = MoveOptimizer::simplify(path);
            result.totalMoves = static_cast<int>(result.moves.size());
            result.message = "IDA* scaffold found a solution within the depth limit.";
            break;
        }

        if (timedOut()) {
            result.message = "IDA* search timed out before reaching max depth.";
            break;
        }
    }

    if (!result.success && result.message.empty()) {
        result.message = "IDA* scaffold did not find a solution within max depth.";
    }

    const auto finished = std::chrono::steady_clock::now();
    result.timeTakenMs = std::chrono::duration<double, std::milli>(finished - started_).count();
    result.nodesExplored = nodesExplored_;
    return result;
}

int IDAStarSolver::heuristic(const Cube& cube) const {
    int misplaced = 0;
    int unsolvedFaces = 0;

    const std::array<CubeFace, 6> faces = {
        CubeFace::UP,
        CubeFace::DOWN,
        CubeFace::FRONT,
        CubeFace::BACK,
        CubeFace::LEFT,
        CubeFace::RIGHT
    };

    for (CubeFace face : faces) {
        const Color center = cube.face(face).at(1, 1).color();
        bool solvedFace = true;
        for (const auto& sticker : cube.face(face).stickers()) {
            if (sticker.color() != center) {
                ++misplaced;
                solvedFace = false;
            }
        }
        if (!solvedFace) {
            ++unsolvedFaces;
        }
    }

    return std::max(1, std::max(misplaced / 8, unsolvedFaces / 2));
}

bool IDAStarSolver::depthLimitedSearch(
    Cube cube,
    int depth,
    int limit,
    std::optional<MoveFace> previousFace,
    std::vector<Move>& path,
    std::unordered_set<std::string>& visited
) {
    ++nodesExplored_;

    if (cube.isSolved()) {
        return true;
    }
    if (timedOut()) {
        return false;
    }

    const int estimate = depth + heuristic(cube);
    if (estimate > limit || depth >= limit) {
        return false;
    }

    visited.insert(cube.stateKey());

    for (const auto& move : candidateMoves()) {
        if (previousFace.has_value() && *previousFace == move.face()) {
            continue;
        }

        Cube next = cube;
        next.applyMove(move, false);
        const std::string key = next.stateKey();
        if (visited.count(key) > 0) {
            continue;
        }

        path.push_back(move);
        if (depthLimitedSearch(next, depth + 1, limit, move.face(), path, visited)) {
            return true;
        }
        path.pop_back();
    }

    visited.erase(cube.stateKey());
    return false;
}

bool IDAStarSolver::timedOut() const {
    const auto now = std::chrono::steady_clock::now();
    const double elapsedMs = std::chrono::duration<double, std::milli>(now - started_).count();
    return elapsedMs > timeoutMs_;
}

std::vector<Move> IDAStarSolver::candidateMoves() {
    const std::array<MoveFace, 6> faces = {
        MoveFace::U,
        MoveFace::D,
        MoveFace::F,
        MoveFace::B,
        MoveFace::L,
        MoveFace::R
    };

    std::vector<Move> moves;
    moves.reserve(18);
    for (MoveFace face : faces) {
        moves.emplace_back(face, MoveDirection::CLOCKWISE);
        moves.emplace_back(face, MoveDirection::COUNTER_CLOCKWISE);
        moves.emplace_back(face, MoveDirection::HALF_TURN);
    }
    return moves;
}
