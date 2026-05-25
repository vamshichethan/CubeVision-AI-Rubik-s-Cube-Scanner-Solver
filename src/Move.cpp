#include "Move.h"

#include <cctype>
#include <sstream>

Move::Move(MoveFace face, MoveDirection direction)
    : face_(face), direction_(direction) {}

MoveFace Move::face() const {
    return face_;
}

MoveDirection Move::direction() const {
    return direction_;
}

bool Move::isClockwise() const {
    return direction_ == MoveDirection::CLOCKWISE;
}

bool Move::isHalfTurn() const {
    return direction_ == MoveDirection::HALF_TURN;
}

int Move::quarterTurns() const {
    switch (direction_) {
        case MoveDirection::CLOCKWISE: return 1;
        case MoveDirection::HALF_TURN: return 2;
        case MoveDirection::COUNTER_CLOCKWISE: return 3;
    }
    return 0;
}

Move Move::inverse() const {
    switch (direction_) {
        case MoveDirection::CLOCKWISE:
            return Move(face_, MoveDirection::COUNTER_CLOCKWISE);
        case MoveDirection::COUNTER_CLOCKWISE:
            return Move(face_, MoveDirection::CLOCKWISE);
        case MoveDirection::HALF_TURN:
            return Move(face_, MoveDirection::HALF_TURN);
    }
    return *this;
}

std::string Move::toString() const {
    char symbol = '?';
    switch (face_) {
        case MoveFace::U: symbol = 'U'; break;
        case MoveFace::D: symbol = 'D'; break;
        case MoveFace::F: symbol = 'F'; break;
        case MoveFace::B: symbol = 'B'; break;
        case MoveFace::L: symbol = 'L'; break;
        case MoveFace::R: symbol = 'R'; break;
    }

    std::string result(1, symbol);
    if (direction_ == MoveDirection::COUNTER_CLOCKWISE) {
        result += '\'';
    } else if (direction_ == MoveDirection::HALF_TURN) {
        result += '2';
    }
    return result;
}

std::optional<Move> Move::parse(const std::string& token) {
    if (token.empty() || token.size() > 2) {
        return std::nullopt;
    }

    MoveFace face;
    switch (std::toupper(static_cast<unsigned char>(token[0]))) {
        case 'U': face = MoveFace::U; break;
        case 'D': face = MoveFace::D; break;
        case 'F': face = MoveFace::F; break;
        case 'B': face = MoveFace::B; break;
        case 'L': face = MoveFace::L; break;
        case 'R': face = MoveFace::R; break;
        default: return std::nullopt;
    }

    if (token.size() == 1) {
        return Move(face);
    }
    if (token[1] == '\'') {
        return Move(face, MoveDirection::COUNTER_CLOCKWISE);
    }
    if (token[1] == '2') {
        return Move(face, MoveDirection::HALF_TURN);
    }
    return std::nullopt;
}

std::vector<Move> Move::parseSequence(const std::string& line) {
    std::vector<Move> moves;
    std::istringstream input(line);
    std::string token;

    while (input >> token) {
        auto move = parse(token);
        if (!move.has_value()) {
            moves.clear();
            return moves;
        }
        moves.push_back(*move);
    }

    return moves;
}
