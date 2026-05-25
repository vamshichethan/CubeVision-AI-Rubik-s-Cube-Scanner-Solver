#pragma once

#include <algorithm>

class MemoryTracker {
public:
    static double estimateMB(long long storedStates, int bytesPerState = 96) {
        const double bytes = static_cast<double>(std::max<long long>(storedStates, 1)) * bytesPerState;
        return bytes / (1024.0 * 1024.0);
    }
};
