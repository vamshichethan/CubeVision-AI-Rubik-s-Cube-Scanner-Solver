#pragma once

#include "PieceValidator.h"
#include "ValidationResult.h"

class ParityValidator {
public:
    void validateOrientation(const PieceValidationData& data, ValidationResult& result) const;
    void validatePermutation(const PieceValidationData& data, ValidationResult& result) const;

private:
    static int permutationParity(const std::vector<int>& permutation);
};
