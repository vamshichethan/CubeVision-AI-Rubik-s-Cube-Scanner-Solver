#include "ParityValidator.h"

namespace {
void setFailure(ValidationResult& result, ValidationLevel level) {
    if (result.isValid) {
        result.failedLevel = level;
    }
    result.isValid = false;
}
}

void ParityValidator::validateOrientation(const PieceValidationData& data, ValidationResult& result) const {
    // A legal move flips either zero or two/four edges, so the total edge
    // orientation sum must remain even.
    if (data.edgePermutation.size() == 12 && data.edgeFlipSum % 2 != 0) {
        result.errors.push_back("Edge flip parity failed");
        setFailure(result, ValidationLevel::ORIENTATION);
    }

    // Corner twists are conserved modulo 3. A single twisted corner cannot be
    // created by legal face turns.
    if (data.cornerPermutation.size() == 8 && data.cornerTwistSum % 3 != 0) {
        result.errors.push_back("Corner twist parity failed");
        setFailure(result, ValidationLevel::ORIENTATION);
    }
}

void ParityValidator::validatePermutation(const PieceValidationData& data, ValidationResult& result) const {
    if (data.edgePermutation.size() != 12 || data.cornerPermutation.size() != 8) {
        return;
    }

    const int edgeParity = permutationParity(data.edgePermutation);
    const int cornerParity = permutationParity(data.cornerPermutation);
    if (edgeParity != cornerParity) {
        result.errors.push_back("Edge and corner permutation parity mismatch");
        result.errors.push_back("Cube state is valid by color count but physically unsolvable");
        setFailure(result, ValidationLevel::PARITY);
    }
}

int ParityValidator::permutationParity(const std::vector<int>& permutation) {
    int inversions = 0;
    for (std::size_t i = 0; i < permutation.size(); ++i) {
        for (std::size_t j = i + 1; j < permutation.size(); ++j) {
            if (permutation[i] > permutation[j]) {
                ++inversions;
            }
        }
    }
    return inversions % 2;
}
