#include "KociembaSolver.h"

SolveResult KociembaSolver::solve(const Cube& cube) {
    (void)cube;

    SolveResult result;
    result.success = false;
    result.message =
        "KociembaSolver is a Phase 2 scaffold. Future work will split solving into "
        "Phase 1 orientation/subgroup reduction and Phase 2 permutation inside that subgroup.";
    return result;
}
