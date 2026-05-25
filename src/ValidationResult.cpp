#include "ValidationResult.h"

std::string validationLevelToString(ValidationLevel level) {
    switch (level) {
        case ValidationLevel::BASIC: return "BASIC";
        case ValidationLevel::CENTERS: return "CENTERS";
        case ValidationLevel::EDGES: return "EDGES";
        case ValidationLevel::CORNERS: return "CORNERS";
        case ValidationLevel::ORIENTATION: return "ORIENTATION";
        case ValidationLevel::PARITY: return "PARITY";
        case ValidationLevel::SOLVABLE: return "SOLVABLE";
    }
    return "UNKNOWN";
}
