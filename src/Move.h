#pragma once

#include <optional>
#include <string>
#include <vector>

enum class MoveFace {
    U,
    D,
    F,
    B,
    L,
    R
};

enum class MoveDirection {
    CLOCKWISE,
    COUNTER_CLOCKWISE,
    HALF_TURN
};

class Move {
public:
    Move(MoveFace face, MoveDirection direction = MoveDirection::CLOCKWISE);

    MoveFace face() const;
    MoveDirection direction() const;
    bool isClockwise() const;
    bool isHalfTurn() const;
    int quarterTurns() const;
    Move inverse() const;
    std::string toString() const;

    static std::optional<Move> parse(const std::string& token);
    static std::vector<Move> parseSequence(const std::string& line);

private:
    MoveFace face_;
    MoveDirection direction_;
};
