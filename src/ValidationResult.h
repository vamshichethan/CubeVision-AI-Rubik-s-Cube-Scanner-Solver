#pragma once

#include <string>
#include <vector>

enum class ValidationLevel {
    BASIC,
    CENTERS,
    EDGES,
    CORNERS,
    ORIENTATION,
    PARITY,
    SOLVABLE
};

struct ValidationResult {
    bool isValid = true;
    std::vector<std::string> errors;
    std::vector<std::string> warnings;
    ValidationLevel failedLevel = ValidationLevel::SOLVABLE;
};

std::string validationLevelToString(ValidationLevel level);
