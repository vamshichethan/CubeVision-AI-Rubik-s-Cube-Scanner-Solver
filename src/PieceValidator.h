#pragma once

#include "CornerPiece.h"
#include "Cube.h"
#include "EdgePiece.h"
#include "ValidationResult.h"

#include <vector>

struct PieceValidationData {
    std::vector<int> edgePermutation;
    std::vector<int> cornerPermutation;
    int edgeFlipSum = 0;
    int cornerTwistSum = 0;
};

class PieceValidator {
public:
    PieceValidationData validatePieces(const Cube& cube, ValidationResult& result) const;

private:
    void validateEdges(const Cube& cube, ValidationResult& result, PieceValidationData& data) const;
    void validateCorners(const Cube& cube, ValidationResult& result, PieceValidationData& data) const;
};
