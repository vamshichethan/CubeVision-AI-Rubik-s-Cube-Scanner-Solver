#include "PieceValidator.h"

#include <algorithm>
#include <array>
#include <map>
#include <set>
#include <sstream>

namespace {
struct Vec3 {
    int x;
    int y;
    int z;
};

struct EdgePosition {
    std::string name;
    Vec3 position;
    std::array<Vec3, 2> normals;
};

struct CornerPosition {
    std::string name;
    Vec3 position;
    std::array<Vec3, 3> normals;
};

const std::array<EdgePosition, 12> EDGE_POSITIONS = {{
    {"UF", {0, 1, 1}, {{{0, 1, 0}, {0, 0, 1}}}},
    {"UR", {1, 1, 0}, {{{0, 1, 0}, {1, 0, 0}}}},
    {"UB", {0, 1, -1}, {{{0, 1, 0}, {0, 0, -1}}}},
    {"UL", {-1, 1, 0}, {{{0, 1, 0}, {-1, 0, 0}}}},
    {"FR", {1, 0, 1}, {{{0, 0, 1}, {1, 0, 0}}}},
    {"FL", {-1, 0, 1}, {{{0, 0, 1}, {-1, 0, 0}}}},
    {"BR", {1, 0, -1}, {{{0, 0, -1}, {1, 0, 0}}}},
    {"BL", {-1, 0, -1}, {{{0, 0, -1}, {-1, 0, 0}}}},
    {"DF", {0, -1, 1}, {{{0, -1, 0}, {0, 0, 1}}}},
    {"DR", {1, -1, 0}, {{{0, -1, 0}, {1, 0, 0}}}},
    {"DB", {0, -1, -1}, {{{0, -1, 0}, {0, 0, -1}}}},
    {"DL", {-1, -1, 0}, {{{0, -1, 0}, {-1, 0, 0}}}},
}};

const std::array<CornerPosition, 8> CORNER_POSITIONS = {{
    {"UFR", {1, 1, 1}, {{{0, 1, 0}, {0, 0, 1}, {1, 0, 0}}}},
    {"URB", {1, 1, -1}, {{{0, 1, 0}, {1, 0, 0}, {0, 0, -1}}}},
    {"UBL", {-1, 1, -1}, {{{0, 1, 0}, {0, 0, -1}, {-1, 0, 0}}}},
    {"ULF", {-1, 1, 1}, {{{0, 1, 0}, {-1, 0, 0}, {0, 0, 1}}}},
    {"DFR", {1, -1, 1}, {{{0, -1, 0}, {1, 0, 0}, {0, 0, 1}}}},
    {"DRB", {1, -1, -1}, {{{0, -1, 0}, {0, 0, -1}, {1, 0, 0}}}},
    {"DBL", {-1, -1, -1}, {{{0, -1, 0}, {-1, 0, 0}, {0, 0, -1}}}},
    {"DLF", {-1, -1, 1}, {{{0, -1, 0}, {0, 0, 1}, {-1, 0, 0}}}},
}};

CubeFace faceFromNormal(const Vec3& normal) {
    if (normal.y == 1) return CubeFace::UP;
    if (normal.y == -1) return CubeFace::DOWN;
    if (normal.z == 1) return CubeFace::FRONT;
    if (normal.z == -1) return CubeFace::BACK;
    if (normal.x == -1) return CubeFace::LEFT;
    return CubeFace::RIGHT;
}

std::pair<int, int> rowColFromPositionNormal(const Vec3& position, const Vec3& normal) {
    if (normal.y == 1) return {position.z + 1, position.x + 1};
    if (normal.y == -1) return {1 - position.z, position.x + 1};
    if (normal.z == 1) return {1 - position.y, position.x + 1};
    if (normal.z == -1) return {1 - position.y, 1 - position.x};
    if (normal.x == -1) return {1 - position.y, position.z + 1};
    return {1 - position.y, 1 - position.z};
}

Color stickerAt(const Cube& cube, const Vec3& position, const Vec3& normal) {
    const auto [row, col] = rowColFromPositionNormal(position, normal);
    return cube.face(faceFromNormal(normal)).at(row, col).color();
}

Color centerColor(const Cube& cube, const Vec3& normal) {
    return cube.face(faceFromNormal(normal)).at(1, 1).color();
}

bool isUpDownColor(Color color, Color up, Color down) {
    return color == up || color == down;
}

bool isFrontBackColor(Color color, Color front, Color back) {
    return color == front || color == back;
}

void setFailure(ValidationResult& result, ValidationLevel level) {
    if (result.isValid) {
        result.failedLevel = level;
    }
    result.isValid = false;
}

std::string missingMessage(const std::string& type, const std::string& key) {
    return "Missing " + type + " piece: " + key;
}

std::string duplicateMessage(const std::string& type, const std::string& key) {
    return "Duplicate " + type + " piece: " + key;
}
}

