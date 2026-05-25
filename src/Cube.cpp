#include "Cube.h"

#include <algorithm>
#include <chrono>
#include <iomanip>
#include <sstream>
#include <stdexcept>

namespace {
struct Vec3 {
    int x;
    int y;
    int z;

    bool operator==(const Vec3& other) const {
        return x == other.x && y == other.y && z == other.z;
    }
};

struct StickerLocation {
    CubeFace face;
    int row;
    int col;
};

struct StickerPose {
    Vec3 position;
    Vec3 normal;
};

int signForClockwiseQuarterTurn(MoveFace face) {
    // Clockwise means "as viewed from outside the rotating face".
    // With a right-handed coordinate system, positive-axis faces use -90
    // degrees and negative-axis faces use +90 degrees.
    switch (face) {
        case MoveFace::R:
        case MoveFace::U:
        case MoveFace::F:
            return -1;
        case MoveFace::L:
        case MoveFace::D:
        case MoveFace::B:
            return 1;
    }
    return 1;
}

Vec3 axisForMove(MoveFace face) {
    switch (face) {
        case MoveFace::R: return {1, 0, 0};
        case MoveFace::L: return {-1, 0, 0};
        case MoveFace::U: return {0, 1, 0};
        case MoveFace::D: return {0, -1, 0};
        case MoveFace::F: return {0, 0, 1};
        case MoveFace::B: return {0, 0, -1};
    }
    return {0, 0, 0};
}

bool isInLayer(const Vec3& position, MoveFace face) {
    switch (face) {
        case MoveFace::R: return position.x == 1;
        case MoveFace::L: return position.x == -1;
        case MoveFace::U: return position.y == 1;
        case MoveFace::D: return position.y == -1;
        case MoveFace::F: return position.z == 1;
        case MoveFace::B: return position.z == -1;
    }
    return false;
}

Vec3 rotateQuarterTurn(Vec3 value, MoveFace face, bool clockwise) {
    int sign = signForClockwiseQuarterTurn(face);
    if (!clockwise) {
        sign *= -1;
    }

    const Vec3 axis = axisForMove(face);
    if (axis.x != 0) {
        return {value.x, -sign * value.z, sign * value.y};
    }
    if (axis.y != 0) {
        return {sign * value.z, value.y, -sign * value.x};
    }
    return {-sign * value.y, sign * value.x, value.z};
}

StickerPose poseFromLocation(CubeFace face, int row, int col) {
    switch (face) {
        case CubeFace::UP:
            return {{col - 1, 1, row - 1}, {0, 1, 0}};
        case CubeFace::DOWN:
            return {{col - 1, -1, 1 - row}, {0, -1, 0}};
        case CubeFace::FRONT:
            return {{col - 1, 1 - row, 1}, {0, 0, 1}};
        case CubeFace::BACK:
            return {{1 - col, 1 - row, -1}, {0, 0, -1}};
        case CubeFace::LEFT:
            return {{-1, 1 - row, col - 1}, {-1, 0, 0}};
        case CubeFace::RIGHT:
            return {{1, 1 - row, 1 - col}, {1, 0, 0}};
    }
    return {{0, 0, 0}, {0, 0, 0}};
}

StickerLocation locationFromPose(const StickerPose& pose) {
    const auto& p = pose.position;
    const auto& n = pose.normal;

    if (n == Vec3{0, 1, 0}) {
        return {CubeFace::UP, p.z + 1, p.x + 1};
    }
    if (n == Vec3{0, -1, 0}) {
        return {CubeFace::DOWN, 1 - p.z, p.x + 1};
    }
    if (n == Vec3{0, 0, 1}) {
        return {CubeFace::FRONT, 1 - p.y, p.x + 1};
    }
    if (n == Vec3{0, 0, -1}) {
        return {CubeFace::BACK, 1 - p.y, 1 - p.x};
    }
    if (n == Vec3{-1, 0, 0}) {
        return {CubeFace::LEFT, 1 - p.y, p.z + 1};
    }
    if (n == Vec3{1, 0, 0}) {
        return {CubeFace::RIGHT, 1 - p.y, 1 - p.z};
    }

    throw std::logic_error("Invalid sticker pose");
}

std::string faceName(CubeFace face) {
    switch (face) {
        case CubeFace::UP: return "UP";
        case CubeFace::DOWN: return "DOWN";
        case CubeFace::FRONT: return "FRONT";
        case CubeFace::BACK: return "BACK";
        case CubeFace::LEFT: return "LEFT";
        case CubeFace::RIGHT: return "RIGHT";
    }
    return "UNKNOWN";
}
}

Cube::Cube() {
    reset();
}

const Face& Cube::face(CubeFace face) const {
    return faces_.at(index(face));
}

Face& Cube::face(CubeFace face) {
    return faces_.at(index(face));
}

void Cube::reset() {
    face(CubeFace::UP).setAll(Color::WHITE);
    face(CubeFace::DOWN).setAll(Color::YELLOW);
    face(CubeFace::FRONT).setAll(Color::GREEN);
    face(CubeFace::BACK).setAll(Color::BLUE);
    face(CubeFace::LEFT).setAll(Color::ORANGE);
    face(CubeFace::RIGHT).setAll(Color::RED);
    moveHistory_.clear();
}

