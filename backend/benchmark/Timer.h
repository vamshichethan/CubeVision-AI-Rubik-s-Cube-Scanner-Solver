#pragma once

#include <chrono>

class Timer {
public:
    Timer() : started_(std::chrono::steady_clock::now()) {}

    double elapsedMs() const {
        const auto now = std::chrono::steady_clock::now();
        return std::chrono::duration<double, std::milli>(now - started_).count();
    }

private:
    std::chrono::steady_clock::time_point started_;
};