PieceValidationData PieceValidator::validatePieces(const Cube& cube, ValidationResult& result) const {
    PieceValidationData data;
    validateEdges(cube, result, data);
    validateCorners(cube, result, data);
    return data;
}

void PieceValidator::validateEdges(const Cube& cube, ValidationResult& result, PieceValidationData& data) const {
    std::map<std::string, int> validIndex;
    std::map<std::string, int> seen;

    for (std::size_t i = 0; i < EDGE_POSITIONS.size(); ++i) {
        const auto& position = EDGE_POSITIONS[i];
        EdgePiece solved({{
            centerColor(cube, position.normals[0]),
            centerColor(cube, position.normals[1])
        }}, position.name);
        validIndex[solved.key()] = static_cast<int>(i);
    }

    const Color up = cube.face(CubeFace::UP).at(1, 1).color();
    const Color down = cube.face(CubeFace::DOWN).at(1, 1).color();
    const Color front = cube.face(CubeFace::FRONT).at(1, 1).color();
    const Color back = cube.face(CubeFace::BACK).at(1, 1).color();

    for (const auto& position : EDGE_POSITIONS) {
        const std::array<Color, 2> colors = {{
            stickerAt(cube, position.position, position.normals[0]),
            stickerAt(cube, position.position, position.normals[1])
        }};
        EdgePiece edge(colors, position.name);
        const auto found = validIndex.find(edge.key());
        if (found == validIndex.end()) {
            result.errors.push_back("Invalid edge color combination: " + edge.key());
            setFailure(result, ValidationLevel::EDGES);
            continue;
        }

        ++seen[edge.key()];
        data.edgePermutation.push_back(found->second);

        int orientation = 0;
        for (int i = 0; i < 2; ++i) {
            if (isUpDownColor(colors[i], up, down)) {
                orientation = position.normals[i].y == 0 ? 1 : 0;
                break;
            }
            if (isFrontBackColor(colors[i], front, back)) {
                orientation = position.normals[i].z == 0 ? 1 : 0;
            }
        }
        data.edgeFlipSum += orientation;
    }

    for (const auto& [key, count] : seen) {
        if (count > 1) {
            result.errors.push_back(duplicateMessage("edge", key));
            setFailure(result, ValidationLevel::EDGES);
        }
    }

    for (const auto& [key, _] : validIndex) {
        if (seen[key] == 0) {
            result.errors.push_back(missingMessage("edge", key));
            setFailure(result, ValidationLevel::EDGES);
        }
    }
}

void PieceValidator::validateCorners(const Cube& cube, ValidationResult& result, PieceValidationData& data) const {
    std::map<std::string, int> validIndex;
    std::map<std::string, int> seen;

    for (std::size_t i = 0; i < CORNER_POSITIONS.size(); ++i) {
        const auto& position = CORNER_POSITIONS[i];
        CornerPiece solved({{
            centerColor(cube, position.normals[0]),
            centerColor(cube, position.normals[1]),
            centerColor(cube, position.normals[2])
        }}, position.name);
        validIndex[solved.key()] = static_cast<int>(i);
    }

    const Color up = cube.face(CubeFace::UP).at(1, 1).color();
    const Color down = cube.face(CubeFace::DOWN).at(1, 1).color();

    for (const auto& position : CORNER_POSITIONS) {
        const std::array<Color, 3> colors = {{
            stickerAt(cube, position.position, position.normals[0]),
            stickerAt(cube, position.position, position.normals[1]),
            stickerAt(cube, position.position, position.normals[2])
        }};
        CornerPiece corner(colors, position.name);
        const auto found = validIndex.find(corner.key());
        if (found == validIndex.end()) {
            result.errors.push_back("Invalid corner color combination: " + corner.key());
            setFailure(result, ValidationLevel::CORNERS);
            continue;
        }

        ++seen[corner.key()];
        data.cornerPermutation.push_back(found->second);

        const int homeLayerY = CORNER_POSITIONS[found->second].position.y;
        for (int i = 0; i < 3; ++i) {
            if (isUpDownColor(colors[i], up, down)) {
                if (position.normals[i].y != 0) {
                    data.cornerTwistSum += 0;
                } else if (homeLayerY == 1) {
                    data.cornerTwistSum += position.normals[i].x != 0 ? 1 : 2;
                } else {
                    data.cornerTwistSum += position.normals[i].x != 0 ? 2 : 1;
                }
                break;
            }
        }
    }

    for (const auto& [key, count] : seen) {
        if (count > 1) {
            result.errors.push_back(duplicateMessage("corner", key));
            setFailure(result, ValidationLevel::CORNERS);
        }
    }

    for (const auto& [key, _] : validIndex) {
        if (seen[key] == 0) {
            result.errors.push_back(missingMessage("corner", key));
            setFailure(result, ValidationLevel::CORNERS);
        }
    }
}