void Cube::applyMove(const Move& move, bool recordHistory) {
    const int turns = move.isHalfTurn() ? 2 : 1;

    for (int turn = 0; turn < turns; ++turn) {
        auto nextFaces = faces_;

        // Every sticker is represented by a 3D position and an outward normal.
        // A face move rotates all stickers in that layer; this avoids fragile
        // hand-written edge cycles and keeps later solver work easier to reason about.
        for (int faceIdx = 0; faceIdx < 6; ++faceIdx) {
            CubeFace currentFace = static_cast<CubeFace>(faceIdx);
            for (int row = 0; row < 3; ++row) {
                for (int col = 0; col < 3; ++col) {
                    StickerPose pose = poseFromLocation(currentFace, row, col);
                    if (isInLayer(pose.position, move.face())) {
                        pose.position = rotateQuarterTurn(pose.position, move.face(), move.isClockwise());
                        pose.normal = rotateQuarterTurn(pose.normal, move.face(), move.isClockwise());
                    }
                    const auto target = locationFromPose(pose);
                    nextFaces[index(target.face)].at(target.row, target.col) = face(currentFace).at(row, col);
                }
            }
        }

        faces_ = nextFaces;
    }

    if (recordHistory) {
        moveHistory_.push_back(move);
    }
}

void Cube::applyMoves(const std::vector<Move>& moves, bool printAfterEach, bool recordHistory) {
    for (const auto& move : moves) {
        applyMove(move, recordHistory);
        if (printAfterEach) {
            std::cout << "\nAfter " << move.toString() << ":\n";
            print();
        }
    }
}

void Cube::print(std::ostream& out) const {
    const std::array<CubeFace, 6> order = {
        CubeFace::UP,
        CubeFace::DOWN,
        CubeFace::FRONT,
        CubeFace::BACK,
        CubeFace::LEFT,
        CubeFace::RIGHT
    };

    for (CubeFace cubeFace : order) {
        out << faceName(cubeFace) << " face:\n";
        face(cubeFace).print(out);
        out << '\n';
    }
}

std::array<Color, 54> Cube::colors() const {
    std::array<Color, 54> result{};
    int cursor = 0;
    for (const auto& currentFace : faces_) {
        for (const auto& sticker : currentFace.stickers()) {
            result[cursor++] = sticker.color();
        }
    }
    return result;
}

bool Cube::isSolved() const {
    const std::array<CubeFace, 6> order = {
        CubeFace::UP,
        CubeFace::DOWN,
        CubeFace::FRONT,
        CubeFace::BACK,
        CubeFace::LEFT,
        CubeFace::RIGHT
    };

    for (CubeFace cubeFace : order) {
        const Color center = face(cubeFace).at(1, 1).color();
        for (const auto& sticker : face(cubeFace).stickers()) {
            if (sticker.color() != center) {
                return false;
            }
        }
    }
    return true;
}

std::string Cube::stateKey() const {
    std::string key;
    key.reserve(54);
    for (Color color : colors()) {
        key.push_back(colorToChar(color));
    }
    return key;
}

const std::vector<Move>& Cube::moveHistory() const {
    return moveHistory_;
}

void Cube::clearHistory() {
    moveHistory_.clear();
}

bool Cube::readManualInput(std::istream& in, std::ostream& out) {
    const std::array<CubeFace, 6> order = {
        CubeFace::UP,
        CubeFace::DOWN,
        CubeFace::FRONT,
        CubeFace::BACK,
        CubeFace::LEFT,
        CubeFace::RIGHT
    };

    out << "Enter each face as 9 characters using W Y R O B G.\n";
    out << "Order: UP, DOWN, FRONT, BACK, LEFT, RIGHT.\n";

    auto updated = faces_;
    for (CubeFace cubeFace : order) {
        out << faceName(cubeFace) << ": ";
        std::string input;
        in >> input;
        if (input.size() != 9) {
            out << "Invalid input: each face needs exactly 9 stickers.\n";
            return false;
        }

        for (int i = 0; i < 9; ++i) {
            Color color;
            if (!colorFromChar(input[i], color)) {
                out << "Invalid color '" << input[i] << "'. Use W Y R O B G only.\n";
                return false;
            }
            updated[index(cubeFace)].stickers()[i].setColor(color);
        }
    }

    faces_ = updated;
    moveHistory_.clear();
    return true;
}

std::vector<Move> Cube::generateScramble(int length) {
    static std::mt19937 rng(
        static_cast<unsigned int>(std::chrono::steady_clock::now().time_since_epoch().count())
    );

    const std::array<MoveFace, 6> faces = {
        MoveFace::U,
        MoveFace::D,
        MoveFace::F,
        MoveFace::B,
        MoveFace::L,
        MoveFace::R
    };

    std::uniform_int_distribution<int> faceDist(0, static_cast<int>(faces.size() - 1));
    std::uniform_int_distribution<int> directionDist(0, 1);

    std::vector<Move> scramble;
    scramble.reserve(length);

    std::optional<MoveFace> previousFace;
    while (static_cast<int>(scramble.size()) < length) {
        MoveFace nextFace = faces[faceDist(rng)];
        if (previousFace.has_value() && *previousFace == nextFace) {
            continue;
        }
        previousFace = nextFace;
        MoveDirection direction = directionDist(rng) == 0
            ? MoveDirection::CLOCKWISE
            : MoveDirection::COUNTER_CLOCKWISE;
        scramble.emplace_back(nextFace, direction);
    }

    return scramble;
}

std::string Cube::movesToString(const std::vector<Move>& moves) {
    std::ostringstream out;
    for (std::size_t i = 0; i < moves.size(); ++i) {
        if (i > 0) {
            out << ' ';
        }
        out << moves[i].toString();
    }
    return out.str();
}

int Cube::index(CubeFace face) {
    return static_cast<int>(face);
}
