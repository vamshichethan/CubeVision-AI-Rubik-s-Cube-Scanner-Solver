#include "Validator.h"

#include "ParityValidator.h"
#include "PieceValidator.h"

#include <array>
#include <sstream>
#include <unordered_set>

namespace {
int colorIndex(Color color) {
    return static_cast<int>(color);
}

void setFailure(ValidationResult& result, ValidationLevel level) {
    if (result.isValid) {
        result.failedLevel = level;
    }
    result.isValid = false;
}
}

ValidationResult Validator::validate(const Cube& cube) const {
    ValidationResult result;
    const auto stickers = cube.colors();

    if (stickers.size() != 54) {
        result.errors.push_back("Cube must contain exactly 54 stickers.");
        setFailure(result, ValidationLevel::BASIC);
    }

    std::array<int, 6> counts{};
    for (Color color : stickers) {
        const int index = colorIndex(color);
        if (index < 0 || index >= static_cast<int>(counts.size())) {
            result.errors.push_back("Invalid/unknown sticker color exists.");
            setFailure(result, ValidationLevel::BASIC);
            continue;
        }
        ++counts[index];
    }

    const std::array<Color, 6> allColors = {
        Color::WHITE,
        Color::YELLOW,
        Color::RED,
        Color::ORANGE,
        Color::BLUE,
        Color::GREEN
    };

    for (Color color : allColors) {
        if (counts[colorIndex(color)] != 9) {
            std::ostringstream message;
            message << "Color " << colorToString(color) << " appears "
                    << counts[colorIndex(color)] << " times, expected 9";
            result.errors.push_back(message.str());
            setFailure(result, ValidationLevel::BASIC);
        }
    }

    std::unordered_set<int> centers;
    const std::array<CubeFace, 6> faces = {
        CubeFace::UP,
        CubeFace::DOWN,
        CubeFace::FRONT,
        CubeFace::BACK,
        CubeFace::LEFT,
        CubeFace::RIGHT
    };

    for (CubeFace cubeFace : faces) {
        centers.insert(colorIndex(cube.face(cubeFace).at(1, 1).color()));
    }

    if (centers.size() != 6) {
        result.errors.push_back("Center colors must be unique.");
        setFailure(result, ValidationLevel::CENTERS);
    }

    if (!result.errors.empty()) {
        return result;
    }

    PieceValidator pieceValidator;
    const PieceValidationData pieceData = pieceValidator.validatePieces(cube, result);
    if (!result.errors.empty()) {
        return result;
    }

    if (!cube.moveHistory().empty()) {
        result.warnings.push_back("Legal move history present; orientation and permutation parity are implied by the move sequence.");
        result.failedLevel = ValidationLevel::SOLVABLE;
        return result;
    }

    ParityValidator parityValidator;
    parityValidator.validateOrientation(pieceData, result);
    parityValidator.validatePermutation(pieceData, result);

    if (result.isValid) {
        result.failedLevel = ValidationLevel::SOLVABLE;
    }
    return result;
}
