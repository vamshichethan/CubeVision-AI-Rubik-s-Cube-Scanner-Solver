#pragma once

#include "Face.h"
#include "Move.h"

#include <array>
#include <iostream>
#include <random>
#include <string>
#include <vector>

enum class CubeFace {
    UP,
    DOWN,
    FRONT,
    BACK,
    LEFT,
    RIGHT
};

class Cube {
public:
    Cube();

    const Face& face(CubeFace face) const;
    Face& face(CubeFace face);

    void reset();
    void applyMove(const Move& move, bool recordHistory = true);
    void applyMoves(const std::vector<Move>& moves, bool printAfterEach = false, bool recordHistory = true);
    void print(std::ostream& out = std::cout) const;

    std::array<Color, 54> colors() const;
    bool isSolved() const;
    std::string stateKey() const;
    const std::vector<Move>& moveHistory() const;
    void clearHistory();
    bool readManualInput(std::istream& in = std::cin, std::ostream& out = std::cout);

    static std::vector<Move> generateScramble(int length);
    static std::string movesToString(const std::vector<Move>& moves);

private:
    std::array<Face, 6> faces_;
    std::vector<Move> moveHistory_;

    static int index(CubeFace face);
};
